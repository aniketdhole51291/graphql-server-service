import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import axios from 'axios';

const typeDefs = gql`
type Owner {
  login: String!
}

type Repository {
  id: ID!
  name: String!
  url: String!
  owner: Owner!
  diskUsage: String
  visibility: String
  fileCount: Int
  ymlFileContent: String
  activeWebhooks: Int
}

type Query {
  repositories(username: String!, token: String!): [Repository]
  repositoryDetails(username: String!, token: String!, repoName: String!): Repository
}
`;


const resolvers = {
  Query: {
    repositories: async (_: any, { username, token }: { username: string; token: string }) => {
      try {
        const response = await axios.post(
          'https://api.github.com/graphql',
          {
            query: `
              query {
                user(login: "${username}") {
                  repositories(first: 3, orderBy: { field: CREATED_AT, direction: DESC }) {
                    edges {
                      node {
                        id
                        name
                        url
                        diskUsage
                        visibility
                        owner {
                          login
                        }
                      }
                    }
                  }
                }
              }
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data.user.repositories.edges.map(({ node }: any) => node);
      } catch (error) {
        console.error('Error fetching repositories:', error.response?.data || error.message);
        throw new Error('Failed to fetch repositories');
      }
    },
    repositoryDetails: async (_: any, { username, token, repoName }: { username: string; token: string; repoName: string }) => {
      try {
        const repositoryResponse = await axios.post(
          'https://api.github.com/graphql',
          {
            query: `
              query {
                repository(owner: "${username}", name: "${repoName}") {
                  id
                  name
                  url
                  diskUsage
                  visibility
                  owner {
                    login
                  }
                }
              }
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const repository = repositoryResponse.data.data.repository;

        // Fetch additional details using the GitHub REST API
        const repoDetailsResponse: any = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(err => {
          return {}
        })

        // Fetch content of 1 YAML file
        const yamlFileContentResponse: any = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}/contents/*.yml`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(err => {
          return {}
        })

        // Fetch active webhooks
        const webhooksResponse: any = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}/hooks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(err => {
          return {}
        })

        return {
          ...repository,
          fileCount: repoDetailsResponse?.data?.size,
          ymlFileContent: yamlFileContentResponse?.data?.content ? Buffer.from(yamlFileContentResponse?.data?.content, 'base64').toString() : "",
          activeWebhooks: webhooksResponse?.data?.length,
        };
      } catch (error) {
        console.error('Error fetching repository details:', error.response?.data || error.message);
        throw new Error('Failed to fetch repository details');
      }
    },
  },
};;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});