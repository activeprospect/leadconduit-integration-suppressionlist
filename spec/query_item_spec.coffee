assert = require('chai').assert
integration = require('../lib/query_item')

describe 'Query List Item', ->

  describe 'Request', ->
    request = null

    beforeEach ->
      request = integration.request(activeprospect: {api_key: '1234'}, list_ids: 'seabass, things, more_things', value: 'boilermakers@example.com')

    it 'should have url', ->
      assert.equal request.url, 'https://app.suppressionlist.com/exists/seabass|things|more_things/boilermakers%40example.com'

    it 'should be get', ->
      assert.equal request.method, 'GET'

    it 'should use first item if multiples query values are mapped', ->
      request = integration.request(activeprospect: {api_key: '1234'}, list_ids: 'things', value: 'test@example.com,foo@bar.com')
      assert.equal request.url, 'https://app.suppressionlist.com/exists/things/test%40example.com'

    # this change shouldn't break existing mappings
    it 'should still support old mappings to \'values\'', ->
      request = integration.request(activeprospect: {api_key: '1234'}, list_ids: 'things', values: 'test@example.com,foo@bar.com')
      assert.equal request.url, 'https://app.suppressionlist.com/exists/things/test%40example.com'

  describe 'Response', ->
    it 'should parse JSON body', ->
      vars = {}
      req = {}
      res =
        status: 200,
        headers:
          'Content-Type': 'application/json'
          'X-Runtime': 0.497349
        body: """
              {
                "specified_lists": ["list_1", "list_2", "list_3"],
                "key": "taylor@activeprospect.com",
                "found": true,
                "exists_in_lists": ["list_2", "list_3"],
                "entries": [
                  {
                    "list_id" : "558dbd69021823dc0b000001",
                    "list_url_name" : "list_2",
                    "added_at" : "2015-08-27T16:18:16Z"
                  },
                  {
                    "list_id" : "558dbd69021823dc0b000002",
                    "list_url_name" : "list_3",
                    "added_at" : "2015-08-28T16:18:16Z"
                  }
                ]
              }
              """
      expected =
        query_item:
          outcome: 'success'
          reason: null
          duration: 0.497349
          specified_lists: ["list_1", "list_2", "list_3"]
          key: 'taylor@activeprospect.com'
          found: true
          added_at: "2015-08-28T16:18:16Z",
          found_in: ["list_2", "list_3"]
      response = integration.response(vars, req, res)
      assert.deepEqual response, expected

    it 'should return error outcome on non-200 response status', ->
      vars = {}
      req = {}
      res =
        status: 400,
        headers:
          'Content-Type': 'application/json'
        body: """
              {
                "error":"No such account"
              }
              """
      expected =
        query_item:
          outcome: 'error'
          reason: 'No such account'
      response = integration.response(vars, req, res)
      assert.deepEqual response, expected

    it 'should return success outcome on not-found/404 response status', ->
      res =
        status: 404,
        headers:
          'Content-Type': "application/json"
          'X-Runtime': 0.497349
        body: """
              {
                "specified_lists": ["list_1"],
                "key": "taylor@swift.com",
                "found": false
              }
              """
      expected =
        query_item:
          outcome: 'success'
          found: false
          duration: 0.497349
          reason: null
          key: 'taylor@swift.com'
          specified_lists: [ 'list_1' ]

      response = integration.response({}, {}, res)
      assert.deepEqual response, expected

  describe 'Validate', ->
    it 'should function properly', ->
      assert.equal integration.validate(list_ids: 'foo'), 'values must not be blank'
