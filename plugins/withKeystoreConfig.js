const {
  withGradleProperties,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = function withKeystoreConfig(config) {
  // 1. Gradle properties 설정
  config = withGradleProperties(config, async (config) => {
    config.modResults.push(
      {
        type: "property",
        key: "MYAPP_UPLOAD_STORE_FILE",
        value: "../../secret/@jahun135__k-doc-app.jks",
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

  // 2. build.gradle 파일의 signingConfigs와 buildTypes 수정
  config = withAppBuildGradle(config, (config) => {
    const modResults = config.modResults;

    // signingConfigs 섹션에 release 설정 추가
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

    // buildTypes의 release에서 signingConfig를 release로 변경
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
