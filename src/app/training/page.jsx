import Breadcrumb from "@/components/Breadcrumb";
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
        {/* <Breadcrumb title='Training - Images for chatbot training' /> */}
        <div className="myavana-dashboard-page-container">
          <Breadcrumb title='Training - Images for chatbot training' />
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <h4>Chatbot Training Module</h4>
                  <p>Training functionality will be implemented here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>      
      </MasterLayout>
    </>
  );
};

export default Page;
