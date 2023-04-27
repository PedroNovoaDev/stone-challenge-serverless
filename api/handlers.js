const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'stone-users';
const countapi = require('countapi-js');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const { pbkdf2Sync } = require('crypto');

function extractBody(event) {
  if (!event?.body) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: "Missing body" }),
    }
  }

  return JSON.parse(event.body);
}

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

async function authorize(event) {

  const authorization = event.headers.authorization;

  if (!authorization) {
    console.log('!authorization')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing authorization header' }),
    }
  }

  const [type, token] = authorization.split(' ')

  if (type != 'Bearer' || !token) {
    console.log('!Bearer')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unsuported authorization type' }),
    }
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    console.log('!decodedToken')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid token' }),
    }
  }

  return decodedToken;
}

module.exports.showTonVisitCount = async (event) => {

  const authResult = await authorize(event);
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

  const authResult = await authorize(event);
  if (authResult.statusCode == 401) return authResult

  let result;
  result = await countapi.hit('ton.com.br', '7c84145f-8ffc-4873-b6f7-3e92214f4267')
  console.log(result)

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
};

module.exports.addNewUser = async (event) => {

  const { id, userName, password } = extractBody(event);

  const hashedPass = pbkdf2Sync(password, process.env.SALT, 100000, 64, 'sha512').toString('hex');

  const user = {
    id: id,
    userName: userName,
    password: hashedPass
  };

  const params = {
    TableName: tableName,
    Item: user
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `User created successfully` })
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

  const authResult = await authorize(event);
  if (authResult.statusCode == 401) return authResult

  const userId = event.pathParameters.id.toString();

  const params = {
    TableName: tableName,
    Key: { id: userId },
  };

  let user;

  try {
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

module.exports.userLogin = async (event) => {
  const { userName, password } = extractBody(event);

  const hashedPass = pbkdf2Sync(password, process.env.SALT, 100000, 64, 'sha512').toString('hex');

  const params = {
    TableName: tableName,
    FilterExpression: "userName = :userNameValue AND password = :passwordValue",
    ExpressionAttributeValues: {
      ":userNameValue": userName,
      ":passwordValue": hashedPass
    }
  };

  const user = await dynamodb.scan(params).promise();

  if (user.Count == 0) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid credentials' }),
    }
  }

  const token = generateToken(user);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: token })
  }
};