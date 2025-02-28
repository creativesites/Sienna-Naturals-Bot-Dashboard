// components/child/TotalSubscriberOne.js
"use client";
import useReactApexChart from "@/hook/useReactApexChart";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const TotalSubscriberOne = () => {
  const [newUsersPerDay, setNewUsersPerDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/new-users-per-day');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNewUsersPerDay(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching new users per day:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // Calculate total new users and average new users per day
  const totalNewUsers = newUsersPerDay.reduce((sum, day) => sum + day.y, 0);
  const averageNewUsersPerDay = newUsersPerDay.length > 0
      ? (totalNewUsers / newUsersPerDay.length).toFixed(2)
      : 0;

  //format data
  const chartSeries = [{
    name: 'New Users',
    data: newUsersPerDay
  }];

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 264,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      type: 'datetime', // Important: Use datetime for the x-axis
      categories: newUsersPerDay.map(item => item.x),
      labels: { format: 'dd MMM' } // Format x-axis labels
    },
    yaxis: {
      title: { text: 'New Users' }
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { format: 'dd MMM yyyy' },
      y: { formatter: (value) => value.toFixed(0) }
    },
    colors: ['#487FFF'] // Example color - adjust as needed
  };
  return (
      <div className='col-xxl-3 col-xl-6'>
        <div className='card h-100 radius-8 border'>
          <div className='card-body p-24'>
            <h6 className='mb-12 fw-semibold text-lg mb-16'>New Users Per Day (Last 7 Days)</h6> {/* Updated title */}
            <div className='d-flex align-items-center gap-2 mb-20'>
              <h6 className='fw-semibold mb-0'>{totalNewUsers}</h6>
              <p className='text-sm mb-0'>
                Average: {averageNewUsersPerDay} per Day
              </p>
            </div>
            <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type='bar'
                height={264}
            />
          </div>
        </div>
      </div>
  );
};

export default TotalSubscriberOne;