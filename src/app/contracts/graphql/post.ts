export const GET_TRENDING_FEED = `
        query TrendingFeed {
          trendingFeed {
            authorInfo {
              follower {
                totalCount
              }
              following {
                totalCount
              }
              friendlyName
              snsName
            }
            content
            id
            postedAt
          }
        }`;

export const GET_TIMELINE = `
query Timeline($input: BaseQueryInput) {
  timeline {
    posts(input: $input) {
      totalCount
      edges {
        cursor
        node {
          authorInfo {
            follower {
              totalCount
            }
            following {
              totalCount
            }
            followRelation {
              followed
              followingMe
            }
            friendlyName
            snsName
          }
          content
          id
          postedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

export const CREATE_POST =`
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    postedAt
  }
}`;