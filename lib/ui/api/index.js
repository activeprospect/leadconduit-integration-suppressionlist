const express = require('express');
const { json } = require('body-parser');
const auth = require('./auth');
const credential = require('./credential');
const lists = require('./lists');

module.exports =
  express.Router()
    .use(json())
    .use('/credential', credential)
    .use(auth)
    .use('/lists', lists);
