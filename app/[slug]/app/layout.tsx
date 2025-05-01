// "use client";
// import { useState, useEffect, useRef } from "react";
// import DashboardMobileSidebar from "./components/DashboardMobileSidebar";
// import DashboardDesktopSidebar from "./components/DashboardDesktopSidebar";
// import FullLoading from "./components/loading/FullLoading";
// import DashboardNavbar from "./components/DashboardNavbar";
// import { Protect, useAuth } from "@clerk/nextjs";
// import TicketScannerFAB from "./components/ui/TicketScannerFAB";
// import { OrganizationProvider } from "@/contexts/OrganizationContext";
// import { ClerkPermissions } from "@/types/enums";
// const Home: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const sidebarRef = useRef<HTMLDivElement | null>(null);
//   const { has } = useAuth();

//   const toggleSidebar = () => {
//     if (isMobile) {
//       setIsOpen((prev) => !prev);
//     }
//   };

//   // Close sidebar when clicking outside
//   const handleClickOutside = (event: MouseEvent) => {
//     if (
//       sidebarRef.current &&
//       !sidebarRef.current.contains(event.target as Node)
//     ) {
//       setIsOpen(false);
//     }
//   };

//   useEffect(() => {
//     const simulateLoading = setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);

//     const handleResize = () => {
//       const mobileView = window.innerWidth < 768;
//       setIsMobile(mobileView);

//       if (!mobileView && isOpen) {
//         setIsOpen(false);
//       }
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       clearTimeout(simulateLoading);
//       window.removeEventListener("resize", handleResize);
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen]);

//   if (isLoading || !has) {
//     return <FullLoading />;
//   }

//   return (
//     <div className="relative flex flex-col w-full">
//       <DashboardNavbar toggleNavbar={toggleSidebar} isOpen={isOpen} />
//       <div className="md:flex mt-[50px] overflow-hidden">
//         {/* Sidebar */}
//         <div ref={sidebarRef}>
//           {isMobile ? (
//             <DashboardMobileSidebar
//               isOpen={isOpen}
//               toggleSidebar={toggleSidebar}
//             />
//           ) : (
//             <DashboardDesktopSidebar />
//           )}
//         </div>

//         {/* Main content */}
//         <OrganizationProvider>
//           <div
//             className={`min-h-screen relative flex-grow ${!isMobile ? "ml-[250px]" : ""}`}
//           >
//             <div>
//               {children}
//               <Protect
//                 condition={(has) =>
//                   has({ permission: ClerkPermissions.CHECK_GUESTS })
//                 }
//               >
//                 <TicketScannerFAB />
//               </Protect>
//             </div>
//           </div>
//         </OrganizationProvider>
//       </div>
//     </div>
//   );
// };

// export default Home;

"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Protect, useAuth, useUser } from "@clerk/nextjs";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Sidebar from "./components/shared/nav/Sidebar";
import Navbar from "./components/shared/nav/Navbar1";
import TicketScannerFAB from "./components/ui/TicketScannerFAB";
import FullLoading from "./components/loading/FullLoading";
import { isModerator } from "@/utils/permissions";

const CompanyLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { slug } = useParams();
  const cleanSlug = typeof slug === "string" ? slug.split("?")[0] : "";

  const { user } = useUser();
  if (!slug || !user) {
    return <FullLoading />;
  }

  const orgRole = user.publicMetadata.role as string;
  const canCheckInTickets = isModerator(orgRole);
  console.log("canCheckInTickets", user.publicMetadata);
  return (
    <div className="flex min-h-screen">
      <Sidebar slug={cleanSlug} orgRole={orgRole} />
      <div className="flex-1 lg:ml-64">
        <Navbar slug={cleanSlug} orgRole={orgRole} />
        <main className="pt-[72px]">
          <OrganizationProvider>
            {children}
            {canCheckInTickets && <TicketScannerFAB />}
          </OrganizationProvider>
        </main>
      </div>
    </div>
  );
};

const Home = ({ children }: { children: React.ReactNode }) => {
  return <CompanyLayout>{children}</CompanyLayout>;
};

export default Home;
