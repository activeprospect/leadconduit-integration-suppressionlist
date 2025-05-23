const _ = require('lodash');
const request = require('request');
const queryItem = require('./query_item');
const addItem = require('./add_item');
const helper = require('./helper');
const normalizeHeaders = helper.normalizeHeaders;

const wrap = (integration) => {
  return (vars, callback) => {
    let req;
    try {
      req = integration.request(vars);
    } catch (err) {
      return callback(err);
    }
    request(req, (err, resp, body) => {
      if (err) return callback(err);
      const res = {
        status: resp.statusCode,
        version: '1.1',
        headers: normalizeHeaders(resp.headers),
        body: body
      };
      let event;
      try {
        event = integration.response(vars, req, res);
      } catch (err) {
        return callback(err);
      }
      callback(null, event);
    });
  };
};

const query = wrap(queryItem);
const add = wrap(addItem);

const handle = (vars, callback) => {
  // check for existence of CPL token to determine if we should mask it
  const shouldMaskCplToken = !!vars.cplToken;
  query(vars, (err, queryEvent) => {
    if (err) return callback(err);
    // Duplicating data here until affected flows are corrected
    const event = _.merge({ is_unique: {} }, queryEvent);
    _.merge(event.is_unique, queryEvent);

    const outcome = _.get(queryEvent, 'query_item.outcome');
    const queryReason = _.get(queryEvent, 'query_item.reason');

    // Filter for any technical failures i.e. unpaid account
    if (outcome === 'failure' && queryReason === 'Unpaid account') {
      [event.is_unique.outcome, event.is_unique.reason] = ['failure', 'Unpaid account'];
      return callback(null, event);
    }

    const found = _.get(queryEvent, 'query_item.found');

    if (!found) {
      // delete CPL token on vars so that it isn't masked for the second request
      if (!shouldMaskCplToken) delete vars.cplToken;
      add(vars, (err, addEvent) => {
        if (err) return callback(err);
        // Duplicating data here until affected flows are corrected
        event.is_unique.outcome = 'success';
        _.merge(event, addEvent);
        _.merge(event.is_unique, addEvent);

        callback(null, event);
      });
    } else {
      [event.is_unique.outcome, event.is_unique.reason] = ['failure', 'Duplicate'];
      callback(null, event);
    }
  });
};

const requestVariables = () => {
  return [
    { name: 'list_name', description: 'SuppressionList List URL Name', required: true, type: 'string' },
    { name: 'value', description: 'Phone, email or other value to be added to the list', required: true, type: 'string' }
  ];
};

const responseVariables = () => {
  const vars = [
    { name: 'is_unique.outcome', type: 'string', description: 'Success if the item checked was unique, failure if a duplicate' },
    { name: 'is_unique.reason', type: 'string', description: 'If the outcome is not success, the reason why (e.g., "Duplicate")' }
  ];
  const queryVars = queryItem.response.variables().map((v) => {
    v.name = `is_unique.${v.name}`;
    return v;
  });
  const addVars = addItem.response.variables().map((v) => {
    v.name = `is_unique.${v.name}`;
    return v;
  });

  return vars.concat(queryVars).concat(addVars);
};

const validate = (vars) => {
  let listName;
  try {
    listName = helper.getListUrlNames(vars);
    if (listName.indexOf('|') > -1) {
      return 'multiple lists not supported';
    }
  } catch (err) {
    return 'invalid list name format';
  }

  try {
    const values = helper.getValues(vars);
    if (values.length === 0) {
      return 'value required';
    } else if (values.length > 1) {
      return 'multiple values not supported';
    }
  } catch (err) {
    return 'invalid value format';
  }

  if (!listName) return 'a list name is required';
};

const name = 'Query and Add Missing Item';

module.exports = {
  name,
  handle,
  requestVariables,
  responseVariables,
  validate
};
