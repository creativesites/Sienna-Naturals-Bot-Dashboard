import { UserProfile } from '@clerk/nextjs';

export const metadata = {
    title: "Profile - Sienna Naturals",
    description: "Manage your Sienna Naturals account to access your personalized dashboard and insights.",
};

export default function  Page () {
    return(
        <section>
            <UserProfile />
        </section>
    );
};
