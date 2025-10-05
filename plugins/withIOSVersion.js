const { withXcodeProject } = require("@expo/config-plugins");

/**
 * Config plugin to automatically set iOS version and build number
 * from app.json to Xcode project settings
 */
module.exports = function withIOSVersion(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const buildSettings = xcodeProject.pbxXCBuildConfigurationSection();

    // Get version info from config
    const version = config.ios?.version || config.version || "1.0.0";
    const buildNumber = config.ios?.buildNumber || "1";

    // Update all build configurations
    for (const key in buildSettings) {
      if (typeof buildSettings[key] === "object") {
        const buildConfig = buildSettings[key].buildSettings;
        if (buildConfig) {
          buildConfig.MARKETING_VERSION = version;
          buildConfig.CURRENT_PROJECT_VERSION = String(buildNumber);
        }
      }
    }

    return config;
  });
};
