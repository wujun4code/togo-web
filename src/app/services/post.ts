import { IClientContext } from '../contracts/context';
interface AuthorInfo {
  openId: string;
  snsName: string;
  friendlyName: string;
  following: {
    totalCount: number;
  };
  follower: {
    totalCount: number;
  };
  followRelation: {
    followed: boolean;
    followingMe: boolean;
  };
}

interface Post {
  authorInfo: AuthorInfo;
  content: string;
  id: string;
  postedAt: string; // Consider using a Date type if needed
}
export class PostService {

  async getTrendingFeed(context: IClientContext): Promise<Post[]> {

    const GET_TRENDING_FEED = `
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
    const data = await context.dataSources.graphql.query(context, GET_TRENDING_FEED);
    return data.trendingFeed;
  }

  async getTimeline(context: IClientContext): Promise<Post[]> {

    const GET_TIMELINE = `
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

    const variables = {
      "input": {
        "filters": {},
        "limit": 10,
        "skip": 0,
        "sorter": {}
      }
    };
    const data = await context.dataSources.graphql.query(context, GET_TIMELINE, variables);
    return data.timeline;
  }
}