"use client";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react/dist/iconify.js";
import useReactApexChart from "@/hook/useReactApexChart";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const EarningStaticOne = () => {
  const { barChartSeriesTwo, barChartOptionsTwo } = useReactApexChart();
  const [statistics, setStatistics] = useState({
    totalMessagesToday: 0,
    newUsersToday: 0,
    servicesRecommendedToday: 0,
  });
  const [userMessageData, setUserMessageData] = useState([]);

  useEffect(() => {
    // Fetch conversations data
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        const conversations = await response.json();

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Initialize counters
        let totalMessagesToday = 0;
        const newUsersToday = new Set();
        let servicesRecommendedToday = 0;
        const userMessageCounts = {};

        // Process each conversation
        conversations.forEach((conversation) => {
          const userId = conversation.user_id;
          const userName = conversation.user_name || `User ${userId.substring(0,10)}..`;

          // Filter user messages for today
          const todayUserMessages = conversation.chat_history.filter((msg) => {
            if (msg.role === "user") {
              // Extract timestamp from content
              const timestamp = msg.content.split(" - ")[0];
              return timestamp.startsWith(today);
            }
            return false;
          });

          // Update total messages today
          totalMessagesToday += todayUserMessages.length;

          // Update new users today
          if (todayUserMessages.length > 0) {
            newUsersToday.add(userId);
          }

          // Update user-wise message counts
          if (userMessageCounts[userId]) {
            userMessageCounts[userId].message_count += todayUserMessages.length;
          } else {
            userMessageCounts[userId] = {
              user_name: userName,
              message_count: todayUserMessages.length,
            };
          }

          // Count services recommended today (based on assistant messages)
          conversation.chat_history.forEach((msg) => {
            if (
                msg.role === "assistant" &&
                msg.content?.message?.toLowerCase().includes("recommend")
            ) {
              servicesRecommendedToday++;
            }
          });
        });

        // Set statistics
        setStatistics({
          totalMessagesToday,
          newUsersToday: newUsersToday.size,
          servicesRecommendedToday,
        });

        // Sort users by message count and get the top 5
        const sortedUsers = Object.values(userMessageCounts).sort(
            (a, b) => b.message_count - a.message_count
        );
        setUserMessageData(sortedUsers.slice(0, 5));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  // Update bar chart data
  const updatedBarChartSeriesTwo = [
    {
      name: "Messages Today",
      data: userMessageData.map((user) => ({
        x: user.user_name,
        y: user.message_count,
      })),
    },
  ];

  const updatedBarChartOptionsTwo = {
    ...barChartOptionsTwo,
    xaxis: {
      type: "category",
      categories: userMessageData.map((user) => user.user_name),
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value; // No need to convert to "k" format
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return value; // No need to convert to "k" format
        },
      },
    },
  };

  return (
      <div className="col-xxl-8">
        <div className="card h-100 radius-8 border-0">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <div>
                <h6 className="mb-2 fw-bold text-lg">Today's Statistics</h6>
                <span className="text-sm fw-medium text-secondary-light">
                Overview of today's activities
              </span>
              </div>
            </div>
            <div className="mt-20 d-flex justify-content-center flex-wrap gap-3">
              {/* Total Messages Today Card */}
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
              <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                <Icon icon="fluent:chat-16-filled" className="icon" />
              </span>
                <div>
                <span className="text-secondary-light text-sm fw-medium">
                  Total Messages
                </span>
                  <h6 className="text-md fw-semibold mb-0">
                    {statistics.totalMessagesToday}
                  </h6>
                </div>
              </div>

              {/* New Users Today Card */}
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
              <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                <Icon icon="mdi:user-plus" className="icon" />
              </span>
                <div>
                <span className="text-secondary-light text-sm fw-medium">
                  New Users
                </span>
                  <h6 className="text-md fw-semibold mb-0">
                    {statistics.newUsersToday}
                  </h6>
                </div>
              </div>

              {/* Services Recommended Today Card */}
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
              <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                <Icon icon="mdi:thumb-up" className="icon" />
              </span>
                <div>
                <span className="text-secondary-light text-sm fw-medium">
                  Services Recommended
                </span>
                  <h6 className="text-md fw-semibold mb-0">
                    {statistics.servicesRecommendedToday}
                  </h6>
                </div>
              </div>
            </div>
            <div id="barChart">
              <ReactApexChart
                  options={updatedBarChartOptionsTwo}
                  series={updatedBarChartSeriesTwo}
                  type="bar"
                  height={310}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default EarningStaticOne;



