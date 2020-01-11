const path = require("path");

module.exports = {
  configureWebpack: {
    // devtool: process.env.NODE_ENV === "development" ? "source-map" : "none",
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src/") // 1. @の参照先の変更
      }
    }
  },
  assetsDir: "static",
  outputDir: "../dist", // 2. 出力先
  pages: {
    index: {
      entry: "src/main.js", // エントリーポイント
      template: "public/index.html", //3. index.htmlテンプレート
      filename: "index.html" // 省略可
    }
  },
  publicPath: "/",
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    disableHostCheck: true
  }
};
