import { IClientContext } from '../contracts/context';

export class WeatherService {

    async getAggregatedData(context: IClientContext, locationId: string) {

        const GETBYLOCATIONID = `
query GetHourlyByLocationId($locationId: String!, $hourly: HourlyForecastType!, $lang: String!, $hourLimit: Int, $daily: DailyForecastType!, $dayLimit: Int) {
  getHourlyByLocationId(locationId: $locationId, hourly: $hourly, lang: $lang, limit: $hourLimit) {
    fxTime
    temp
    icon
    text
    wind360
    windDir
    windScale
    windSpeed
    humidity
    pop
    precip
    pressure
    cloud
    dew
  }
  getNowByLocationId(locationId: $locationId, lang: $lang) {
    obsTime
    temp
    feelsLike
    icon
    text
    wind360
    windDir
    windScale
    windSpeed
    humidity
    precip
    pressure
    vis
    cloud
    dew
  }
  getDailyByLocationId(locationId: $locationId, daily: $daily, lang: $lang, limit: $dayLimit) {
    fxDate
    sunrise
    sunset
    moonrise
    moonset
    moonPhase
    moonPhaseIcon
    tempMax
    tempMin
    iconDay
    textDay
    iconNight
    textNight
    wind360Day
    windDirDay
    windScaleDay
    windSpeedDay
    wind360Night
    windDirNight
    windScaleNight
    windSpeedNight
    humidity
    precip
    pressure
    vis
    cloud
    uvIndex
  }
}`;
        const variables = {
            "locationId": locationId,
            "lang": 'zh',
            "hourly": "Hourly24H",
            "hourLimit": 6,
            "daily": "Daily7D",
            "dayLimit": 6
        }
        const data = await context.dataSources.graphql.query(context, GETBYLOCATIONID, variables);
        return data;
    }
}