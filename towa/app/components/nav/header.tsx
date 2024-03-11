import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import type { LinksFunction } from "@remix-run/node";
import { Image } from "@nextui-org/react";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo-blue.svg",
    as: "image",
    type: "image/svg+xml",
  }
];

export function NavItems() {
  return (
    <>
      <div className="bg-white rounded-lg p-4 text-base font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5">
        <ul className="flex">
          <li className="mr-4">
            <Button color="primary" variant="bordered">
              Log In
            </Button>
          </li>
          <li className="mr-4">
            <Button color="primary">
              Sign Up
            </Button>
          </li>
        </ul>
      </div>
    </>
  )
}

export function NavAction() {
  return (
    <Navbar>
      <NavbarBrand>
        <Image
          width={60}
          alt="Towa Logo"
          src="/logo-blue.svg"
        />
        <p className="font-bold text-inherit">Towa</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}