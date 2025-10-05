const { withXcodeProject, withInfoPlist } = require("@expo/config-plugins");

/**
 * Config plugin to automatically set iOS version and build number
 * from app.json to Xcode project settings and Info.plist
 */
module.exports = function withIOSVersion(config) {
  // Update Xcode project settings
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const buildSettings = xcodeProject.pbxXCBuildConfigurationSection();

    // Get version info from config
    const version = config.ios?.version || config.version || "1.0.0";
    const buildNumber = config.ios?.buildNumber || 1;

    // Convert buildNumber to proper format (e.g., 15 -> "15" or "1.5.0")
    // Apple requires period-separated integers for CFBundleVersion
    const buildNumberString =
      typeof buildNumber === "number" ? String(buildNumber) : buildNumber;

    // Update all build configurations
    for (const key in buildSettings) {
      const buildConfig = buildSettings[key];
      if (typeof buildConfig === "object" && buildConfig.buildSettings) {
        buildConfig.buildSettings.MARKETING_VERSION = version;
        buildConfig.buildSettings.CURRENT_PROJECT_VERSION = buildNumberString;

        // Enable dSYM generation for Release builds
        if (buildConfig.name === "Release") {
          buildConfig.buildSettings.DEBUG_INFORMATION_FORMAT =
            "dwarf-with-dsym";
          buildConfig.buildSettings.COPY_PHASE_STRIP = "NO";
        }
      }
    }

    return config;
  });

  // Update Info.plist to ensure CFBundleVersion is in correct format
  config = withInfoPlist(config, (config) => {
    const version = config.ios?.version || config.version || "1.0.0";
    const buildNumber = config.ios?.buildNumber || 1;

    // Apple requires CFBundleVersion to be period-separated integers (e.g., "1.0.0")
    // If buildNumber is just a number, convert it to version-like format
    const buildVersionString =
      typeof buildNumber === "number"
        ? version // Use the version string format
        : String(buildNumber);

    config.modResults.CFBundleShortVersionString = version;
    config.modResults.CFBundleVersion = buildVersionString;

    return config;
  });

  return config;
};
