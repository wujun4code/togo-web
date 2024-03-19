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
              openId
              snsName
            }
            content
            id
            postedAt
          }
        }`;

export const GET_TIMELINE = `
query Timeline($input: BaseQueryInput) {
  timeline(input: $input) {
    authorInfo {
      openId
      snsName
      friendlyName
      following {
        totalCount
      }
      follower {
        totalCount
      }
      followRelation {
        followed
        followingMe
      }
    }
    content
    id
    postedAt
  }
}`;

export const CREATE_POST =`
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    postedAt
  }
}`;