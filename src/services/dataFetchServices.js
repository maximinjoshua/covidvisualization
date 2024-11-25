import { basicCalls } from "./baseServices"

const apiKey = '4621cc693018434aa62cafbcb7b2c851'

const getCovidStateData = async() => {
    const response = await basicCalls.getRequest(`https://api.covidactnow.org/v2/states.json?apiKey=${apiKey}`)
    console.log(response, "state data response")
    return response
}

const getCovidStateTimeSeriesData = async() => {
    const response = await basicCalls.getRequest(`https://api.covidactnow.org/v2/states.timeseries.json?apiKey=${apiKey}`)
    console.log(response, "only state data response")
    return response
}

export const dataFetchServices = {getCovidStateData, getCovidStateTimeSeriesData}