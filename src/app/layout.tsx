import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { metaRootInfo } from "@/meta";
import { LayoutType } from "@/types";
import type { Metadata } from "next";

import ThemeProvider from "@/context/ThemeProvider";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import "@/styles/globals.css";

export const metadata: Metadata = { ...metaRootInfo };

const RootLayout = ({ children }: Readonly<LayoutType>) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={` antialiased`}>
          <ThemeProvider
            disableTransitionOnChange
            defaultTheme="system"
            attribute="class"
            enableSystem
          >
            <div className="min-h-screen">
              <Navbar />

              {/* container to center the content */}
              <main className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar />
                    </div>

                    <div className="lg:col-span-9">{children}</div>
                  </div>
                </div>
              </main>
            </div>

            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
