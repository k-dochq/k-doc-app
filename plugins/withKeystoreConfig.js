const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function withKeystoreConfig(config) {
  return withGradleProperties(config, async (config) => {
    config.modResults.push(
      {
        type: "property",
        key: "MYAPP_UPLOAD_STORE_FILE",
        value: "../secret/@jahun135__k-doc-app.jks",
      },
      {
        type: "property",
        key: "MYAPP_UPLOAD_KEY_ALIAS",
        value: "da844abdcd9361e8574e2ff931772593",
      },
      {
        type: "property",
        key: "MYAPP_UPLOAD_STORE_PASSWORD",
        value: "668580ef90a1ed755e8274aae98b6f80",
      },
      {
        type: "property",
        key: "MYAPP_UPLOAD_KEY_PASSWORD",
        value: "6f211cd78c5fdfa326eb00f1f6e45d35",
      }
    );
    return config;
  });
};
