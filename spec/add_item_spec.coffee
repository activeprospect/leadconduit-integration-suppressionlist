assert = require('chai').assert
integration = require('../src/add_item')

describe 'Add List Item Request', ->
  request = null

  beforeEach ->
    request = integration.request(activeprospect: {api_key: '1234'}, list_id: 'things', values: 'boilermakers@example.com, taylor@activeprospect.com, foo bar, baz')

  it 'should have url', ->
    assert.equal 'https://app.suppressionlist.com/lists/things/items', request.url

  it 'should be get', ->
    assert.equal 'POST', request.method

  it 'should accept JSON', ->
    assert.equal 'application/json', request.headers.Accept

  it 'should have the correct body', ->
    assert.equal '{"values":"boilermakers@example.com|taylor@activeprospect.com|foo bar|baz"}', request.body

describe 'Add List Item Response', ->
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
            "accepted": 2,
            "rejected": 0
            }
            """
    expected =
      add_item:
        outcome: 'success'
        reason: null
        accepted: 2
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
      add_item:
        outcome: 'error'
        reason: 'SuppressionList error (400)'
    response = integration.response(vars, req, res)
    assert.deepEqual expected, response
