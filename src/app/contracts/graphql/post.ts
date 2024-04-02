export const GET_TRENDING_FEED = `
query Timeline($input: BaseQueryInput) {
  trendingFeed {
    posts(input: $input) {
      totalCount
      edges {
        cursor
        node {
          authorInfo {
            avatar
            bio
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
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
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
            avatar
            bio
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

export const GET_POST =`
query Post($postId: ID!) {
  post(id: $postId) {
    authorInfo {
      avatar
      bio
      snsName
      friendlyName
    }
    content
    id
    postedAt
    comments {
      edges {
        cursor
        node {
          content
          createdAt
          id
          updatedAt
          authorInfo {
            avatar
            bio
            snsName
            friendlyName
            follower {
              totalCount
            }
            following {
              totalCount
            }
          }          
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
}`;

export const CREATE_COMMENTS = `
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    content
    createdAt
    updatedAt
  }
}
`;