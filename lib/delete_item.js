const helper = require('./helper');

const request = (vars) => {
  const values = helper.getValues(vars);
  const listNames = helper.getListUrlNames(vars);
  const baseUrl = helper.getBaseUrl();

  return {
    url: `${baseUrl}/lists/${listNames}/items`,
    method: 'DELETE',
    headers: helper.getRequestHeaders(vars.activeprospect.api_key),
    body: JSON.stringify({ values: values })
  };
};

request.variables = () => [
  { name: 'list_name', description: 'SuppressionList List URL Name', required: true, type: 'string' },
  { name: 'values', description: 'Phone, email or other values to be removed from the specified lists (comma separated)', required: true, type: 'string' }
];

const response = (vars, req, res) => {
  return { delete_item: helper.parseResponse(res) };
};

response.variables = () => [
  { name: 'delete_item.outcome', type: 'string', description: 'Was SuppressionList response data appended?' },
  { name: 'delete_item.reason', type: 'string', description: 'Error reason' },
  { name: 'delete_item.deleted', type: 'number', description: 'the number of items removed from the list' },
  { name: 'delete_item.rejected', type: 'number', description: 'the number of items not removed from the list' },
  { name: 'delete_item.duration', type: 'number', description: 'The number of seconds the API call took, according to SuppressionList' }
];

module.exports = {
  validate: helper.validate,
  request,
  response
};
