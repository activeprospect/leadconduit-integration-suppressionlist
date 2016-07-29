assert = require('chai').assert
helper = require('../src/helper')
types = require('leadconduit-types')

describe 'Helper', ->
  
  describe 'get list URL names', ->

    for key in ['list_ids', 'list_id', 'list_names', 'list_name']
      do (key) ->
        describe "specified with #{key}", ->
          it 'should handle single value', ->
            vars = {}
            vars[key] = 'foo'
            assert.deepEqual helper.getListUrlNames(vars), 'foo'

          it 'should handle comma delimited list', ->
            vars = {}
            vars[key] = 'foo,bar,baz'
            assert.deepEqual helper.getListUrlNames(vars), 'foo|bar|baz'

          it 'should ignore comma delimited empty values', ->
            vars = {}
            vars[key] = ',,foo,,bar,baz,,'
            assert.deepEqual helper.getListUrlNames(vars), 'foo|bar|baz'

          it 'should handle array', ->
            vars = {}
            vars[key] = ['foo', 'bar', 'baz']
            assert.deepEqual helper.getListUrlNames(vars), 'foo|bar|baz'

          it 'should handle array with empty values', ->
            vars = {}
            vars[key] = ['foo', null, 'bar', '', 'baz', '']
            assert.deepEqual helper.getListUrlNames(vars), 'foo|bar|baz'

          it 'should handle array of comma delimited lists', ->
            vars = {}
            vars[key] = ['foo,bar,baz', 'bip,bap']
            assert.deepEqual helper.getListUrlNames(vars), 'foo|bar|baz|bip|bap'

          it 'should slugify', ->
            vars = {}
            vars[key] = 'My List,"Bob\'s List, Unplugged",2015-10-12'
            assert.deepEqual helper.getListUrlNames(vars), 'my_list|bobs_list_unplugged|20151012'

  describe 'get values', ->

    it 'should handle non-csv values', ->
      assert.deepEqual helper.getValues(values: 'foo, bar, "baz'), ['foo', 'bar', '"baz']

  describe 'Base URL', ->

    after ->
      process.env.NODE_ENV = 'test'

    it 'should get production url', ->
      process.env.NODE_ENV = 'production'
      assert.equal helper.getBaseUrl(), 'https://app.suppressionlist.com'

    it 'should get staging url', ->
      process.env.NODE_ENV = 'staging'
      assert.equal helper.getBaseUrl(), 'http://staging.suppressionlist.com'

    it 'should get development url', ->
      process.env.NODE_ENV = 'development'
      assert.equal helper.getBaseUrl(), 'http://suppressionlist.dev'


  describe 'Validate', ->

    it 'should require list_ids', () ->
      assert.equal helper.validate({}), 'a list name is required'

    it 'should require values', ->
      assert.equal helper.validate(list_ids: 'foo'), 'values must not be blank'

    it 'should require non empty string values', ->
      assert.equal helper.validate(list_ids: 'foo', values: ''), 'values must not be blank'

    it 'should require non null values', ->
      assert.equal helper.validate(list_ids: 'foo', values: null), 'values must not be blank'

    it 'should require values in typed fields', () ->
      lead = email: types.email.parse("")  # an empty lead.email (a String) is different than ''
      assert.equal helper.validate(list_ids: 'foo', values: lead.email), 'values must not be blank'

    it 'should be satisfied with list_ids and values', () ->
      assert.isUndefined helper.validate(list_ids: 'foo', values: 'bar@baz.com')



  describe 'Request Headers', ->
    headers = {}

    before ->
      headers = helper.getRequestHeaders('api_key')

    it 'should accept JSON', ->
      assert.equal headers.Accept, 'application/json'

    it 'should set authorization header', ->
      assert.equal headers.Authorization, 'Basic WDphcGlfa2V5'

    it 'should set content-type by default', ->
      assert.equal headers['Content-Type'], 'application/json'

    it 'should not set content-type when told not to', ->
      headers = helper.getRequestHeaders('api_key', false)
      assert.isUndefined headers['Content-Type']


