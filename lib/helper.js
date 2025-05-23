const _ = require('lodash');
const csv = require('csvrow');

const getListUrlNames = (vars) => {
  const urlNames = toList(vars.list_ids || vars.list_id || vars.list_names || vars.list_name).map((v) => {
    return v.toLowerCase().replace(/\s/g, '_').replace(/[^\w_]/g, '');
  });
  return urlNames.join('|');
};

const getValues = (vars) => {
  return toList(vars.values || vars.value || []);
};

const toList = (vals) => {
  if (!_.isArray(vals)) { vals = [vals]; }
  vals = _.compact(vals);
  const parsedVals = _.flatten(vals.map(v => {
    return csv.parse(v);
  }));
  return _.compact(parsedVals);
};

const getRequestHeaders = (vars, setContentType = true) => {
  vars.cplToken = vars.cplToken || process.env.SUPPRESSIONLIST_CPL_TOKEN;

  const headers = {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(`X:${vars.activeprospect.api_key}`).toString('base64')}`
  };

  if (setContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (vars.cplToken) {
    headers['CPL-Token'] = vars.cplToken;
    // mask CPL token
    vars.cplToken = Array(vars.cplToken.length + 1).join('*');
  }

  return headers;
};

const validate = (vars) => {
  let listName = '';
  let values = [];
  try {
    listName = getListUrlNames(vars);
  } catch (e) {
    return 'invalid list name format';
  }

  try {
    values = getValues(vars);
  } catch (e) {
    return 'invalid values format';
  }

  if (!listName) return 'a list name is required';
  if (!values.length) return 'values must not be blank';
};

const parseJSONBody = (res) => {
  if (res.status === 401) {
    return { error: 'Authentication failed' };
  } else if (res.status === 402) {
    return { failure: 'Unpaid account' };
  } else if (res.headers['Content-Type'].indexOf('application/json') >= 0) {
    try {
      return JSON.parse(res.body);
    } catch (e) {
      return { error: 'Error parsing response' };
    }
  } else {
    return { error: 'Unsupported response' };
  }
};

const parseResponse = (res) => {
  const body = parseJSONBody(res);
  if (body.error) {
    return {
      outcome: 'error',
      reason: body.error.replace(/\.$/, '')
    };
  } else if (body.failure) {
    return {
      outcome: 'failure',
      reason: body.failure.replace(/\.$/, '')
    };
  } else {
    const event = body;
    event.outcome = 'success';
    event.reason = null;
    event.duration = res.headers['X-Runtime'];
    return event;
  }
};

const getBaseUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'staging':
      return 'https://staging.suppressionlist.com';
    case 'development':
      return 'https://development.suppressionlist.com';
    default:
      return 'https://app.suppressionlist.com';
  }
};

const normalizeHeaders = (headers) => {
  const normalHeaders = {};

  Object.keys(headers).forEach(key => {
    const normalizePart = (part) => _.capitalize(part);
    const normalField = key.split('-').map(normalizePart).join('-');
    normalHeaders[normalField] = headers[key];
  });
  return normalHeaders;
};

module.exports = {
  getListUrlNames,
  getValues,
  getRequestHeaders,
  validate,
  parseResponse,
  getBaseUrl,
  normalizeHeaders
};
