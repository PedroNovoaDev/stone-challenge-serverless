const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'stone-users';
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
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

function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    password: user.password,
  };
  return jwt.sign(payload, secret);
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports.showTonVisitCount = async (event) => {

  const token = event.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  let result;

  try {
    verifyToken(token);
    result = await countapi.get('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')
    console.log(result)
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Invalid token' });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};

module.exports.incrementTonVisitCount = async (event) => {

  const token = event.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  let result;

  try {
    verifyToken(token);
    result = await countapi.hit('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')
    console.log(result)
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Invalid token' })
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};

module.exports.addNewUser = async (event) => {

  const { id, name, password } = extractBody(event);

  const user = {
    id: id,
    name: name,
    password: password
  };

  const params = {
    TableName: tableName,
    Item: user
  };

  const token = generateToken(user);

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `User created successfully with token: ${token}` })
    };
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unable to create user' })
    };
  }
};

module.exports.searchUserById = async (event) => {

  const token = event.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const userId = event.pathParameters.id.toString();

  const params = {
    TableName: tableName,
    Key: { id: userId },
  };

  let user;

  try {
    verifyToken(token);
    user = await dynamodb.get(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    };
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unable to find user' })
    };
  }
};