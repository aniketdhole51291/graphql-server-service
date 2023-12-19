import axios from "axios";
import { GIT_API, GIT_REST_API } from "../constant/variable";
import { repositoriesDetailsQuery, repositoriesQuery } from "../query/query.service";

const headers = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const resolvers = {
  Query: {
    repositories: async (_: any, { username, token }: { username: string; token: string }) => {
      try {
        const response = await axios.post(
          GIT_API,
          {
            query: repositoriesQuery(username),
          },
          {
            headers: headers(token),
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
          GIT_API,
          {
            query: repositoriesDetailsQuery(username, repoName),
          },
          {
            headers: headers(token),
          }
        );

        const repository = repositoryResponse.data.data.repository;

        // Fetch additional details using the GitHub REST API
        const repoDetailsResponse: any = await axios.get(
          `${GIT_REST_API}${username}/${repoName}`,
          {
            headers: headers(token),
          }
        ).catch(err => {
          return {}
        })

        // Fetch content of 1 YAML file
        const yamlFileContentResponse: any = await axios.get(
          `${GIT_REST_API}${username}/${repoName}/contents/*.yml`,
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
          `${GIT_REST_API}${username}/${repoName}/hooks`,
          {
            headers: headers(token),
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
