"use client";
import {useState} from "react";
import Breadcrumb from "@/components/Breadcrumb";
import TermsConditionLayer from "@/components/TermsConditionLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

// export const metadata = {
//   title: "WowDash NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
//   description:
//     "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
// };

const Page = () => {
    const [value, setValue] = useState(`collects, uses, shares and protects the personal information that we collect through this site or different channels. 6amMart has established the site to link up the users who need foods or grocery items to be shipped or delivered by the riders from the affiliated restaurants or shops to the desired location. This policy also applies to any mobile applications that we develop for use`);
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Terms & Conditions' />

        {/* TermsConditionLayer */}
        <TermsConditionLayer value={value} setValue={setValue}/>
      </MasterLayout>
    </>
  );
};

export default Page;
