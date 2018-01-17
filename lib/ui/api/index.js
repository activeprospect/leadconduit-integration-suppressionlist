const express    = require('express'),
      { json }   = require('body-parser'),
      auth       = require('./auth'),
      credential = require('./credential'),
      lists      = require('./lists')


module.exports =
  express.Router()
         .use(json())
         .use('/credential', credential)
         .use(auth)
         .use('/lists', lists);
