import Breadcrumb from "@/components/Breadcrumb";
import ChatMessageLayer from "@/components/ChatMessageLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

export const metadata = {
    title: "Chats - Sienna Naturals",
    description: "Sienna Naturals dashboard and insights.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Chat Message' />

        {/* ChatMessageLayer */}
        <ChatMessageLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
