import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { TypedResponse, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { NavHeader, CommentListCards } from '../components';
import { ServerContextValue, IUserContext } from '@contracts';
import { kFormatter } from '../services';
import { AuthenticatedUser, authenticator } from "../services/server/auth";
import { getPost } from '../services/server';
import { Button, } from "@components/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@components/index";
import { useRouteLoaderData } from "@remix-run/react";
import { IServerContext } from '../contracts';
import { Separator } from "@components/ui/separator";
import { CommentAddDialog, AvatarSNS, PostHeader, RenderContent } from '@components';
import { syncMyProfile, getPublicProfile } from '../services/server/user';
import { getFollowRelation } from '@services/server';

type PostDetailProps = {
    id: string;
    content: string;
}

export const meta: MetaFunction<typeof loader> = ({
    data,
}) => {
    return [{ title: data?.detail?.content }];
};

interface PostDetailContext {
    author?: any;
    detail?: PostDetailProps;
    comments?: any;
    repost?: any;
    like?: any;
    bookmark?: any;
    currentUser?: IUserContext;
    followRelation?: any;
}

export async function loader(args: LoaderFunctionArgs): Promise<TypedResponse<PostDetailContext>> {

    const { request, params } = args;

    const postId = params['id'];

    if (!postId) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    //console.log(`postId:${postId}`);

    //const rootData = useRouteLoaderData<IServerContext>("root");

    // const user = await authenticator.isAuthenticated(request);

    const serverContext = new ServerContextValue();
    const user = await authenticator.isAuthenticated(request);

    if (user !== null)
        await syncMyProfile(args, serverContext, user);

    const post = await getPost(args, serverContext, { postId: postId });

    const detail = {
        id: postId,
        content: post.content,
    };

    let followRelation = {};

    if (serverContext.user) {
        followRelation = await getFollowRelation(args, serverContext, {
            "followRelationInput": {
                "originalSnsName": serverContext.user.togo.snsName,
                "targetSnsName": post.authorInfo.snsName,
            },
            "publicProfileInput": { "snsName": post.authorInfo.snsName }
        });
    }


    const data = json({ detail: detail, currentUser: serverContext.user, comments: post.comments, author: post.authorInfo, followRelation: followRelation });

    return data;
}

export default function Screen() {
    const { detail, comments, author, followRelation, currentUser } = useLoaderData<typeof loader>();


    return (
        <>
            <NavHeader title="Post" />
            <main className="relative flex container mx-auto max-w-7xl z-10 px-6 p-4">
                <div className="flex basis-1/4 ">

                </div>
                <div className="basis-1/2 flex flex-col max-w-2xl gap-2 ">
                    <div className="flex flex-row gap-4 space-y-0 justify-between">
                        <PostHeader {...author} currentUser={currentUser} followRelation={followRelation} />
                    </div>
                    <div className="leading-7 [&:not(:first-child)]:mt-4 cursor-pointer">
                        <RenderContent text={detail?.content ?? ""} currentUser={currentUser} />
                    </div>
                    <Separator />
                    <CommentListCards commentConnection={comments} postId={detail!.id} currentUser={currentUser} />
                </div>
            </main>
        </>
    );
}
