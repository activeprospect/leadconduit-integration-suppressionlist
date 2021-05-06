const express = require('express'),
      path    = require('path'),
      api     = require('./api');

let router = express.Router()
  .use(express.static(path.join(__dirname, '/public')));

router.use(api);

module.exports = router;
