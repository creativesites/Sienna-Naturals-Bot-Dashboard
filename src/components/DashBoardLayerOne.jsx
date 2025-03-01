import GeneratedContent from "./child/GeneratedContent";
import LatestRegisteredOne from "./child/LatestRegisteredOne";
import SalesStatisticOne from "./child/SalesStatisticOne";
import TopCountries from "./child/TopCountries";
import TopPerformerOne from "./child/TopPerformerOne";
import TotalSubscriberOne from "./child/TotalSubscriberOne";
import UnitCountOne from "./child/UnitCountOne";
import UsersOverviewOne from "./child/UsersOverviewOne";
import UsersListLayer from "@/components/UsersListLayer";

const DashBoardLayerOne = () => {
  return (
    <>
      {/* UnitCountOne */}
      <UnitCountOne />

      <section className='row gy-4 mt-1'>
        {/* SalesStatisticOne */}
        <SalesStatisticOne />

        {/* TotalSubscriberOne */}
        <TotalSubscriberOne />

        {/* UsersOverviewOne */}
        <UsersOverviewOne />

        {/* LatestRegisteredOne */}
        <UsersListLayer />

        {/* TopPerformerOne */}
        {/*<TopPerformerOne />*/}

        {/* TopCountries */}
        {/*<TopCountries />*/}

        {/* GeneratedContent */}
        {/*<GeneratedContent />*/}
      </section>
    </>
  );
};

export default DashBoardLayerOne;
