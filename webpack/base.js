const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  devServer: {
    publicPath: "/",
    contentBase: path.resolve(process.cwd(), './src/assets'),
    contentBasePublicPath: '/assets',
    historyApiFallback: true,
    hot: true
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
          <style media='screen' type='text/css'>
            @font-face {
              font-family: Minecraft;
              src: url('assets/fonts/minecraft/Minecraft.ttf');
            }

            @font-face {
              font-family: Gothic Pixels;
              src: url('assets/fonts/gothicpixels/GothicPixels.ttf');
            }

            @font-face {
              font-family: Edit Undo Line;
              src: url('assets/fonts/edit_undo_line/edunline.ttf');
            }

            @font-face {
              font-family: Monster Friend Fore;
              src: url('assets/fonts/monster_friend_fore/MonsterFriendFore.otf');
            }

            @font-face {
              font-family: Gypsy Curse;
              src: url('assets/fonts/gypsy_curse/GypsyCurse.ttf');
            }
          </style>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; overflow: hidden;">
          <div style="font-family:Minecraft; position:absolute; left:-1000px; visibility:hidden;">.</div>
          <div style="font-family:Gothic Pixels; position:absolute; left:-1000px; visibility:hidden;">.</div>
          <div style="font-family:Edit Undo Line; position:absolute; left:-1000px; visibility:hidden;">.</div>
          <div style="font-family:Monster Friend Fore; position:absolute; left:-1000px; visibility:hidden;">.</div>
          <div style="font-family:Gypsy Curse; position:absolute; left:-1000px; visibility:hidden;">.</div>
        </body>
      </html>
      `
    })
  ]
};