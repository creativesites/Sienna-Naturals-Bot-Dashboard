import PluginInit from "@/helper/PluginInit";
import "./font.css";
import "./globals.css";
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'

export const metadata = {
  title: "Sienna Naturals Insights Dashboard",
  description:
    "A comprehensive analytics dashboard for Sienna Naturals, providing real-time insights into bot interactions, user hair profiles, product engagements, and customer journeys. Visualize key data points, track user trends, and optimize customer experience with intuitive reports and interactive charts.",
};

export default function RootLayout({ children }) {
  return (
      <ClerkProvider>
    <html lang='en'>
      <PluginInit />
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
      </ClerkProvider>
  );
}
