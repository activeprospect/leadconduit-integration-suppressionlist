const helper = require('./helper');

const request = (vars) => {
  const values = helper.getValues(vars);
  const listNames = helper.getListUrlNames(vars);
  const baseUrl = helper.getBaseUrl();

  return {
    url: `${baseUrl}/lists/${listNames}/items`,
    method: 'POST',
    headers: helper.getRequestHeaders(vars.activeprospect.api_key),
    body: JSON.stringify({values: values})
  };
};


request.variables = () => [
  { name: 'list_name', description: 'SuppressionList List URL Name', required: true, type: 'string' },
  { name: 'values', description: 'Phone, email or other values to be added to the list (comma separated)', required: true, type: 'string' }
];


const response = (vars, req, res) => {
  return { add_item: helper.parseResponse(res) };
};

response.variables = () => [
  { name: 'add_item.outcome', type: 'string', description: 'Was SuppressionList response data appended?' },
  { name: 'add_item.reason', type: 'string', description: 'Error reason' },
  { name: 'add_item.accepted', type: 'number', description: 'the number of items added to the list' },
  { name: 'add_item.rejected', type: 'number', description: 'the number of items not added to the list' },
  { name: 'add_item.duration', type: 'number', description: 'The number of seconds the API call took, according to SuppressionList' }
];

module.exports = {
  type: 'outbound',
  validate: helper.validate,
  request,
  response
};
