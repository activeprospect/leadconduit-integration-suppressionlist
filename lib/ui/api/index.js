const express = require('express');
const { json } = require('body-parser');
const lists = require('./lists');

module.exports =
  express.Router()
    .use(json())
    .use('/lists', lists);
