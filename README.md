# Stone Challenge Serverless

This serverless API was developed as part of a challenge for a job position in Stone.

The challenge consisted of developing an API that would count the number of accesses to Ton's website and allow for a user to create an account. The API should have 4 routes:

1. A route to increase the number of hits;
2. A route to check the number of accesses;
3. A route to create a user;
4. A route to view a user's information.

Bonus points for clean code practices, good versioning,  deploying in a server and having a documentation.

## Stack used

**Back-end:** Node, Serverless

**Infrastucture:** API Gateway, Lambda, DynamoDB


## Running local

- Configure you AWS account with serverless.

Clone the project

```bash
  git clone https://github.com/PedroNovoaDev/stone-challenge-serverless
```

Move to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Run the server

```bash
  sls offline
```


## Environment variables

To run this project, you'll need to modify the following env variables in your serverless.yml

`SALT`
`JWT_SECRET`


## Endpoints

#### Creates a new user with name and password.
```http
  POST /add-new-user
```

| Body   | Type       | Description                           |
| :---------- | :--------- | :---------------------------------- |
| `id` | `string` | User ID |
| `userName` | `string` | Username |
| `password` | `string` | User password |



#### Login with a user account..
```http
  POST /user-login
```

| Body   | Type       | Description                           |
| :---------- | :--------- | :---------------------------------- |
| `userName` | `string` | Username |
| `password` | `string` | User password |



#### Searchs DynamoDB for a existing user by his ID.
```http
  GET /search-user-by-id/${id}
```

| Header   | Type       | Description                                   |
| :---------- | :--------- | :------------------------------------------ |
| `authorization`      | `string` | **Required**. Token provided in the login of user |

| Parameter   | Type       | Description                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Required**. ID of the user to search |



#### Show Ton website visit count at the moment of the call.
```http
  GET /show-ton-visit-count
```

| Header   | Type       | Description                                   |
| :---------- | :--------- | :------------------------------------------ |
| `authorization`      | `string` | **Required**. Token provided in the login of user |



#### Increment Ton website visit count at the moment of the call.
```http
  GET /increment-ton-visit-count
```

| Header   | Type       | Description                                   |
| :---------- | :--------- | :------------------------------------------ |
| `authorization`      | `string` | **Required**. Token provided in the login of user |

## Documentation

[Swagger OpenApi documentation](https://app.swaggerhub.com/apis-docs/PedroNovoaDev/stone-challenge-serverless/1.0.0)