import { gql } from "apollo-server-express";

export const typeDefs = gql`
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