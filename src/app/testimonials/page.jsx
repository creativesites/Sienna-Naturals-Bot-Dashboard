import Breadcrumb from "@/components/Breadcrumb";
import TestimonialsLayer from "@/components/TestimonialsLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import TestimonialsPage from "@/components/TestimonialsPage";

export const metadata = {
  title: "Testimonials - Sienna Naturals",
  description:
    "Manage user testimonials.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Testimonials' />

        <TestimonialsPage />

      </MasterLayout>
    </>
  );
};

export default Page;
