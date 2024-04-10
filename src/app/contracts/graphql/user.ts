export const GET_MY_PROFILE = `
query GetUserProfile($input: BaseQueryInput) {
    userProfile {
      avatar
      bio
      follower {
        totalCount
      }
      following {
        totalCount
      }
      friendlyName
      oauth2BindingsConnection(input: $input) {
        edges {
          cursor
          node {
            oauth2 {
              clientId
              provider
            }
            openId
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
      snsName
      openId
    }
  }`;


export const GET_PUBLIC_PROFILE = `
  query PublicProfile($input: SharedPublicProfileInput!) {
    publicProfile(input: $input) {
      avatar
      bio
      follower {
        totalCount
      }
      following {
        totalCount
      }
      friendlyName
      openId
      snsName
      posts {
        edges {
          node {
            content
            id
            postedAt
          }
        }
      }
    }
  }`;

export const GET_PUBLIC_SNS_PROFILE = `
  query PublicProfile($input: SharedPublicProfileInput!) {
    publicProfile(input: $input) {
      avatar
      bio
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
  }`;

export const AUTHENTICATION = `
query Authentication($input: JWTInput!) {
  authentication(input: $input) {
    jwt
    profile {
      snsName
      openId
      friendlyName
      following {
        totalCount
      }
      follower {
        totalCount
      }
    }
  }
}`;

export const FOLLOW = `
mutation Follow($input: FollowInput) {
  follow(input: $input) {
    followerRank
    totalFollowing
  }
}
`;

export const UNFOLLOW = `
mutation Unfollow($input: UnfollowInput) {
  unfollow(input: $input) {
    totalFollowing
  }
}`;

export const FOLLOW_RELATION = `
query FollowRelation($followRelationInput: FollowRelationInput!, 
  $publicProfileInput: SharedPublicProfileInput!) {
  followRelation(input: $followRelationInput) {
    asFollowee {
      followedAt
    }
    asFollower {
      followedAt
    }
  }
  publicProfile(input: $publicProfileInput) {
    following {
      totalCount
    }
    follower {
      totalCount
    }
    avatar
    bio
    friendlyName
    openId
    snsName
  }
}
`;