import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { TypedResponse, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { NavHeader } from '../components';
import { ServerContextValue, IUserContext } from '../contracts';
import { kFormatter } from '../services';
import { AuthenticatedUser, authenticator } from "../services/server/auth";
import { syncMyProfile, getPublicProfile } from '../services/server/user';
import { getFollowRelation } from '@services/server';

import { Button, ProfileHeader, FollowRelationButton } from "@components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@components/index";
import { Form } from '@remix-run/react';

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo-blue.svg",
    as: "image",
    type: "image/svg+xml",
  }
];

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  return [{ title: data?.basic?.friendlyName }];
};


type BasicProps = {
  avatar?: string;
  email: string;
  snsName: string;
  friendlyName?: string;
  follower?: any,
  following?: any;
}

interface ProfileContext {
  currentUser?: IUserContext;
  basic?: BasicProps;
  followRelation?: any;
}

export async function loader(args: LoaderFunctionArgs): Promise<TypedResponse<ProfileContext>> {
  const { request, params } = args;

  const snsName = params['snsName'];

  if (!snsName) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const serverContext = new ServerContextValue();

  const user = await authenticator.isAuthenticated(request);

  if (user !== null)
    await syncMyProfile(args, serverContext, user);


  const targetUser = await getPublicProfile(args, serverContext, {
    input: {
      snsName: snsName
    }
  });

  let followRelation = {};

  if (serverContext.user) {
    followRelation = await getFollowRelation(args, serverContext, {
      "input": {
        "originalSnsName": serverContext.user.togo.snsName,
        "targetSnsName": targetUser.snsName,
      }
    });
  }

  const data = json({ currentUser: serverContext.user, basic: targetUser, followRelation: followRelation });

  return data;
}

export default function Screen() {
  const { currentUser, basic, followRelation } = useLoaderData<typeof loader>();

  return (
    <>
      <NavHeader title="Profile" />
      <main className="relative flex container mx-auto max-w-7xl z-10 px-6 p-4">
        <div className="flex basis-1/4 ">

        </div>
        <div className="basis-1/2 flex flex-col max-w-2xl">
          <div className="flex w-full flex-col gap-4">

            <div className="flex gap-2 items-center">
              <ProfileHeader {...basic} followRelation={followRelation} currentUser={currentUser} />
            </div>

            <Tabs defaultValue="posts" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">Make changes to your account here.</TabsContent>
              <TabsContent value="likes">Change your password here.</TabsContent>
            </Tabs>
          </div>
          {/* <Form action="/auth/logout" method="post">
            <Button className="w-full max-w-2xl" color="danger" type="submit">Log Out</Button>
          </Form> */}
        </div>
      </main>
    </>
  );
}
