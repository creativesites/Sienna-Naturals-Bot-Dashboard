import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import KanbanBoard from "@/components/child/KanbanBoard";

export const metadata = {
    title: "Users - Sienna Naturals",
    description: "Sienna Naturals dashboard and insights.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Sienna Naturals Bot Users' />

        <div className='overflow-x-auto scroll-sm pb-8'>
            <KanbanBoard />
        </div>
      </MasterLayout>
    </>
  );
};

export default Page;
