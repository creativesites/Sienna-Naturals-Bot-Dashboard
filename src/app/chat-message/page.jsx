import Breadcrumb from "@/components/Breadcrumb";
import ChatMessageLayer from "@/components/ChatMessageLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import EarningStaticOne from "@/components/child/EarningStaticOne";
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
                <EarningStaticOne />
                <ChatMessageLayer user_id={''}/>
            </MasterLayout>
        </>
    );
};

export default Page;
