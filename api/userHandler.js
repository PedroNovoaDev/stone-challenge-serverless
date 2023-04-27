const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'stone-users';
const authAux = require('../auxiliars/auth');
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

  const token = authAux.generateToken(user);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: token })
  }
};

module.exports.searchUserById = async (event) => {

  const authResult = await authAux.authorize(event);
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