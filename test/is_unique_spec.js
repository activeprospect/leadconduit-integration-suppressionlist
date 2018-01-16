const _ = require('lodash');
const assert = require('chai').assert;
const nock = require('nock');
const integration = require('../lib/is-unique');

describe('Validate', () => {

  it('should require list name', () => {
    assert.equal(integration.validate({value: 'abc@outlook.com'}), 'a list name is required');
  });

  it('should require value', () => {
    assert.equal(integration.validate({list_name: 'mylist'}), 'value required');
  });

  it('should pass validation', () => {
    assert.isUndefined(integration.validate({value: 'abc@outlook.com', list_name: 'mylist'}));
  });
});


describe('Is Unique', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fail when found by query', (done) => {
    const sl = nock('https://app.suppressionlist.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json',
        'X-Runtime': 0.497349
      })
      .get('/exists/email/hola')
      .reply(200,
        {
          specified_lists: ['email'],
          key: 'hola',
          found: true,
          exists_in_lists: ['email'],
          entries: [
            { list_id: '53c95bb14efbbe8fca000004', list_url_name: 'email', added_at: '2017-06-23T19:59:04Z' }
          ]
        });

    integration.handle({ activeprospect: { api_key: '123' }, list_name: 'email', value: 'hola' }, (err, event) => {
      if (err) return done(err);
      assert.equal(_.get(event, 'is_unique.outcome'), 'failure');
      assert.equal(_.get(event, 'is_unique.reason'), 'Duplicate');
      assert.deepEqual(event.is_unique.query_item,
        {
          outcome: 'success',
          reason: null,
          duration: 0.497349,
          key: 'hola',
          specified_lists: [ 'email' ],
          found: true,
          found_in: [ 'email' ],
          added_at: '2017-06-23T19:59:04Z'
        });
      sl.done();
      done();
    });
  });

  it('should add when not found', (done) => {
    const sl = nock('https://app.suppressionlist.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json',
        'X-Runtime': 0.497349
      })
      // query not found
      .get('/exists/email/hola')
      .reply(404,
        {
          specified_lists: ['foo'],
          key: 'bar',
          found: false
        }
      )
      // add
      .post('/lists/email/items')
      .reply(200, {accepted: 1, rejected: 0});

    integration.handle({ activeprospect: { api_key: '123' }, list_name: 'email', value: 'hola' }, (err, event) => {
      if (err) return done(err);
      assert.equal(_.get(event, 'is_unique.outcome'), 'success');
      assert.isUndefined(_.get(event, 'is_unique.reason'));
      assert.deepEqual(event.is_unique.query_item,
        {
          outcome: 'success',
          reason: null,
          duration: 0.497349,
          specified_lists: [ 'foo' ],
          key: 'bar',
          found: false
        }
      );
      assert.deepEqual(event.is_unique.add_item,
        {
          outcome: 'success',
          reason: null,
          duration: 0.497349,
          accepted: 1,
          rejected: 0
        }
      );
      sl.done();
      done();
    });
  });
});
