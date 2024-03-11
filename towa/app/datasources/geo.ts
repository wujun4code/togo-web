import { ClientContext } from '../contracts/context';
import { Location } from '../contracts/qweather/geo';

export class GeoDataSource {

    async searchLocations(context: ClientContext, inputValue: string): Promise<Location[]> {
        const GET_LOCATIONS = `
query SearchLocations($location: String!, $lang: String!) {
  searchLocations(location: $location, lang: $lang) {
    country
    adm2
    adm1
    id
    lon
    lat
    name
    type
    utcOffset
    tz
  }
}
`;
        const variables = { "location": inputValue, "lang": "zh" };
        const data = await context.dataSources.graphql.query(context, GET_LOCATIONS, variables);
        return data.searchLocations;
    }
}