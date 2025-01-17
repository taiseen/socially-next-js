import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import ThemeProvider from "@/context/ThemeProvider";
import Navbar from "@/components/navbar";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Socially",
  description: "A modern social media application powered by Next.js",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
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
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="hidden lg:block lg:col-span-3">
                    {/* <Sidebar /> */}

                    Sidebar
                  </div>
                  <div className="lg:col-span-9">{children}</div>
                </div>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
