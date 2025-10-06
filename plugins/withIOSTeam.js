const { withXcodeProject } = require("@expo/config-plugins");

/**
 * Config plugin to automatically set iOS development team
 * This prevents the team from being reset to "None" after prebuild
 */
module.exports = function withIOSTeam(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Get team ID from config (you can set this in app.json)
    const teamId = config.ios?.teamId || "3LC3JLW6J5";
    
    // Update project settings
    const buildSettings = xcodeProject.pbxXCBuildConfigurationSection();
    
    // Update all build configurations
    for (const key in buildSettings) {
      const buildConfig = buildSettings[key];
      if (typeof buildConfig === "object" && buildConfig.buildSettings) {
        // Set development team
        buildConfig.buildSettings.DEVELOPMENT_TEAM = teamId;
        
        // Set code signing settings
        buildConfig.buildSettings.CODE_SIGN_STYLE = "Automatic";
        buildConfig.buildSettings.CODE_SIGN_IDENTITY = '"Apple Development"';
      }
    }
    
    return config;
  });
};
