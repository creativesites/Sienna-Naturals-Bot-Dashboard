// components/child/UsersOverviewOne.js
"use client";
import useReactApexChart from "@/hook/useReactApexChart";
import dynamic from "next/dynamic";
import { useState, useEffect } from 'react'; // Import useState and useEffect

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const UsersOverviewOne = () => {
  // let { donutChartSeries, donutChartOptions } = useReactApexChart(); // We'll define options and series locally
  const [hairConcernsData, setHairConcernsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Today');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/hair-concerns-overview?timeframe=${selectedTimeframe}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('hair concerns', data)
        // Transform data for the donut chart
        const chartData = data.map(item => ({
          label: item.concern,
          value: item.count
        }));

        setHairConcernsData(chartData);

      } catch (error) {
        setError(error.message);
        console.error("Error fetching hair concerns overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Prepare series and options for the chart
  const chartSeries = hairConcernsData.map(item => item.value);
  const chartLabels = hairConcernsData.map(item => item.label);


  const chartOptions = {
    chart: {
      type: 'donut',
      height: 264
    },
    labels: chartLabels,
    colors: ["#487FFF", "#FF9F29", "#45B369", "#EF4A00", "#9935FE"], // Example colors
    legend: { show: false }, // Hide the default legend
    dataLabels: { enabled: true, formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex] // Show count in data labels
      },},
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
              }
            }
          }
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };

  return (
      <div className='col-xxl-3 col-xl-6'>
        <div className='card h-100 radius-8 border-0 overflow-hidden'>
          <div className='card-body p-24'>
            <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
              <h6 className='mb-2 fw-bold text-lg'>Hair Concerns Overview</h6>
              <div className=''>
                <select
                    className='form-select form-select-sm w-auto bg-base border text-secondary-light'
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value='Today'>Today</option>
                  <option value='Weekly'>Weekly</option>
                  <option value='Monthly'>Monthly</option>
                  <option value='Yearly'>Yearly</option>
                </select>
              </div>
            </div>
            <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type='donut'
                height={264}
            />
            <ul className='d-flex flex-wrap align-items-center justify-content-between mt-3 gap-3'>
              {/* Dynamically generate list items based on fetched data */}
              {hairConcernsData.map((item, index) => (
                  <li key={index} className='d-flex align-items-center gap-2'>
                    {/* You can choose different colors for each item if needed */}
                    <span className='w-12-px h-12-px radius-2' style={{ backgroundColor: chartOptions.colors[index % chartOptions.colors.length] }} />
                    <span className='text-secondary-light text-sm fw-normal'>
                                    {item.label}:
                                    <span className='text-primary-light fw-semibold'>{item.value}</span>
                                </span>
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default UsersOverviewOne;