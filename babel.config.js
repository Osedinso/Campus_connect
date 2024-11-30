module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Correctly configured react-native-dotenv plugin
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
        },
      ],
      // Required for expo-router
      "react-native-reanimated/plugin", // This should be last
    ],
  };
};
