const countapi = require('countapi-js');

function extractBody(event) {
  if (!event?.body) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: "Missing body" }),
    }
  }

  return JSON.parse(event.body);
}

module.exports.showTonVisitCount = async (event) => {

  let result = await countapi.get('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')

  console.log(result)

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};

module.exports.incrementTonVisitCount = async (event) => {

  let result = await countapi.hit('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')

  console.log(result)

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};