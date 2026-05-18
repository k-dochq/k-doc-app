const { withAndroidManifest } = require("@expo/config-plugins");

const withAndroidAppLinks = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const activities = androidManifest.manifest.application?.[0]?.activity;

    if (!activities) return config;

    // 메인 액티비티 탐색 (android.intent.action.MAIN 을 가진 것)
    const mainActivity = activities.find((activity) =>
      activity["intent-filter"]?.some((filter) =>
        filter.action?.some(
          (a) => a.$?.["android:name"] === "android.intent.action.MAIN"
        )
      )
    );

    if (!mainActivity) return config;

    if (!mainActivity["intent-filter"]) {
      mainActivity["intent-filter"] = [];
    }

    // k-doc.onelink.me App Links intent filter
    mainActivity["intent-filter"].push({
      $: { "android:autoVerify": "true" },
      action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
      category: [
        { $: { "android:name": "android.intent.category.DEFAULT" } },
        { $: { "android:name": "android.intent.category.BROWSABLE" } },
      ],
      data: [
        { $: { "android:scheme": "https", "android:host": "k-doc.onelink.me" } },
      ],
    });

    return config;
  });
};

module.exports = withAndroidAppLinks;
