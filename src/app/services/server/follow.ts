
import { executeGraphQL } from '../../datasources/.server/graphq';
import type { LoaderFunctionArgs } from "@remix-run/node";
import { IServerContext, getGqlHeaders } from '@contracts';
import { GQL } from '@GQL';

export const getFollowRelation = async (args: LoaderFunctionArgs, serverContext: IServerContext, variables?: any) => {

  const { followRelation } = await executeGraphQL(args, serverContext, GQL.FOLLOW_RELATION, variables);
  return followRelation;
}