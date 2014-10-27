assert = require('chai').assert
integration = require('../src/delete_item')

describe 'Delete List Item Request', ->
  request = null

  beforeEach ->
    request = integration.request(activeprospect: {api_key: '1234'}, list_id: 'things', values: 'taylor@activeprospect.com')

  it 'should have url', ->
    assert.equal 'https://app.suppressionlist.com/lists/things/items/taylor@activeprospect.com', request.url

  it 'should be delete', ->
    assert.equal 'DELETE', request.method

  it 'should accept JSON', ->
    assert.equal 'application/json', request.headers.Accept


describe 'Delete List Item Response', ->
  it 'should parse JSON body', ->
    vars = {}
    req = {}
    res =
      status: 200,
      headers:
        'Content-Type': 'application/json'
      body: """
            {
            "outcome": "success",
            "deleted": 2,
            "rejected": 0
            }
            """
    expected =
      delete_item:
        outcome: 'success'
        reason: null
        deleted: 2
        rejected: 0
    response = integration.response(vars, req, res)
    assert.deepEqual expected, response

  it 'should return error outcome on non-200 response status', ->
    vars = {}
    req = {}
    res =
      status: 400,
      headers:
        'Content-Type': 'application/json'
      body: """
            {
            "outcome":"error",
            "reason":"SuppressionList error (400)"
            }
            """
    expected =
      delete_item:
        outcome: 'error'
        reason: 'SuppressionList error (400)'
    response = integration.response(vars, req, res)
    assert.deepEqual expected, response