_ = require('lodash')
csv = require('csvrow')


getListUrlNames = (vars) ->
  urlNames = toList(vars.list_ids or vars.list_id or vars.list_names or vars.list_name).map (v) ->
    v.toLowerCase().replace(/\s/g, '_').replace(/[^\w_]/g, '')
  urlNames.join('|')


getValues = (vars) ->
  toList(vars.values or [])
  

toList = (vals) ->
  vals = [vals] unless _.isArray(vals)
  vals = _.compact vals
  _.compact _.flatten vals.map (v) ->
    try
      csv.parse(v)
    catch
      _.map(v.split(','), _.trim)



getRequestHeaders = (api_key, setContentType = true) ->
  headers =
    'Accept': 'application/json'
    'Authorization': "Basic #{new Buffer("X:#{api_key}").toString('base64')}"

  headers['Content-Type'] = 'application/json' if setContentType

  headers


validate = (vars) ->
  return 'a list name is required' unless getListUrlNames(vars)
  return 'values must not be blank' unless getValues(vars).length


parseJSONBody = (res) ->
  if res.status == 401
    error: 'Authentication failed'
  else
    if res.headers['Content-Type'].indexOf('application/json') >= 0
      try
        JSON.parse(res.body)
      catch err
        error: 'Error parsing response'
    else
      error: 'Unsupported response'


parseResponse = (res) ->
  body = parseJSONBody(res)
  if body.error
    outcome: 'error'
    reason: body.error?.replace(/\.$/, '')
  else
    event = body
    event.outcome = 'success'
    event.reason = null
    event

getBaseUrl = ->
  switch process.env.NODE_ENV
    when 'production', 'test' then 'https://app.suppressionlist.com'
    when 'staging' then 'http://staging.suppressionlist.com'
    when 'development' then 'http://suppressionlist.dev'


module.exports =
  getListUrlNames: getListUrlNames
  getValues: getValues
  getRequestHeaders: getRequestHeaders
  validate: validate
  parseResponse: parseResponse
  getBaseUrl: getBaseUrl
