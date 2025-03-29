#!/bin/bash -e

# Script to install and configure Flowise on Debian/Ubuntu systems using npm global install.
# Runs Flowise service as a dedicated 'flowise' user.
# Prompts for username/password to be used in the service startup command.
# Checks for existing installation, offers uninstall, and handles ufw firewall.

FLOWISE_PACKAGE_NAME="flowise"
FLOWISE_USER="flowise"
FLOWISE_SERVICE_FILE="/etc/systemd/system/flowise.service"
# Flowise often stores data in its working directory. Let's create one.
FLOWISE_DATA_DIR="/var/lib/flowise"
FLOWISE_PORT="3000" # Default Flowise port

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')]: $*"
}

error_exit() {
  log "ERROR: $1"
  # Attempt cleanup might be less relevant here as npm handles files, but good practice
  # if [[ "$INSTALL_IN_PROGRESS" == "true" ]]; then
  #   log "Attempting to clean up..."
  #   # Minimal cleanup - maybe try uninstalling if install failed?
  #   npm uninstall -g "$FLOWISE_PACKAGE_NAME" || true
  # fi
  exit 1
}

# Function to display spinner (simplified)
display_spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    local msg=${2:-"Processing..."}
    echo -n "$msg "
    while ps -p $pid > /dev/null; do
        local temp=${spinstr#?}
        printf "[%c] " "${spinstr}"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b"
    done
    printf "    \b\b\b\b"
    echo ""
    wait $pid
    return $?
}

# Check for root privileges
check_root() {
  if [[ $(id -u) -ne 0 ]]; then
    echo "This script requires root privileges. Please run using 'sudo'."
    exit 1
  fi
}

# Update and upgrade system packages
update_upgrade() {
  log "Updating system package list..."
  apt update -y
  # log "Upgrading system packages..." # Optional
  # apt upgrade -y
}

# Install required packages
check_packages() {
  log "Checking for required packages..."
  local packages_needed=()

  needs_install() {
    local check_command="$1"
    if ! eval "$check_command" > /dev/null 2>&1; then
      return 0 # Needs install
    else
      return 1 # Already installed
    fi
  }

  if needs_install "command -v node"; then packages_needed+=("nodejs"); fi
  if needs_install "command -v npm"; then packages_needed+=("npm"); fi
  # npx usually comes with npm/nodejs, but check just in case
  if needs_install "command -v npx"; then packages_needed+=("npm"); fi # Re-add npm if npx missing
  # Keep build-essential as some global npm packages might compile native addons
  if needs_install "dpkg -s build-essential"; then packages_needed+=("build-essential"); fi

  # Remove duplicates
  packages_needed=($(printf "%s\n" "${packages_needed[@]}" | sort -u))

  if [[ ${#packages_needed[@]} -gt 0 ]]; then
    log "Installing missing packages: ${packages_needed[*]}"
    apt install "${packages_needed[@]}" -y || error_exit "Failed to install required packages."
    log "Required packages installed successfully."
  else
    log "Required packages (nodejs, npm, npx, build-essential) are already installed."
  fi

  # Optional: Check Node version
  node_version=$(node -v)
  log "Detected Node.js version: $node_version"
  # Add version check logic here if Flowise requires a specific minimum version
}

# Check if Flowise command exists (globally installed)
is_flowise_installed() {
  command -v "$FLOWISE_PACKAGE_NAME" > /dev/null 2>&1
}

# Check if the Flowise systemd service file exists
is_service_installed() {
  [ -f "$FLOWISE_SERVICE_FILE" ]
}

# Uninstall Flowise and remove the service
uninstall_flowise() {
  log "Uninstalling Flowise..."
  if systemctl list-units --full -all | grep -q "${FLOWISE_PACKAGE_NAME}.service"; then
      log "Stopping ${FLOWISE_PACKAGE_NAME} service..."
      systemctl stop "$FLOWISE_PACKAGE_NAME" || true # Ignore errors if not running
      log "Disabling ${FLOWISE_PACKAGE_NAME} service..."
      systemctl disable "$FLOWISE_PACKAGE_NAME" || true # Ignore errors if not enabled
  fi

  if [ -f "$FLOWISE_SERVICE_FILE" ]; then
      log "Removing systemd service file..."
      rm -f "$FLOWISE_SERVICE_FILE"
      log "Reloading systemd daemon..."
      systemctl daemon-reload
      systemctl reset-failed
  fi

  if is_flowise_installed; then
    log "Uninstalling global npm package '$FLOWISE_PACKAGE_NAME'..."
    npm uninstall -g "$FLOWISE_PACKAGE_NAME" &
    display_spinner $! "Uninstalling npm package..." || log "Warning: npm uninstall command failed. Manual removal might be needed."
  else
    log "Flowise npm package not found globally."
  fi

  if [ -d "$FLOWISE_DATA_DIR" ]; then
    log "Removing Flowise data directory: $FLOWISE_DATA_DIR..."
    # Add a prompt here? Or assume if uninstalling, data dir goes too.
    # read -p "WARNING: Remove data directory $FLOWISE_DATA_DIR? (yes/no) [no]: " remove_data
    # if [[ ${remove_data,,} == "yes" ]]; then
    #    rm -rf "$FLOWISE_DATA_DIR"
    #    log "Data directory removed."
    # else
    #    log "Data directory NOT removed."
    # fi
    # For now, automatically remove it during uninstall
    rm -rf "$FLOWISE_DATA_DIR"
    log "Data directory removed."
  fi

  if id "$FLOWISE_USER" &>/dev/null; then
    log "Removing user '$FLOWISE_USER'..."
    userdel "$FLOWISE_USER" || log "Warning: Failed to remove user '$FLOWISE_USER'. Manual removal might be needed."
  fi

  log "Flowise uninstallation process finished."
}

# Check if the Flowise user exists; create if it doesn't
create_flowise_user_and_dir() {
    if ! id "$FLOWISE_USER" &>/dev/null; then
        log "Creating system user '$FLOWISE_USER'..."
        useradd -r -M -s /usr/sbin/nologin "$FLOWISE_USER" || error_exit "Failed to create user '$FLOWISE_USER'."
        log "User '$FLOWISE_USER' created successfully."
    else
        log "User '$FLOWISE_USER' already exists."
    fi

    if [ ! -d "$FLOWISE_DATA_DIR" ]; then
        log "Creating data directory: $FLOWISE_DATA_DIR"
        mkdir -p "$FLOWISE_DATA_DIR" || error_exit "Failed to create data directory $FLOWISE_DATA_DIR."
    else
        log "Data directory $FLOWISE_DATA_DIR already exists."
    fi
    log "Setting ownership of $FLOWISE_DATA_DIR to $FLOWISE_USER..."
    chown -R "$FLOWISE_USER":"$FLOWISE_USER" "$FLOWISE_DATA_DIR"
}

# Install Flowise globally using npm
install_flowise() {
  # INSTALL_IN_PROGRESS=true
  log "Installing global npm package '$FLOWISE_PACKAGE_NAME' (this may take a while)..."
  npm install -g "$FLOWISE_PACKAGE_NAME" &
  display_spinner $! "Installing Flowise via npm..." || error_exit "Failed to install Flowise using 'npm install -g'."
  # INSTALL_IN_PROGRESS=false
  log "'$FLOWISE_PACKAGE_NAME' installed globally via npm."
}

# Configure the systemd service
configure_systemd_service() {
  log "Configuring systemd service ($FLOWISE_SERVICE_FILE)..."

  # --- Prompt for Credentials ---
  log "Please provide the credentials for the Flowise admin user."
  log "These will be stored in the systemd service file: $FLOWISE_SERVICE_FILE"
  read -p "Enter Flowise Username: " flowise_username
  if [ -z "$flowise_username" ]; then
      error_exit "Flowise username cannot be empty."
  fi
  read -sp "Enter Flowise Password: " flowise_password
  echo # Add a newline after password input
  if [ -z "$flowise_password" ]; then
      error_exit "Flowise password cannot be empty."
  fi
  # Basic escaping for the password in case it contains special shell characters
  # This is NOT foolproof for all possible passwords, but handles common cases.
  # A more robust solution might involve base64 encoding/decoding or environment variables.
  escaped_password=$(printf '%q' "$flowise_password")
  # --- End Prompt ---


  # Find npx path
  NPX_EXEC_PATH=$(which npx)
  if [ -z "$NPX_EXEC_PATH" ]; then
      error_exit "Could not find npx executable path. Please ensure Node.js/npm is installed correctly."
  fi
  log "Using npx executable path: $NPX_EXEC_PATH"

  # Find flowise executable path (installed globally)
  FLOWISE_EXEC_PATH=$(which flowise)
   if [ -z "$FLOWISE_EXEC_PATH" ]; then
      # Sometimes 'which' doesn't find commands installed globally for other users until shell restart
      # Try to find it in common global paths if 'which' fails initially
      if [ -x "/usr/local/bin/flowise" ]; then
         FLOWISE_EXEC_PATH="/usr/local/bin/flowise"
      elif [ -x "/usr/bin/flowise" ]; then
         FLOWISE_EXEC_PATH="/usr/bin/flowise"
      else
         error_exit "Could not find flowise executable path even after checking common locations. Ensure 'npm install -g flowise' completed successfully."
      fi
   fi
  log "Using flowise executable path: $FLOWISE_EXEC_PATH"


  log "Creating systemd service file: $FLOWISE_SERVICE_FILE"
  cat > "$FLOWISE_SERVICE_FILE" <<EOF
[Unit]
Description=Flowise - Visual AI Orchestration Tool (npm global install)
After=network.target

[Service]
Type=simple
User=$FLOWISE_USER
WorkingDirectory=$FLOWISE_DATA_DIR
# Use npx to run the globally installed package
# Pass credentials directly as arguments. Ensure password escaping is sufficient.
ExecStart=$NPX_EXEC_PATH $FLOWISE_PACKAGE_NAME start --FLOWISE_USERNAME=$flowise_username --FLOWISE_PASSWORD=$escaped_password
# Alternative using Environment variables (potentially safer):
# Environment="FLOWISE_USERNAME=$flowise_username"
# Environment="FLOWISE_PASSWORD=$escaped_password" # Or better, use Systemd's Credentials/LoadCredential
# ExecStart=$NPX_EXEC_PATH $FLOWISE_PACKAGE_NAME start
Restart=on-failure
RestartSec=5s
# Environment="NODE_ENV=production" # Good practice, though Flowise might set this itself
# Environment="PORT=$FLOWISE_PORT" # Set port if not default 3000

[Install]
WantedBy=multi-user.target
EOF

  chown root:root "$FLOWISE_SERVICE_FILE"
  # Permissions: Owner read/write, Group read, Others read. Standard for service files.
  # Could use 600 if password exposure is a major concern, but 644 is typical.
  chmod 644 "$FLOWISE_SERVICE_FILE"
  log "Systemd service file created and configured."
  log "Username and password stored in $FLOWISE_SERVICE_FILE"
}

# Enable and start the Flowise service
enable_start_flowise_service() {
  log "Reloading systemd daemon..."
  systemctl daemon-reload
  log "Enabling Flowise service (${FLOWISE_PACKAGE_NAME}.service) to start on boot..."
  systemctl enable "$FLOWISE_PACKAGE_NAME" || error_exit "Failed to enable Flowise service."
  log "Starting Flowise service (${FLOWISE_PACKAGE_NAME}.service)..."
  systemctl start "$FLOWISE_PACKAGE_NAME" || error_exit "Failed to start Flowise service."
  log "Flowise service enabled and started."
}

# Check if ufw is enabled and if the Flowise port is allowed
check_ufw() {
  if command -v ufw > /dev/null; then
    if ufw status | grep -qw active; then
      log "ufw firewall is active."
      if ! ufw status | grep -qw "$FLOWISE_PORT"; then
        read -p "Port $FLOWISE_PORT (Flowise default) is not allowed by ufw. Do you want to allow it? (yes/no) [no]: " allow_port
        if [[ ${allow_port,,} == "yes" ]]; then
          ufw allow "$FLOWISE_PORT" || log "Warning: Failed to add ufw rule for port $FLOWISE_PORT."
          log "Port $FLOWISE_PORT allowed. You might need to run 'sudo ufw reload' if changes don't apply immediately."
        else
          log "Port $FLOWISE_PORT was not allowed. Flowise might be inaccessible from other machines."
        fi
      else
        log "Port $FLOWISE_PORT is already allowed by ufw."
      fi
    else
      log "ufw firewall is installed but not active."
    fi
  else
    log "ufw firewall is not installed. Skipping firewall check."
  fi
}

# Main script execution
main() {
  check_root
  # INSTALL_IN_PROGRESS=false # Flag for cleanup

  # Check for existing installation and offer uninstall
  # Check both command and service file
  if is_flowise_installed || is_service_installed; then
    log "An existing Flowise installation (command or service file) was detected."
    read -p "Do you want to uninstall the existing version first? (yes/no) [no]: " uninstall_choice
    if [[ ${uninstall_choice,,} == "yes" ]]; then
      uninstall_flowise
      log "Proceeding with new installation..."
    else
      log "Skipping installation as an existing version was detected and not removed."
      log "To reinstall, run the script again and choose 'yes' to uninstall."
      exit 0
    fi
  fi

  # Proceed with installation
  log "Starting Flowise setup (using global npm install)..."
  update_upgrade
  check_packages
  create_flowise_user_and_dir
  install_flowise # Installs globally
  configure_systemd_service # Prompts for user/pass
  enable_start_flowise_service
  check_ufw

  log "----------------------------------------"
  log "Flowise installation and setup complete!"
  log "----------------------------------------"
  log "Flowise should be running as a service: ${FLOWISE_PACKAGE_NAME}.service"
  log "You can check its status with: sudo systemctl status ${FLOWISE_PACKAGE_NAME}"
  server_ip=$(hostname -I | awk '{print $1}')
  log "Try accessing Flowise at: http://$server_ip:$FLOWISE_PORT"
  log "Login using the username and password you provided during setup."
  log "If using a firewall (like ufw), ensure port $FLOWISE_PORT is open."
  log "To view logs: sudo journalctl -u ${FLOWISE_PACKAGE_NAME} -f"
  log "Service configuration (contains credentials): $FLOWISE_SERVICE_FILE"
  log "Data directory: $FLOWISE_DATA_DIR"
}

# --- Script Start ---
main
# --- Script End ---
