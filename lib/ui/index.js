const express = require('express');
const path = require('path');
const api = require('./api');

const router = express.Router()
  .use(express.static(path.join(__dirname, '/public')));

router.use(api);

module.exports = router;
