const countapi = require('countapi-js');
const authAux = require('../auxiliars/auth');

module.exports.showTonVisitCount = async (event) => {

  const authResult = await authAux.authorize(event);
  if (authResult.statusCode == 401) return authResult

  let result;
  result = await countapi.get('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')
  console.log(result)

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};

module.exports.incrementTonVisitCount = async (event) => {

  const authResult = await authAux.authorize(event);
  if (authResult.statusCode == 401) return authResult

  let result;
  result = await countapi.hit('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')
  console.log(result)

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};