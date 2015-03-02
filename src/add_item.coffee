mimecontent = require('mime-content')
helper = require('./helper')

request = (vars) ->
  values = helper.getValues vars

  url: "https://app.suppressionlist.com/lists/#{vars.list_id}/items"
  method: 'POST'
  headers: helper.getRequestHeaders(vars.activeprospect.api_key)
  body:
    JSON.stringify(values: values)

request.variables = ->
  [
    { name: 'list_id', description: 'SuppressionList List Id', type: 'string' }
    { name: 'values', description: 'Item(s) to be added to SuppressionList (comma separated)', type: 'string' }
    { name: 'list_item', description: 'Item(s) to be looked up (deprecated)', type: 'string' }
  ]


response = (vars, req, res) ->
  add_item: helper.parseResponse(res)

response.variables = ->
  [
    { name: 'add_item.outcome', type: 'string', description: 'Was SuppressionList response data appended?' },
    { name: 'add_item.reason', type: 'string', description: 'Error reason' },
    { name: 'add_item.accepted', type: 'number', description: 'the number of items added to the list'},
    { name: 'add_item.rejected', type: 'number', description: 'the number of items not added to the list'}
  ]


#
# Exports ----------------------------------------------------------------
#

module.exports =
  type: 'outbound'
  request: request
  response: response
