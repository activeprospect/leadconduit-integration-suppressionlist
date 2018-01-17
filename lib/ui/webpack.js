const webpack           = require('webpack'),
      webpackMiddleware = require('webpack-dev-middleware'),
      config            = require('./webpack.config.js');


module.exports = webpackMiddleware(webpack(config), {
  publicPath: config.output.publicPath,
  lazy: true
});