const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');
const models = require('./models');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const { DB_HOST } = process.env;
const port = process.env.PORT || 4000;

const app = express();

// database
db.connect(DB_HOST);

// Apollo server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  },
});

// Apollo middleware and set path to api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => {
  console.log(
    `GraphQL server running at http://localhost:${port}${server.graphqlPath}`,
  );
});
