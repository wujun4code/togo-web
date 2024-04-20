import { AvatarProfileCard } from "@components";
import React, { FC, useState } from "react";
import { IClientContext, AvatarProfile, Robot, UserRobot, UserRobotConnection, EdgeConnection } from '@contracts';
import { useOutletContext } from "@remix-run/react";

interface RobotAvatarCardProps {
    robot: Robot
}

export const RobotAvatarCard: FC<RobotAvatarCardProps> = ({ robot }) => {

    const outletContext = useOutletContext<IClientContext>();
    const { relatedUser: targetUser } = robot;

    return (
        <AvatarProfileCard targetUser={targetUser} currentUser={outletContext.user} >

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