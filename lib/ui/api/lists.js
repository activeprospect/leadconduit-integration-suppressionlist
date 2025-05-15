const { Router } = require('express');
const request = require('request');
const helpers = require('../../helper');

module.exports =
  new Router()
    .get('/', (req, res, next) => {
      const opts = {
        url: `${helpers.getBaseUrl()}/lists`,
        headers: helpers.getRequestHeaders({ activeprospect: { api_key: req.query.apiKey }}),
        json: true
      };
      request.get(opts, (err, response, body) => {
        if (err) {
          if (err.statusCode) { return res.status(err.statusCode).send({ error: err.message, reason: err.body }); } else { return next(err); }
        }
        res.status(200).send(body);
      });

      // Mocked responses for local development
      // normal response
      // res.status(200).send([{"id": "6320e4d0ecd98a6c9bd79dc4", "name": "Customer", "url_name": "customer", "type": "md5", "ttl": null, "count": 0, "total_jobs": 1}, {"id": "5bce23b62e1fa9422a566949", "name": "Duplicate Checking", "url_name": "duplicate_checking", "type": "md5", "ttl": null, "count": 2, "total_jobs": 0}])

      // unauthorized response
      // res.status(401).send({message: 'HTTP Basic: Access denied'});
    })
    .post('/ensure', (req, res, next) => {
      const getOpts = {
        url: `${helpers.getBaseUrl()}/lists`,
        headers: helpers.getRequestHeaders({ activeprospect: { api_key: req.query.apiKey }}),
        json: true
      };
      request.get(getOpts, (err, response, body) => {
        if (err) {
          if (err.statusCode) { return res.status(err.statusCode).send({ error: err.message, reason: err.body }); } else { return next(err); }
        }
        const name = req.body.name;
        const list = body.find((list) => { return list.name && list.name.toLowerCase() === name.toLowerCase(); });
        if (!list) {
          const createOpts = {
            url: `${helpers.getBaseUrl()}/lists`,
            headers: helpers.getRequestHeaders({ activeprospect: { api_key: req.query.apiKey }}),
            body: {
              name,
              ttl: null
            },
            json: true
          };
          request.post(createOpts, (err, response, body) => {
            if (err) {
              if (err.statusCode) { res.status(err.statusCode).send({ error: err.message, reason: err.body }); } else { next(err); }
            }
            res.status(200).send(body);
          });
        }
      });

      // The line below mocks a suppression list api response and can be uncommented for local development. -- BS, 10/17/18
      // res.status(200).send({'id':'594f290e2e1fa926dc000002','name':'duplicate checking','url_name':'duplicate_checking','type':'md5','ttl':null,'count':1,'total_jobs':0});
    });
