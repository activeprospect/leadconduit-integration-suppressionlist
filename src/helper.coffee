_ = require('lodash')
csv = require('csvrow')


getListUrlNames = (vars) ->
  urlNames = toList(vars.list_ids or vars.list_id or vars.list_names or vars.list_name).map (v) ->
    v.toLowerCase().replace(/\s/g, '_').replace(/[^\w_]/g, '')
  urlNames.join('|')


getValues = (vars) ->
  toList(vars.values or vars.value or [])

toList = (vals) ->
  vals = [vals] unless _.isArray(vals)
  vals = _.compact vals
  _.compact _.flatten vals.map (v) ->
    csv.parse(v)



getRequestHeaders = (api_key, setContentType = true) ->
  headers =
    'Accept': 'application/json'
    'Authorization': "Basic #{new Buffer("X:#{api_key}").toString('base64')}"

  headers['Content-Type'] = 'application/json' if setContentType

  headers


validate = (vars) ->
  try
    listName = getListUrlNames(vars)
  catch
    return 'invalid list name format'
  try
    values = getValues(vars)
  catch
    return 'invalid values format'

  return 'a list name is required' unless listName
  return 'values must not be blank' unless values.length


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
    event.duration = res.headers['X-Runtime']
    event

getBaseUrl = ->
  switch process.env.NODE_ENV
    when 'staging' then 'http://staging.suppressionlist.com'
    when 'development' then 'http://suppressionlist.dev'
    else 'https://app.suppressionlist.com'



normalizeHeaders = (headers) ->
  normalHeaders = {}
  for field, value of headers
    normalizePart = (part) ->
      "#{part[0].toUpperCase()}#{part[1..-1].toLowerCase()}"
    normalField = field.split('-').map(normalizePart).join('-')
    normalHeaders[normalField] = value
  normalHeaders



module.exports =
  getListUrlNames: getListUrlNames
  getValues: getValues
  getRequestHeaders: getRequestHeaders
  validate: validate
  parseResponse: parseResponse
  getBaseUrl: getBaseUrl
  normalizeHeaders: normalizeHeaders
