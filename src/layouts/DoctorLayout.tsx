import { Outlet } from "react-router-dom";
import DoctorSidebar from "@/components/DoctorSidebar";
import DoctorMobileNav from "@/components/DoctorMobileNav";

const DoctorLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <DoctorMobileNav />
    </div>
  );
};

export default DoctorLayout;
