const { Router } = require('express');

module.exports =
  new Router()
    .get('/', (req, res) => {
      if (!req.session || !req.session.credential) {
        return res.status(404).send({ message: 'credential not set' });
      }
      res.status(200).send(req.session.credential);
    })
    .post('/', (req, res) => {
      if (!req.body.token) {
        return res.status(422).send({ error: 'missing required property: token' });
      }
      const credential = req.body;
      req.session.credential = credential;
      res.status(201).send(credential);
    })
    .delete('/', (req, res) => {
      if (req.session && req.session.credential) {
        req.session.credential = undefined;
      }
      res.status(200).send();
    });