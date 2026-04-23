const path = require("path");
const {
  withGradleProperties,
  withAppBuildGradle,
} = require("@expo/config-plugins");

require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

const REQUIRED_ENV = [
  "ANDROID_KEYSTORE_FILE",
  "ANDROID_KEY_ALIAS",
  "ANDROID_KEYSTORE_PASSWORD",
  "ANDROID_KEY_PASSWORD",
];

module.exports = function withKeystoreConfig(config) {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[withKeystoreConfig] Missing env vars: ${missing.join(", ")}. ` +
        `Define them in .env at the project root (see .env.example).`
    );
  }

  const storeFile = process.env.ANDROID_KEYSTORE_FILE;
  const keyAlias = process.env.ANDROID_KEY_ALIAS;
  const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD;
  const keyPassword = process.env.ANDROID_KEY_PASSWORD;

  config = withGradleProperties(config, async (config) => {
    config.modResults.push(
      { type: "property", key: "MYAPP_UPLOAD_STORE_FILE", value: storeFile },
      { type: "property", key: "MYAPP_UPLOAD_KEY_ALIAS", value: keyAlias },
      {
        type: "property",
        key: "MYAPP_UPLOAD_STORE_PASSWORD",
        value: storePassword,
      },
      {
        type: "property",
        key: "MYAPP_UPLOAD_KEY_PASSWORD",
        value: keyPassword,
      }
    );
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    const modResults = config.modResults;

    const signingConfigsPattern =
      /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\}[^}]*)(\})/s;
    const signingConfigsMatch = modResults.contents.match(
      signingConfigsPattern
    );

    if (signingConfigsMatch) {
      const releaseSigningConfig = `
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }`;

      modResults.contents = modResults.contents.replace(
        signingConfigsPattern,
        `$1${releaseSigningConfig}
    $2`
      );
    }

    const releaseBuildTypePattern =
      /(release\s*\{[^}]*signingConfig\s+)signingConfigs\.debug([^}]*\})/s;
    modResults.contents = modResults.contents.replace(
      releaseBuildTypePattern,
      "$1signingConfigs.release$2"
    );

    return config;
  });

  return config;
};
