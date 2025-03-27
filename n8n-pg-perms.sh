#!/bin/bash

# ==============================================================================
# Grant Necessary PostgreSQL Permissions for n8n
# ==============================================================================
#
# Description:
#   Connects to a PostgreSQL database and grants the required permissions
#   to the specified n8n database user, primarily focused on the 'public' schema.
#
# Usage:
#   ./grant_n8n_perms.sh [-H <host>] [-p <port>] [-d <dbname>] [-u <n8n_user>] [-U <admin_user>]
#
# Options:
#   -H <host>        Database server host (default: localhost)
#   -p <port>        Database server port (default: 5432)
#   -d <dbname>      Database name (default: n8n)
#   -u <n8n_user>    The database user n8n connects as (default: n8n)
#   -U <admin_user>  The PostgreSQL administrative user to run commands as
#                    (default: postgres, uses 'sudo -u postgres').
#                    If set to something else, uses 'psql -U <admin_user>'
#                    and may prompt for a password.
#   -h               Show this help message.
#
# Examples:
#   ./grant_n8n_perms.sh                    # Use all defaults
#   ./grant_n8n_perms.sh -d my_n8n_db       # Specify different DB name
#   ./grant_n8n_perms.sh -U db_owner        # Run as admin user 'db_owner'
#   ./grant_n8n_perms.sh -H db.example.com -U admin
#
# Note:
#   - If using '-U' with a user other than 'postgres', you might be prompted
#     for the admin user's password unless ~/.pgpass is configured.
#   - The script running this needs appropriate permissions (e.g., sudo rights
#     if using the default 'postgres' admin user).
# ==============================================================================

# --- Default Configuration ---
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="n8n"
N8N_USER="n8n"
ADMIN_USER="postgres" # Default admin user, assumes sudo access

# --- Command Line Argument Parsing ---
usage() {
    grep '^#' "$0" | cut -c 3-
    exit 1
}

while getopts "H:p:d:u:U:h" opt; do
    case $opt in
        H) DB_HOST="$OPTARG" ;;
        p) DB_PORT="$OPTARG" ;;
        d) DB_NAME="$OPTARG" ;;
        u) N8N_USER="$OPTARG" ;;
        U) ADMIN_USER="$OPTARG" ;;
        h) usage ;;
        \?) echo "Invalid option: -$OPTARG" >&2; usage ;;
    esac
done
shift $((OPTIND-1))

# --- SQL Commands ---
# Using a "here document" for readability and avoiding quoting issues.
# Using double quotes around variables within the heredoc allows variable expansion.
SQL_COMMANDS=$(cat <<-EOF
-- Grant usage on the public schema to the n8n user
GRANT USAGE ON SCHEMA public TO "${N8N_USER}";

-- Grant create rights on the public schema to the n8n user
GRANT CREATE ON SCHEMA public TO "${N8N_USER}";

-- Grant all privileges on all *existing* tables, sequences, and functions
-- in the public schema to the n8n user.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${N8N_USER}";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${N8N_USER}";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "${N8N_USER}";

-- IMPORTANT: Ensure the n8n user has privileges on *future* tables/sequences/functions
-- created within the public schema.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO "${N8N_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO "${N8N_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO "${N8N_USER}";

-- Optional but common: Grant connect privilege on the database itself
GRANT CONNECT ON DATABASE "${DB_NAME}" TO "${N8N_USER}";

-- Security Hardening: Revoke default excessive public privileges (recommended)
-- This prevents any user from creating objects in the public schema by default.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
-- This prevents any user from connecting to this specific database by default (CONNECT was granted explicitly above).
REVOKE ALL ON DATABASE "${DB_NAME}" FROM PUBLIC;

-- Informational: Show granted privileges on schema (optional check)
-- \dn+ public

EOF
)

# --- Execution ---
echo "Attempting to grant permissions..."
echo "  Database Host:  $DB_HOST"
echo "  Database Port:  $DB_PORT"
echo "  Database Name:  $DB_NAME"
echo "  Target User:    $N8N_USER"
echo "  Admin User:     $ADMIN_USER"
echo "---"

# Base psql command
# -v ON_ERROR_STOP=1 : Ensures the script exits if any SQL command fails
PSQL_CMD="psql -h \"${DB_HOST}\" -p \"${DB_PORT}\" -d \"${DB_NAME}\" -v ON_ERROR_STOP=1"

# Choose execution method based on admin user
if [[ "$ADMIN_USER" == "postgres" ]]; then
    # Use sudo for the 'postgres' user (common local setup)
    echo "Executing commands via: sudo -u $ADMIN_USER $PSQL_CMD"
    if sudo -u "$ADMIN_USER" $PSQL_CMD <<< "$SQL_COMMANDS"; then
        echo "---"
        echo "SUCCESS: Permissions granted successfully to user '$N8N_USER' on database '$DB_NAME'."
        exit 0
    else
        echo "---"
        echo "ERROR: Failed to grant permissions using 'sudo -u $ADMIN_USER'. Check psql output above and ensure:" >&2
        echo "  1. PostgreSQL server is running and accessible at $DB_HOST:$DB_PORT." >&2
        echo "  2. Database '$DB_NAME' exists." >&2
        echo "  3. User '$ADMIN_USER' exists and has administrative privileges." >&2
        echo "  4. The user running this script has 'sudo' rights for user '$ADMIN_USER'." >&2
        exit 1
    fi
else
     # Use standard psql connection for other users (might prompt for password)
     echo "Executing commands via: $PSQL_CMD -U $ADMIN_USER"
     echo "NOTE: You may be prompted for the password for PostgreSQL user '$ADMIN_USER'."
     echo "      For non-interactive use, consider configuring ~/.pgpass"
     echo "      See: https://www.postgresql.org/docs/current/libpq-pgpass.html"

    if $PSQL_CMD -U "$ADMIN_USER" <<< "$SQL_COMMANDS"; then
        echo "---"
        echo "SUCCESS: Permissions granted successfully to user '$N8N_USER' on database '$DB_NAME'."
        exit 0
    else
        echo "---"
        echo "ERROR: Failed to grant permissions using 'psql -U $ADMIN_USER'. Check psql output above and ensure:" >&2
        echo "  1. PostgreSQL server is running and accessible at $DB_HOST:$DB_PORT." >&2
        echo "  2. Database '$DB_NAME' exists." >&2
        echo "  3. User '$ADMIN_USER' exists, has administrative privileges, and the correct password was supplied (if prompted)." >&2
        exit 1
    fi
fi
