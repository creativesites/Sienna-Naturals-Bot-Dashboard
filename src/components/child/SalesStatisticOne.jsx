// components/child/SalesStatisticOne.js
"use client";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react/dist/iconify.js";
import useReactApexChart from "@/hook/useReactApexChart"; // Import your hook
import { useState, useEffect } from 'react';

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SalesStatisticOne = () => {
  const [messagesPerDay, setMessagesPerDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last30Days'); // Add state for selected timeframe
  const { createChartTwo } = useReactApexChart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/messages-per-day');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessagesPerDay(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]); // Add selectedTimeframe to dependency array

  // Calculate total messages and messages per day (for display above the chart)
  const totalMessages = messagesPerDay.reduce((sum, day) => sum + day.y, 0);
  const averageMessagesPerDay = messagesPerDay.length > 0 ? (totalMessages / messagesPerDay.length).toFixed(2) : 0;

  const chartOptions = {
    chart: {
      type: 'area',
      height: 264,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3, colors: ['#487FFF'] },
    markers: { size: 4, colors: ['#487FFF'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } }, // Show markers
    tooltip: {
      x: { format: 'dd MMM yyyy' }, // Format the date in the tooltip
      y: { formatter: (value) => value.toFixed(0) } // Format messages as integers
    },
    grid: { borderColor: '#D1D5DB', strokeDashArray: 3 },
    xaxis: {
      type: 'datetime', // Use datetime for the x-axis
      categories: messagesPerDay.map(item => item.x), // Use the dates from your data
      labels: { format: 'dd MMM' } // Format x-axis labels
    },
    yaxis: {
      labels: { formatter: (value) => value.toFixed(0) } // Format y-axis as integers
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    }
  };

  const chartSeries = [{
    name: 'Messages',
    data: messagesPerDay
  }];


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
      <div className='col-xxl-6 col-xl-12'>
        <div className='card h-100'>
          <div className='card-body'>
            <div className='d-flex flex-wrap align-items-center justify-content-between'>
              <h6 className='text-lg mb-0'>Messages Per Day</h6>
              <select
                  className='form-select bg-base form-select-sm w-auto'
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value='Last30Days'>Last 30 Days</option>
                {/* Add other timeframe options here if needed (e.g., Last 7 Days) */}
              </select>
            </div>
            <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
              <h6 className='mb-0'>{totalMessages}</h6>
              <span className='text-xs fw-medium'>Average: {averageMessagesPerDay} per Day</span>
            </div>
            <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type='area'
                height={264}
            />
          </div>
        </div>
      </div>
  );
};

export default SalesStatisticOne;