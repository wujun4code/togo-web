import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { NavItems, NavAction } from '../components/nav/header';
import { Image } from "@nextui-org/react";
import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { City, Now, ClientContext, ClientContextValue, LoaderContext, ServerContextValue, ServerContext } from '../contracts';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import React from "react";
import { useAsyncList } from "@react-stately/data";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo-blue.svg",
    as: "image",
    type: "image/svg+xml",
  }
];

export const meta: MetaFunction = () => {
  return [
    { title: "Towa" },
    { name: "description", content: "Welcome to Towa!" },
  ];
};

interface IndexLoaderContext extends LoaderContext {
  initCities: City[];
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<IndexLoaderContext> {

  const serverContext = new ServerContextValue();
  const clientContext = new ClientContextValue(serverContext);

  const GET_TOP_CITIES = `
  query TopCities {
    topCities {
      name
      id
      lat
      lon
      adm2
      adm1
      country
      tz
      utcOffset
      isDst
      type
      rank
      fxLink
    }
  }
`;
  const cookie = request.headers.get("Cookie");
  const url = new URL(request.url);
  const location = url.searchParams.get("location");

  try {
    const variables = { "lang": "zh" };
    const data = await clientContext.dataSources.graphql.query(clientContext, GET_TOP_CITIES, variables);
    const { topCities } = data;
    return { server: serverContext, initCities: topCities };
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  return { server: serverContext, initCities: [] };
}

type CitySelectOption = {
  label: string;
  value: string;
  description: string;
}

export default function Index() {
  const loaderContext = useLoaderData<typeof loader>();

  const { initCities, server } = loaderContext;
  const context = new ClientContextValue(server);

  const selectorDataSource = initCities.map(c => ({
    label: `${c.name},${c.adm2}`,
    value: c.id,
    description: `${c.adm2},${c.adm1}`,
  }));

  let list = useAsyncList<CitySelectOption>({
    async load({ filterText }) {
      if (!filterText) return { items: selectorDataSource, isLoading: false, };

      let filterLocations = await context.dataSources.geo.searchLocations(context, filterText);
      const mappedLocations = filterLocations.map(c => ({
        label: `${c.name},${c.adm2}`,
        value: c.id,
        description: `${c.adm2},${c.adm1}`,
      }));

      return {
        items: mappedLocations,
        isLoading: false,
      };
    },
  });

  const [value, setValue] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<string | number>('');

  const onSelectionChange = (key: string | number) => {
    setSelectedKey(key);
    return selectedKey;
  };

  const onInputChange = (value: string) => {
    setValue(value);
  };

  return (
    <Navbar className="bg-white rounded-lg shadow-lg dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5">
      <NavbarBrand className="grow-0 basis--1">
        <Image
          width={60}
          alt="Towa Logo"
          src="/logo-blue.svg"
        />
        <p className="font-bold text-inherit">Towa</p>
      </NavbarBrand>
      <NavbarContent className="gap-4 grow-0">
        <NavbarItem className="flex flex-row items-center justify-between gap-2">
          <Autocomplete
            variant='bordered'
            // defaultItems={selectorDataSource}
            inputValue={list.filterText}
            isLoading={list.isLoading}
            items={list.items}
            label="Typing to search..."
            className="max-w-xs"
            allowsCustomValue={true}
            onSelectionChange={onSelectionChange}
            onInputChange={list.setFilterText}>
            {(city) => <AutocompleteItem key={city.value}>{city.label}</AutocompleteItem>}
          </Autocomplete>
          <p className="text-small text-default-500">{selectedKey}</p>
          <p className="text-small text-default-500">{value}</p>
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
