const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "source-map", // - Approach that plays well with UglifyJsPlugin; typically you might use this in Production
  context: path.resolve(__dirname, "./src"),
  entry: {
    app: "./index.tsx",
    wren: "./views/wren/index.tsx"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "./dist/js/"),
    publicPath: "/js/"
  },
  devServer: {
    contentBase: path.resolve(__dirname, "./public"),
    hot: false,
    inline: false,
    host: '0.0.0.0'
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: "three"
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
            options: { presets: ["env"] }
          }
        ]
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
            options: { presets: ["env"] }
          },
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  }
};
