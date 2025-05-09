import Breadcrumb from "@/components/Breadcrumb";
import KanbanLayer from "@/components/KanbanLayer";
import MasterLayout from "@/masterLayout/MasterLayout";



export const metadata = {
  title: "Training- Sienna Naturals",
  description:
    "Training page"
  }
const Page = () => {
  
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Training - Images for chatbot training' />

        {/* KanbanLayer */}
        <KanbanLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
