const { join } = require("path");
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
const { DefinePlugin } = require("webpack");

module.exports = {
  entry: join(__dirname, "./browser/react.ts"),
  output: {
    path: join(__dirname, "./build"),
    filename: "./build/react.js",
    publicPath: "/build",
  },
  watch: false,
  mode: "production",
  devtool: "inline-source-map",
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: join(__dirname, "./tsconfig.webpack.json"),
      }),
    ],
  },
  plugins: [
    new DefinePlugin({
      NODE_ENV: JSON.stringify("production"),
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  optimization: {
    nodeEnv: "production",
    minimize: false,
  },
};
