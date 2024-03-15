// import React, {
//     ReactNode,
//     createContext,
//     useContext,
//     useState
// } from "react";


// import { DataSourceConfig, IDataSources, IServices } from '../contracts/context';
// import { GeoDataSource, GraphQLDataSource, OAuth2DataSource } from '../datasources';
// import { useDataSource } from './datasource';

// type ServicesContextType = {
//     services: IServices;
//     setServices: React.Dispatch<React.SetStateAction<IServices>>;
// }

// export const ServiceContext = createContext<ServicesContextType>({} as ServicesContextType);
// export const useServices = () => useContext(ServiceContext);


// export const ServiceProvider = ({ children }: { children: ReactNode }) => {

//     const [services, setServices] = useState<IServices>({

//     });

//     return (
//         <ServiceContext.Provider value={{ services, setServices, }}>
//             {children}
//         </ServiceContext.Provider>
//     );
// }
