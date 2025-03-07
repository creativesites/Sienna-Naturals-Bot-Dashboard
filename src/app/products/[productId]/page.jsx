import Breadcrumb from "@/components/Breadcrumb";
import ProgressLayer from "@/components/ProgressLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import EditProductPage from "@/components/EditProductPage";

export const metadata = {
  title: "Edit Product - Sienna Naturals",
  description:
    "Manage your products for the chatbot.",
};

const Page = ({ params }) => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Edit Product' />

        {/* ProgressLayer */}
        <EditProductPage params={params} />
      </MasterLayout>
    </>
  );
};

export default Page;

