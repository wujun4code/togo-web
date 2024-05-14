import {
    Button, Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@components/index";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@components/index"
import { BiRepost } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa6";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { Separator } from "@components/index"
import { CommentAddDialog, AvatarSNS, RenderContent } from '@components/index';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@components/ui/drawer";


import React, { FC, useState, ReactNode } from "react";
import { IUserContext, AvatarProfile } from '@contracts';
import { LoadingState, useUserState } from "../../hooks";
import {
    ChevronDownIcon,
    CircleIcon,
    PlusIcon,
    StarIcon,
} from "@radix-ui/react-icons"
import { Link, useNavigate } from "@remix-run/react";

export interface AvatarProfileCardProps {
    targetUser: AvatarProfile;
    currentUser?: IUserContext

    actionMenu?: ReactNode;
}

export const AvatarProfileCard: FC<AvatarProfileCardProps> = ({ targetUser, currentUser: initialCurrentUser, actionMenu }) => {

    const [isFollowed, setIsFollowed] = React.useState(targetUser.followed ? targetUser.followed : false);
    const [user, setUser] = useState(initialCurrentUser);
    const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();
    const currentUserOpenId = '';

    const [isHideFollow, setIsHideFollow] = React.useState(currentUserOpenId === targetUser.openId);

    const handleCardClick = (id: string) => {

    }

    const navigate = useNavigate();

    const handleCardContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        //navigate(`/post/${id}`);
    }

    return (
        <Card className="hover:bg-gray-100">
            <CardHeader className="flex flex-row justify-between gap-4 space-y-0 p-2 px-4 pt-6 pb-2">
                <AvatarSNS {...targetUser} currentUser={user} />
                {actionMenu && (
                    <>
                        {actionMenu}
                    </>
                )}
            </CardHeader>
            <CardContent onClick={e => handleCardContentClick(e)} className="cursor-pointer p-2 px-4 pt-2">
                {targetUser.bio}
            </CardContent>
            <CardFooter className="p-2 px-4 pt-2">
            </CardFooter>
        </Card>
    );
}
