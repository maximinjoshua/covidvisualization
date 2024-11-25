import * as React from 'react';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { MenuItem, Select, Grid, Container, FormControl, InputLabel, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { dataFetchServices } from '../../services/dataFetchServices';
import { PieChart } from '@mui/x-charts';

export default function Combining() {
  const [stateData, setStateData] = useState(null);
  const [onlyStateDataIndex, setOnlyStateDataIndex] = useState(null)
  const [selectedStateIndex, setSelectedStateIndex] = useState(null);
  const [stateDataOffset, setStateDataOffset] = useState(null)
  const [lineChartSeries, setLineChartSeries] = useState(null);
  const [lineChartSeriesActualCases, setLineChartSeriesActualCases] = useState(null)
  const [lineChartXAxis, setLineChartXAxis] = useState(null);
  const [pieChartSeries, setPieChartSeries] = useState([])

  const retrieveStateData = async () => {
    const response = await dataFetchServices.getCovidStateTimeSeriesData();
    setStateData(response?.data);
  };

  function getShortMonth(dateString) {
    const date = new Date(dateString);
    return date;
  }

  // pull data from somewhere
  useEffect(() => {
    retrieveStateData();
  }, []);

  const handleRangeChange = (offsetValue) => {
    setStateDataOffset(offsetValue);

    if (stateData) {
      const lineChartSeries = stateData[selectedStateIndex]["actualsTimeseries"].slice(offsetValue, offsetValue + 100).map((item) =>
        item.deaths
      );
      const lineChartSeriesActualCases = stateData[selectedStateIndex]["actualsTimeseries"].slice(offsetValue, offsetValue + 100).map((item) =>
        item.cases
      );
      const lineChartXAxis = stateData[selectedStateIndex]["actualsTimeseries"].slice(offsetValue, offsetValue + 100).map((item) =>
        getShortMonth(item.date)
      );

      setLineChartSeries(lineChartSeries);
      setLineChartSeriesActualCases(lineChartSeriesActualCases)
      setLineChartXAxis(lineChartXAxis);
    }
  };

  const handleStateChange = (index) => {
    setSelectedStateIndex(index)
    if (stateDataOffset) {
      const lineChartSeries = stateData[selectedStateIndex]["actualsTimeseries"].slice(stateDataOffset, stateDataOffset + 100).map((item) =>
        item.deaths
      );
      const lineChartXAxis = stateData[selectedStateIndex]["actualsTimeseries"].slice(stateDataOffset, stateDataOffset + 100).map((item) =>
        getShortMonth(item.date)
      );

      setLineChartSeries(lineChartSeries);
      setLineChartXAxis(lineChartXAxis);
    }
  }

  const getDateRangeDropdown = () => {
    if (stateData && selectedStateIndex != null) {
      const timeSeriesData = stateData[selectedStateIndex]["actualsTimeseries"];
      const timeSeriesDataLength = timeSeriesData.length;

      const ranges = Math.ceil(timeSeriesDataLength / 100);
      let rangeDropdownArray = [];

      for (let i = 0; i <= ranges; i++) {
        const actualsTimeseriesData = stateData[selectedStateIndex]["actualsTimeseries"]
        const actualsTimeseriesDataLength = actualsTimeseriesData.length
        const firstEntry = actualsTimeseriesData[i * 100]
        const lastEntry = actualsTimeseriesData[(i * 100) + 100]
        console.log(firstEntry, "firstentyr")
        console.log(lastEntry, "lkast")
        console.log(actualsTimeseriesData[actualsTimeseriesDataLength -1], "last")
        rangeDropdownArray.push({ "name": `${firstEntry?.["date"] ? firstEntry["date"] : actualsTimeseriesData[actualsTimeseriesDataLength -1]["date"]} - ${lastEntry?.["date"] ? lastEntry["date"]: actualsTimeseriesData[actualsTimeseriesDataLength -1]["date"]}`, "offsetValue": i * 100 });
      }

      return rangeDropdownArray;
    }
    else {
      return []
    }

  };

  const handleDateXAxisFormat = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const handleStateChangeForPie = (state) => {
    setOnlyStateDataIndex(state)
    const pieChartSeriesCases = stateData[state]["actuals"].cases
    const pieChartSeriesDeaths = stateData[state]["actuals"].deaths

    const survivedPercentage = (((pieChartSeriesCases - pieChartSeriesDeaths)/pieChartSeriesCases) *100).toFixed(2)

    setPieChartSeries([{ id: 0, value: pieChartSeriesCases - pieChartSeriesDeaths, label: `${survivedPercentage}% of affected people survived covid` },
    { id: 1, value: pieChartSeriesDeaths, label: `${(100-survivedPercentage).toFixed(2)}% of affected people succumbed to covid` }
    ])
  }

  return (
    stateData && (
      <Container maxWidth="lg" style={{ padding: '20px' }}>
        <Typography variant="h3" gutterBottom>
          Covid Data Analysis
        </Typography>
        <Container>
          <Typography variant="h4" gutterBottom>
            Covid Cases and Death trends Chart
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  label="State"
                  value={selectedStateIndex != null ? selectedStateIndex : ''}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {stateData.map((item, index) => (
                    <MenuItem key={index} value={index}>
                      {item.state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Range</InputLabel>
                <Select
                  label="Range"
                  onChange={(e) => handleRangeChange(e.target.value)}
                >
                  {getDateRangeDropdown().map((item) => (
                    <MenuItem key={item.offsetValue} value={item.offsetValue}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {lineChartSeries && lineChartXAxis && lineChartSeriesActualCases ? (
            <>
              <div style={{ marginTop: '30px' }}>
                <Typography>Covid deaths by Date</Typography>
                <LineChart
                  xAxis={[{ data: lineChartXAxis, valueFormatter: (value) => handleDateXAxisFormat(value) }]}
                  series={[
                    {
                      data: lineChartSeries,
                      valueFormatter: (value) => `${value} deaths`
                    },
                  ]}
                  width={800}
                  height={500}
                />
              </div>
              <div style={{ marginTop: '30px' }}>
              <Typography>Covid Cases by Date</Typography>
                <LineChart
                  xAxis={[{ data: lineChartXAxis, valueFormatter: (value) => handleDateXAxisFormat(value) }]}
                  series={[
                    {
                      data: lineChartSeriesActualCases,
                      valueFormatter: (value) => `${value} cases`
                    },
                  ]}
                  width={800}
                  height={500}
                />
              </div>
            </>

          ) : 
            <Box
              sx={{
                border: '1px dashed grey',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                margin: "30px"
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Select a state and range to display the graph.
              </Typography>
            </Box>
}

        </Container>
        <Container sx={{"margin": "20px"}}>
          <Typography variant='h4'>Covid survived to succumbed ratio by state</Typography>
        </Container>
        <Grid container sx={{"margin-top":"10px", "margin-bottom": "30px"}} spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                label="State"
                value={onlyStateDataIndex != null ? onlyStateDataIndex : ''}
                onChange={(e) => handleStateChangeForPie(e.target.value)}
              >
                {stateData.map((item, index) => (
                  <MenuItem key={index} value={index}>
                    {item.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {onlyStateDataIndex != null ? <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value} people`,
              data: pieChartSeries
            },
          ]}
          width={1000}
          height={200}
        /> :
          <Box
            sx={{
              border: '1px dashed grey',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
              margin: '30px'
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Select a state and range to display the graph.
            </Typography>
          </Box>
        }
      </Container>
    )
  );
}
