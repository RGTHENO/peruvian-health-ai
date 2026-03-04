import { Outlet } from "react-router-dom";
import DoctorSidebar from "@/components/DoctorSidebar";
import DoctorMobileNav from "@/components/DoctorMobileNav";
import NotificationBell from "@/components/NotificationBell";

const DoctorLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border px-4 py-2 lg:px-6">
          <NotificationBell />
        </header>
        <main className="flex-1 pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <DoctorMobileNav />
    </div>
  );
};

export default DoctorLayout;
