
getListIds = (vars) ->
  vars.url_names?.split(',').map((v) -> v.trim()).join('|')


getValues = (vars) ->
  values = vars.values
  values.split(',').map((v) -> v.trim()).join('|')


getRequestHeaders = (api_key, setContentType = true) ->
  headers =
    'Accept': 'application/json'
    'Authorization': "Basic #{new Buffer("X:#{api_key}").toString('base64')}"

  headers['Content-Type'] = 'application/json' if setContentType

  headers


validate = (vars) ->
  return 'url_names must not be blank' unless vars.url_names?
  return 'values must not be blank' unless vars.values


parseResponse = (res, allow404 = false) ->
  if res.headers['Content-Type'].indexOf('application/json') >= 0
    body = JSON.parse(res.body)
  else
    body =
      error: "Possibly incorrect url_name"

  if body.error? or (res.status != 200 and !allow404)
    event = { outcome: 'error', reason: "SuppressionList error (#{res.status}) #{body.error or ''}".trim()  }
  else
    event = body
    event.outcome = 'success'
    event.reason = null

  event


module.exports =
  getListIds: getListIds
  getValues: getValues
  getRequestHeaders: getRequestHeaders
  validate: validate
  parseResponse: parseResponse
