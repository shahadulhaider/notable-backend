const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
require('dotenv').config();

const db = require('./db');
const models = require('./models');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const { DB_HOST } = process.env;
const port = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors());

// database
db.connect(DB_HOST);

// get user's info from JWT token
/*  eslint-disable consistent-return */
const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
};

// Apollo server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);

    return { models, user };
  },
});

// Apollo middleware and set path to api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => {
  console.log(
    `GraphQL server running at http://localhost:${port}${server.graphqlPath}`,
  );
});
