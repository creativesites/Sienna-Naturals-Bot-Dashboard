import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import CreateProductPage from "@/components/child/CreateProductPage";

export const metadata = {
  title: "Create Product - Sienna Naturals",
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
        <CreateProductPage />
      </MasterLayout>
    </>
  );
};

export default Page;

