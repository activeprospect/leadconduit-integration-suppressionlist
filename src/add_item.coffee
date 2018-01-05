helper = require('./helper')

request = (vars) ->
  values = helper.getValues(vars)
  listNames = helper.getListUrlNames(vars)
  baseUrl = helper.getBaseUrl()

  url: "#{baseUrl}/lists/#{listNames}/items"
  method: 'POST'
  headers: helper.getRequestHeaders(vars.activeprospect.api_key)
  body:
    JSON.stringify(values: values)

request.variables = ->
  [
    { name: 'list_name', description: 'SuppressionList List URL Name', required: true, type: 'string' }
    { name: 'values', description: 'Phone, email or other values to be added to the list (comma separated)', required: true, type: 'string' }
  ]


response = (vars, req, res) ->
  add_item: helper.parseResponse(res)

response.variables = ->
  [
    { name: 'add_item.outcome', type: 'string', description: 'Was SuppressionList response data appended?' }
    { name: 'add_item.reason', type: 'string', description: 'Error reason' }
    { name: 'add_item.accepted', type: 'number', description: 'the number of items added to the list' }
    { name: 'add_item.rejected', type: 'number', description: 'the number of items not added to the list' }
    { name: 'add_item.duration', type: 'number', description: 'How long the call to SupressionList took, in seconds' }
  ]


#
# Exports ----------------------------------------------------------------
#

module.exports =
  type: 'outbound'
  validate: helper.validate
  request: request
  response: response
