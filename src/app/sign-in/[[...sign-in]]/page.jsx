import { SignIn } from '@clerk/nextjs';

export const metadata = {
    title: "Sign In - Sienna Naturals",
    description: "Sign in to your Sienna Naturals account to access your personalized dashboard and insights.",
};

export default function Page() {
    return (
        <section className='auth bg-base d-flex flex-wrap'>
            <div className='auth-left d-lg-block d-none'>
                <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
                    <img src='assets/images/auth/sign.webp' alt='' />
                </div>
            </div>
            <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
                <div className='max-w-464-px mx-auto w-100'>

                    <SignIn />
                </div>
            </div>
        </section>
    );
}