const repositoriesQuery = (username: string) => {
  return `
    query {
      user(login: "${username}") {
        repositories(first: 3, orderBy: { field: CREATED_AT, direction: DESC }) {
          edges {
            node {
              id
              name
              diskUsage
              owner {
                login
              }
            }
          }
        }
      }
    }
  `
}

const repositoriesDetailsQuery = (username: string, repoName: string) => {
  return `
    query {
        repository(owner: "${username}", name: "${repoName}") {
          url
          visibility
          }
          file: object(expression: "master:codgen.yml") {
            ... on Blob {
              text
            }
          }
        }
      }
  `
}

export {
  repositoriesQuery, repositoriesDetailsQuery
}