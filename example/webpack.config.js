const { join } = require("path");

const { TsConfigPathsPlugin } = require("awesome-typescript-loader");
const { DefinePlugin } = require("webpack");

module.exports = {
  entry: join(__dirname, "./browser/react.ts"),
  output: {
    path: join(__dirname, "./build"),
    filename: "./build/react.js",
    publicPath: "/build"
  },
  watch: false,
  mode: "production",
  devtool: "inline-source-map",
  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new TsConfigPathsPlugin({
        tsconfig: join(__dirname + "./tsconfig.webpack.json"),
        compiler: "typescript"
      })
    ]
  },
  plugins: [
    new DefinePlugin({
      NODE_ENV: JSON.stringify("production"),
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      }
    ]
  },
  optimization: {
    nodeEnv: "production",
    minimize: false
  }
};
