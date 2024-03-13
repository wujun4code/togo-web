import { ClientContext } from '../contracts/context';

export class PostService {

    async getTimeline(context: ClientContext) {

        const GET_TIMELINE = `
        query Timeline {
            timeline {
              authorId
              postedAt
              id
              content
            }
          }`;

        const data = await context.dataSources.graphql.query(context, GET_TIMELINE);
        return data;
    }
}