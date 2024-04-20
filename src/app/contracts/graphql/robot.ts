export const USER_ROBOT = `
query UserRobot($input: SharedPublicProfileInput) {
    userRobot(input: $input) {
      managingRobots {
        totalCount
        edges {
          node {
            id
            hookUrl
            relatedUser {
              openId
              snsName
              avatar
              bio
              friendlyName
            }
            website
          }
        }
      }
    }
  }`;