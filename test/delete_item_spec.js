const assert = require('chai').assert;
const integration = require('../lib/delete_item');

describe('Delete List Item', () => {

  describe('Request', () => {
    let request = integration.request({activeprospect: {api_key: '1234'}, list_id: 'things', values: 'taylor@activeprospect.com'});

    it('should have url', () => {
      assert.equal(request.url, 'https://app.suppressionlist.com/lists/things/items');
    });

    it('should be delete', () => {
      assert.equal( request.method, 'DELETE');
    });

    it('should have body', () => {
      assert.equal(request.body, '{"values":["taylor@activeprospect.com"]}');
    });
  });

  describe('Response', () => {

    it('should parse JSON body', () => {
      const res = {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Runtime': 0.497349
        },
        body: `
        {
          "deleted": 2,
          "rejected": 0
        }
        `
      };
      const expected = {
        delete_item: {
          outcome: 'success',
          reason: null,
          duration: 0.497349,
          deleted: 2,
          rejected: 0
        }
      };
      const response = integration.response({},{},res);
      assert.deepEqual(expected, response);
    });

    it('should return error outcome on non-200 response status', () => {
      const res = {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: `
        {
          "error":"Something went wrong"
        }
        `
      };
      const expected = {
        delete_item: {
          outcome: 'error',
          reason: 'Something went wrong'
        }
      };
      const response = integration.response({},{},res);
      assert.deepEqual(expected, response);
    });

    it('should return error outcome on 500/HTML response', () => {
      const res = {
        status: 500,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `
        <!DOCTYPE html>
        <html>
        <head>
        <title>We're sorry, but something went wrong (500)</title>
        <style type="text/css">
        body { background-color: #fff; color: #666; text-align: center; font-family: arial, sans-serif; }
        div.dialog {
          width: 25em;
          padding: 0 4em;
          margin: 4em auto 0 auto;
          border: 1px solid #ccc;
          border-right-color: #999;
          border-bottom-color: #999;
        }
        h1 { font-size: 100%; color: #f00; line-height: 1.5em; }
        </style>
        </head>

        <body>
        <!-- This file lives in public/500.html -->
        <div class="dialog">
        <h1>We're sorry, but something went wrong.</h1>
        </div>
        </body>
        </html>
        `
      };
      const expected = {
        delete_item: {
          outcome: 'error',
          reason: 'Unsupported response'
        }
      };
      const response = integration.response({},{},res);
      assert.deepEqual(expected, response);
    });
  });

  describe('Validate', () => {
    it('should function properly', () => {
      assert.equal(integration.validate({list_id: 'foo'}), 'values must not be blank');
    });
  });
});
