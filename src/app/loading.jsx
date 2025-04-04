import MasterLayout from "@/masterLayout/MasterLayout";

export default function Loading() {
    return (
        <MasterLayout>
        <div className='d-flex align-items-center justify-content-between gap-8 pb-24'
             style={{
                 display:'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 width: '100%',
                 height: '100vh'
             }}
        >
            <div className="loading-card">
                <div className="loading-loader">
                    <p>loading</p>
                    <div className="loading-words">
                        <span className="loading-word">buttons</span>
                        <span className="loading-word">forms</span>
                        <span className="loading-word">switches</span>
                        <span className="loading-word">cards</span>
                        <span className="loading-word">buttons</span>
                    </div>
                </div>
            </div>


        </div>
        </MasterLayout>
    )
}