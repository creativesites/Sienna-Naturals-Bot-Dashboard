import Breadcrumb from "@/components/Breadcrumb";
import ChatMessageLayer from "@/components/ChatMessageLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import EarningStaticOne from "@/components/child/EarningStaticOne";


export const metadata = {
    title: "Chats - Myavana",
    description: "Myavana dashboard and insights.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        {/*<Breadcrumb title='Conversations' />*/}
          <div className="myavana-dashboard-page-container">
              <ChatMessageLayer user_id={''}/>
              <EarningStaticOne />
          </div>


      </MasterLayout>
    </>
  );
};

export default Page;
