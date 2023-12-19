const repositoriesQuery = (username: string) => {
  return `
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
  `
}

const repositoriesDetailsQuery = (username: string, repoName: string) => {
  return `
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
  `
}

export {
  repositoriesQuery, repositoriesDetailsQuery
}