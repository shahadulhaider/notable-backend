const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');
const models = require('./models');

const { DB_HOST } = process.env;
const port = process.env.PORT || 4000;

// const notes = [
//   {
//     id: '1',
//     content: 'This is a note',
//     author: 'Albert Einstein',
//   },
//   {
//     id: '2',
//     content: 'This is another note',
//     author: 'Enrico Fermi',
//   },
//   {
//     id: '3',
//     conent: 'This is a notation',
//     author: 'Mark Anthony',
//   },
// ];

// Construct a schema using GraphQL's schema language
const typeDefs = gql`
  type Note {
    id: ID
    content: String
    author: String
  }

  type Query {
    hello: String
    notes: [Note]
    note(id: ID): Note
  }

  type Mutation {
    newNote(content: String): Note
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL',
    notes: async () => {
      return await models.Note.find();
    },
    note: async (parent, args) => {
      return await models.Note.findById(args.id);
    },
  },
  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create({
        content: args.content,
        author: 'Albert Einstein',
      });
    },
  },
};

const app = express();

// database
db.connect(DB_HOST);

// Apollo server setup
const server = new ApolloServer({ typeDefs, resolvers });

// Apollo middleware and set path to api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => {
  console.log(
    `GraphQL server running at http://localhost:${port}${server.graphqlPath}`,
  );
});
