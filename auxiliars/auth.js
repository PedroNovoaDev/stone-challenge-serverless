const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

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

function generateToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: '24h' });
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = {
    authorize,
    generateToken,
    verifyToken
};