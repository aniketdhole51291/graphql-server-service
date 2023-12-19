import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './resolvers/resolver.service';
import { typeDefs } from './constant/gql';

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const app: any = express();

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});