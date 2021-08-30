const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  target: "web",
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    publicPath: "/",
    // contentBase: path.join(process.cwd(), "dist"),
    historyApiFallback: true,
    hot: true,
    host: "0.0.0.0",
    allowedHosts: [
      ".repl.it",
      ".repl.co",
      ".repl.run"
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      templateContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body></body>
      </html>
      `
    })
  ]
};