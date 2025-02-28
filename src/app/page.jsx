import DashBoardLayerOne from "@/components/DashBoardLayerOne";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Breadcrumb } from "react-bootstrap";

export const metadata = {
    title: "Sienna Naturals Insights Dashboard",
    description:
        "A comprehensive analytics dashboard for Sienna Naturals, providing real-time insights into bot interactions, user hair profiles, product engagements, and customer journeys. Visualize key data points, track user trends, and optimize customer experience with intuitive reports and interactive charts.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='AI' />

        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default Page;
