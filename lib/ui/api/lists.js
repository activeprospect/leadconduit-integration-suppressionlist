const { Router } = require('express'),
      Client = require('suppressionlist');

module.exports =
  new Router()
    .use((req, res, next) => {
      res.locals.client = new Client(req.session.credential.token, process.env.NODE_ENV);
      next();
    })
    .get('/', (req, res, next) => {
      const client = res.locals.client;
      client.getLists((err, lists) => {
        if (err) {
          if (err.statusCode)
            return res.status(err.statusCode).send({ error: err.message, reason: err.body });
          else
            return next(err);
        }
        res.status(200).send(lists);
      })
    })
    .post('/ensure', (req, res, next) => {
      const apiKey = req.session.credential.token;
      const client = new Client(apiKey, process.env.NODE_ENV);
      const name = req.body.name;
      const ttl = req.body.ttl;
      client.ensureList(name, ttl, (err, list) => {
        if (err) {
          if (err.statusCode)
            res.status(err.statusCode).send({ error: err.message, reason: err.body });
          else
            next(err);
          return;
        }
        res.status(200).send(list);
      })
    });
