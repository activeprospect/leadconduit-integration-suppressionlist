assert = require('chai').assert
integration = require('../src/query_item')

describe 'Query List Item', ->

  describe 'Request', ->
    request = null

    beforeEach ->
      request = integration.request(activeprospect: {api_key: '1234'}, url_names: 'seabass, things, more_things', values: 'boilermakers@example.com')

    it 'should have url', ->
      assert.equal 'https://app.suppressionlist.com/exists/seabass|things|more_things/boilermakers@example.com', request.url

    it 'should be get', ->
      assert.equal 'GET', request.method


  describe 'Response', ->
    it 'should parse JSON body', ->
      vars = {}
      req = {}
      res =
        status: 200,
        headers:
          'Content-Type': 'application/json'
        body: """
              {
              "specified_lists": ["list_1", "list_2", "list_3"],
              "key": "taylor@activeprospect.com",
              "found": true,
              "exists_in_lists": ["list_2", "list_3"]
              }
              """
      expected =
        query_item:
          outcome: 'success'
          reason: null
          specified_lists: ["list_1", "list_2", "list_3"]
          key: 'taylor@activeprospect.com'
          found: true
          found_in: ["list_2", "list_3"]
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
              "reason":"SuppressionList error (400)",
              "error": "No such account."
              }
              """
      expected =
        query_item:
          outcome: 'error'
          reason: 'SuppressionList error (400) No such account.'
      response = integration.response(vars, req, res)
      assert.deepEqual expected, response

    it 'should return success outcome on not-found/404 response status', ->
      res =
        status: 404,
        headers:
          'Content-Type': "application/json"
        body: """
              {
              "specified_lists": ["list_1"],
              "key": "taylor@swift.com",
              "found": false,
              "reason": null
              }
              """
      expected =
        query_item:
          outcome: 'success'
          found: false
          reason: null
          key: 'taylor@swift.com'
          specified_lists: [ 'list_1' ]

      response = integration.response({}, {}, res)
      assert.deepEqual response, expected
