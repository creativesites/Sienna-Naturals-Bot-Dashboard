import Breadcrumb from "@/components/Breadcrumb";
// import KanbanLayer from "@/components/KanbanLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import dynamic from 'next/dynamic';
const KanbanLayer = dynamic(
  () => import('@/components/KanbanLayer'),
  { ssr: false }
);

export const metadata = {
  title: "Training- Sienna Naturals",
  description:
    "Training page.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Kanban' />

        {/* KanbanLayer */}
        <KanbanLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
