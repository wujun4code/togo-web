import React, {
    ReactNode,
    createContext,
    useContext,
    useState
} from "react";
import { DataSourceConfig, IDataSources } from '../contracts/context';
import { GeoDataSource, GraphQLDataSource, OAuth2DataSource } from '../datasources/index';

type DataSourcesContextType = {
    dataSourceConfig: DataSourceConfig;
    setDataSourceConfig: React.Dispatch<React.SetStateAction<DataSourceConfig>>;
}

export const DataSourceContext = createContext<DataSourcesContextType>({
    dataSourceConfig: {
        graphql: { serverUrl: "http://localhost:4000" },
        oauth2: { serverUrl: "" }
    },
    setDataSourceConfig: (c) => {

    },
});

export const useDataSource = () => useContext(DataSourceContext);

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {

    const [dataSourceConfig, setDataSourceConfig] = useState<DataSourceConfig>({
        graphql: { serverUrl: "http://localhost:4000" },
        oauth2: { serverUrl: "" }
    });

    return (
        <DataSourceContext.Provider value={
            { dataSourceConfig, setDataSourceConfig }}>
            {children}
        </DataSourceContext.Provider>
    );
}
