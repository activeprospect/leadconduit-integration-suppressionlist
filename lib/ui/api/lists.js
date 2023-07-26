const { Router } = require('express');
const Client = require('suppressionlist');

module.exports =
  new Router()
    .use((req, res, next) => {
      res.locals.client = new Client(req.body.apiKey, process.env.NODE_ENV);
      next();
    })
    .get('/', (req, res, next) => {
      const client = res.locals.client;
      client.getLists((err, lists) => {
        if (err) {
          if (err.statusCode) { return res.status(err.statusCode).send({ error: err.message, reason: err.body }); } else { return next(err); }
        }
        res.status(200).send(lists);
      });

      // Mocked responses for local development
      // normal response
      // res.status(200).send([{"id": "6320e4d0ecd98a6c9bd79dc4", "name": "Customer", "url_name": "customer", "type": "md5", "ttl": null, "count": 0, "total_jobs": 1}, {"id": "5bce23b62e1fa9422a566949", "name": "Duplicate Checking", "url_name": "duplicate_checking", "type": "md5", "ttl": null, "count": 2, "total_jobs": 0}])

      // unauthorized response
      // res.status(401).send({message: 'HTTP Basic: Access denied'});
    })
    .post('/ensure', (req, res, next) => {
      const client = res.locals.client;
      const name = req.body.name;
      const ttl = null; // Send null to create lists with default, indefinite retention policy
      client.ensureList(name, ttl, (err, list) => {
        if (err) {
          if (err.statusCode) { res.status(err.statusCode).send({ error: err.message, reason: err.body }); } else { next(err); }
          return;
        }
        res.status(200).send(list);
      });

      // The line below mocks a suppression list api response and can be uncommented for local development. -- BS, 10/17/18
      // res.status(200).send({'id':'594f290e2e1fa926dc000002','name':'duplicate checking','url_name':'duplicate_checking','type':'md5','ttl':null,'count':1,'total_jobs':0});
    });
