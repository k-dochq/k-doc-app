const { withAndroidManifest } = require("@expo/config-plugins");

const withAndroidCleartextTraffic = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // application 태그에 usesCleartextTraffic="true" 추가
    if (
      androidManifest.manifest.application &&
      androidManifest.manifest.application[0]
    ) {
      androidManifest.manifest.application[0].$[
        "android:usesCleartextTraffic"
      ] = "true";
    }

    return config;
  });
};

module.exports = withAndroidCleartextTraffic;
