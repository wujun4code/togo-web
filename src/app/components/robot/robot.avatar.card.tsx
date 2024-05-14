import { AvatarProfileCard } from "@components";
import React, { FC, useState } from "react";
import { IClientContext, AvatarProfile, Robot, UserRobot, UserRobotConnection, EdgeConnection } from '@contracts';
import { useOutletContext } from "@remix-run/react";
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
} from "@components";
import { Button } from "@components";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

interface RobotAvatarCardProps {
    robot: Robot
}

export const RobotAvatarCard: FC<RobotAvatarCardProps> = ({ robot }) => {

    const outletContext = useOutletContext<IClientContext>();
    const { relatedUser: targetUser } = robot;

    const labels = [
        {
            value: "bug",
            label: "Bug",
        },
        {
            value: "feature",
            label: "Feature",
        },
        {
            value: "documentation",
            label: "Documentation",
        },
    ]

    const actionMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted justify-self-end">
                    <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Make a copy</DropdownMenuItem>
                <DropdownMenuItem>Favorite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value="xxx">
                            {labels.map((label) => (
                                <DropdownMenuRadioItem key={label.value} value={label.value}>
                                    {label.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AvatarProfileCard
            targetUser={targetUser}
            currentUser={outletContext.user}
            actionMenu={actionMenu}>

        </AvatarProfileCard>
    );
}

interface RobotAvatarListCardProps {
    robotConnection: EdgeConnection<Robot>;
    managingUser?: AvatarProfile;
}

export const RobotAvatarCardList: FC<RobotAvatarListCardProps> = ({ robotConnection, managingUser }) => {

    const [robots, setRobots] = useState<EdgeConnection<Robot>>(robotConnection);
    const outletContext = useOutletContext<IClientContext>();

    const mapToCardProps = (robot: Robot): RobotAvatarCardProps => {
        return { robot };
    }

    const [cards, setCards] = useState(robots ? robots.edges.map(e => mapToCardProps(e.node)) : []);
    return (
        <>
            {!cards ? (
                <p>Loading...</p>
            ) :
                <div>
                    {cards.map((robot) => {
                        return (
                            <div key={robot.robot.id} className="">
                                <RobotAvatarCard  {...robot}></RobotAvatarCard>
                            </div>
                        );
                    })}
                </div>
            }
        </>
    );
}