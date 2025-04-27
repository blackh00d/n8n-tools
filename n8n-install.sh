#!/bin/bash -e

# Script to install and configure n8n on Debian/Ubuntu systems using nvm.
# Runs n8n service as a dedicated 'n8n' user.
# Checks for existing installation, offers uninstall, and handles ufw firewall.

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')]: $*"
}

error_exit() {
  log "ERROR: $1"
  exit 1
}

# Function to display spinner
display_spinner() {
  local pid=$1
  local spin='-\|/'

  log "Loading..."

  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spin#?}
    printf "\r [%c]" "$spin"
    local spin=$temp${spin%"$temp"}
    sleep 0.1
  done
  printf "\r"
}

# Check for root privileges
check_root() {
  if [[ $(id -u) -ne 0 ]]; then
    echo "This script requires root privileges. Please run as root."
    exit 1
  fi
}

# Update and upgrade system packages
update_upgrade() {
  echo "Updating system packages..."
  sudo apt update -y
  sudo apt upgrade -y
}

# Install required packages
check_packages() {
  echo "Checking for required packages..."

  install_if_missing() {
    local package_name="$1"
    local check_command="$2"

    if ! eval "$check_command" > /dev/null 2>&1; then
      log "Installing $package_name..."
      sudo apt install "$package_name" -y || error_exit "Failed to install $package_name"
      log "$package_name installed successfully."
    else
      log "$package_name is already installed."
    fi
  }

  install_if_missing "build-essential" "command -v build-essential"
  install_if_missing "python3" "command -v python3"
}

# Install nvm (Node Version Manager)
install_nvm() {
  if command -v nvm > /dev/null; then
    echo "nvm is already installed."
    return
  fi

  log "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  source ~/.nvm/nvm.sh # Load nvm into the current shell
  log "nvm installed."
}

# Install Node.js using nvm
install_nodejs() {
  NVM_NODE_VERSION="v22" # Or "v22.x" for the latest v22
  if nvm ls | grep "$NVM_NODE_VERSION" > /dev/null; then
    echo "Node.js $NVM_NODE_VERSION is already installed via nvm."
    return
  fi

  log "Installing Node.js $NVM_NODE_VERSION via nvm..."
  nvm install "$NVM_NODE_VERSION"
  nvm use "$NVM_NODE_VERSION"
  log "Node.js $NVM_NODE_VERSION installed."
}

# Check if n8n is already installed
is_n8n_installed() {
  # Source nvm to make n8n command available
  source ~/.nvm/nvm.sh
  n8n --version > /dev/null 2>&1
  return $?
}

# Check if the n8n systemd service file exists
is_service_installed() {
  [ -f /etc/systemd/system/n8n.service ]
}

# Uninstall n8n and remove the service
uninstall_n8n() {
  echo "Uninstalling n8n..."
  sudo systemctl stop n8n || true
  sudo systemctl disable n8n || true
  sudo rm -f /etc/systemd/system/n8n.service
  sudo rm -rf /opt/n8n
  sudo npm uninstall -g n8n || true

  #Remove user.
  sudo userdel n8n || true

  sudo systemctl daemon-reload
  sudo systemctl reset-failed

  log "n8n uninstalled."
}

# Install n8n globally
install_n8n() {
  echo "Installing n8n globally..."
  # Source nvm to make npm available
  source ~/.nvm/nvm.sh
  npm install -g n8n
}

# Check if the n8n user exists; create if it doesn't
create_n8n_user() {
    id -u n8n >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo "Creating n8n user..."
        sudo useradd -r -M -s /usr/sbin/nologin n8n
    else
        echo "n8n user already exists."
    fi
}

# Configure the systemd service
configure_systemd_service() {
  echo "Configuring systemd service..."

  # Prompt user for how they want to expose the n8n instance
  read -p "Do you want to use a tunnel to expose n8n? (yes/no) [no]: " use_tunnel
  if [[ ${use_tunnel,,} == "yes" ]]; then
      n8n_args="start --tunnel"
  else
      n8n_args="start" # Standard start
  fi

  cat > /etc/systemd/system/n8n.service <<EOF
[Unit]
Description=n8n - Easily automate tasks across different services.
After=network.target

[Service]
Type=simple
User=n8n
Environment="NVM_DIR=/root/.nvm"
ExecStart=/bin/bash -c "source \$NVM_DIR/nvm.sh && nvm use v22 && /usr/local/bin/n8n $n8n_args"
Restart=on-failure

[Install]
WantedBy=multi-user.target
Alias=n8n.service
EOF

  sudo chown root:root /etc/systemd/system/n8n.service
  sudo chmod 644 /etc/systemd/system/n8n.service
}

# Enable and start the n8n service
enable_start_n8n_service() {
  echo "Enabling and starting n8n service..."
  sudo systemctl daemon-reload
  sudo systemctl enable n8n
  sudo systemctl start n8n
}

# Check if ufw is enabled and if port 5678 is allowed
check_ufw() {
  if command -v ufw > /dev/null; then
    sudo ufw status | grep "Status: active" > /dev/null
    if [ $? -eq 0 ]; then
      echo "ufw is active."
      sudo ufw status | grep "5678" > /dev/null
      if [ $? -ne 0 ]; then
        read -p "Port 5678 is not allowed by ufw. Do you want to allow it? (yes/no) [no]: " allow_port
        if [[ ${allow_port,,} == "yes" ]]; then
          sudo ufw allow 5678
          echo "Port 5678 allowed.  You may need to reload ufw for the change to take effect (sudo ufw reload)."
        fi
      else
        echo "Port 5678 is already allowed by ufw."
      fi
    else
      echo "ufw is not active."
    fi
  else
    echo "ufw is not installed."
  fi
}

# Main script execution
main() {
  check_root

  # Check for existing installation and offer uninstall
  if is_n8n_installed && is_service_installed; then
    read -p "n8n and its service are already installed. Do you want to uninstall? (yes/no) [no]: " uninstall
    if [[ ${uninstall,,} == "yes" ]]; then
      uninstall_n8n
    fi
  fi

  # If not uninstalled, proceed with installation
  if ! is_n8n_installed || ! is_service_installed; then
    update_upgrade
    check_packages
    install_nvm
    install_nodejs
    create_n8n_user
    install_n8n
    configure_systemd_service
    enable_start_n8n_service
    check_ufw
  fi

  echo "n8n installation complete."
  sudo systemctl status n8n
}

# Helper function to execute commands and display a spinner
execute_command() {
  local cmd="$*"
  log "Executing: $cmd"
  bash -c "$cmd" &
  display_spinner $!
}

main
