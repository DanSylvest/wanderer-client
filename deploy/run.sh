echo 'Start installing 6';

ROOT=$(pwd);

LOCKFILE="lockfile_client"

echo '_____________ INITIAL FOLDER STATE _____________'
ls -al
echo '_____________ INITIAL FOLDER STATE _____________'

if [ -f "$LOCKFILE" ]; then # will exit if all was installed
    echo "Starting..."
    npm run serve
    echo "Started"
    exit 1;
fi

echo "root path $ROOT";

echo 'Create custom client config'
echo "module.exports = {
  logging: ${SHOW_LOGGING:-false},
  eve: {
    sso: {
      client: {
        client_id: \"${EVE_CLIENT_KEY}\"
      }
    },
    connection: {
      socket: {
        host: \"${CN_WS_HOST}\",
        proto: \"${CN_WS_PROTO}\",
        port: ${CN_WS_PORT}
      }
    }
  }
}" > "$ROOT/src/conf/custom.js";

echo '_____________ CLIENT INSTALL NPM START _____________'
npm install;
echo '_____________ CLIENT INSTALL NPM FINISH _____________'

echo "" > "${ROOT}/${LOCKFILE}"

echo "Starting..."
npm run serve
echo "Started"
