mimecontent = require('mime-content')
helper = require('./helper')

request = (vars) ->
  list_ids = helper.getListIds(vars)
  values = helper.getValues(vars)

  url: "https://app.suppressionlist.com/exists/#{list_ids}/#{values}"
  method: 'GET'
  headers: helper.getRequestHeaders(vars.activeprospect.api_key, false)

request.variables = ->
  [
    { name: 'list_ids',  description: 'SuppressionList List Id (comma separated)', type: 'string' }
    { name: 'values', description: 'Item(s) to be looked up (phone/email/etc.)',   type: 'string' }
    { name: 'list_item', description: 'Item(s) to be looked up (deprecated)', type: 'string' }
  ]


response = (vars, req, res) ->
  event = helper.parseResponse(res, true)

  if event.outcome == 'success' and event.exists_in_lists?
    event.found_in = event.exists_in_lists
    delete event.exists_in_lists

  query_item: event


response.variables = ->
  [
    { name: 'query_item.outcome', type: 'string', description: 'Was SuppressionList response data appended?' },
    { name: 'query_item.reason', type: 'string', description: 'Error reason' },
    { name: 'query_item.found', type: 'boolean', description: 'is the lookup item found on any of the suppression lists?'},
    { name: 'query_item.found_in', type: 'array', description: 'list of suppression lists the item was found within'}
  ]


#
# Exports ----------------------------------------------------------------
#

module.exports =
  type: 'outbound'
  validate: helper.validate
  request: request
  response: response
