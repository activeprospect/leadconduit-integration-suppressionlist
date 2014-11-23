mimecontent = require('mime-content')

request = (vars) ->
  list_ids = vars.list_ids.split(',').join('|').replace(/\s+/g, '')

  url: "https://app.suppressionlist.com/exists/#{list_ids}/#{vars.values}"
  method: 'GET'
  headers:
    'Accept': 'application/json'
    'Authorization': "Basic #{new Buffer("X:#{vars.activeprospect.api_key}").toString('base64')}"

request.variables = ->
  [
    { name: 'list_ids',  description: 'SuppressionList List Id (comma separated)', type: 'string', required: true },
    { name: 'values', description: 'Item(s) to be looked up (phone/email/etc.)',   type: 'string', required: true }
  ]


response = (vars, req, res) ->
  body = JSON.parse(res.body)

  if body.error?
    event = { outcome: 'error', reason: "SuppressionList error (#{res.status}) #{body.error}" }
  else
    event = JSON.parse(res.body)
    event.outcome = 'success'
    event.reason = null
    event.found_in = event.exists_in_lists
    delete event.exists_in_lists

  query_item: event


response.variables = ->
  [
    { name: 'query_item.outcome', type: 'options', options: "[ { name: 'Success', value: 'success' }, { name: 'Error', value: 'error' } ]", description: 'Was SuppressionList data appended?' },
    { name: 'query_item.reason', type: 'string', description: 'Error reason' },
    { name: 'query_item.found', type: 'boolean', description: 'is the lookup item found on any of the suppression lists?'},
    { name: 'query_item.found_in', type: 'array', description: 'list of suppression lists the item was found within'}
  ]


#
# Exports ----------------------------------------------------------------
#

module.exports =
  type: 'outbound'
  request: request
  response: response