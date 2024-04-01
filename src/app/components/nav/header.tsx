import React, { FC } from "react";
import type { LinksFunction, } from "@remix-run/node";
import { NavProfile } from './login-signup';
import { Form } from '@remix-run/react';
import { Link } from "@remix-run/react";
import { FaLongArrowAltLeft } from "react-icons/fa";
import {
  Button, Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/index";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/index"

import { Separator } from "@components/index"
import {
  ChevronDownIcon,
  CircleIcon,
  PlusIcon,
  StarIcon,
} from "@radix-ui/react-icons"

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo-blue.svg",
    as: "image",
    type: "image/svg+xml",
  }
];

interface NavHeaderProps {
  title?: string;
}

export const NavHeader: FC<NavHeaderProps> = ({ title }) => {
  return (
    <>
      <nav className="flex mx-auto max-w-7xl items-center p-4">
        <div className="basis-1/4">
          <Link className="flex items-center" to="/">
            {/* <img
              className="size-16"
              alt="Towa Logo"
              src="/logo-blue.svg"
            /> */}
            <p className="font-bold text-inherit">ToGo</p>
          </Link>
        </div>
        <div className="flex basis-1/2 gap-4">
          {title && (<><Link className="flex flex-row items-center justify-between gap-2" to="/"><FaLongArrowAltLeft /><p className="text-2xl">{title}</p></Link></>)}
        </div>
        <NavProfile />
      </nav>
    </>
  );
}