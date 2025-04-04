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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <body suppressHydrationWarning={true}>
          {children}
          <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
        />
      </body>
    </html>
      </ClerkProvider>
  );
}
