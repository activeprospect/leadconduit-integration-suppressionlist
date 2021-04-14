const express = require('express'),
      path    = require('path'),
      api     = require('./api');

let router = express.Router()
  .use(express.static(path.join(__dirname, '/public')));

if (process.env.NODE_ENV === 'development') {
  router.use(require('@activeprospect/integration-dev-webpack'));
}

router.use(api);

module.exports = router;
