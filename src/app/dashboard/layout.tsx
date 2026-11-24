import React from 'react';
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from '../components/DashboardSidebar';
const Dashboardlayout = ({ children }: { children: React.ReactNode }) => {
 return (
    <SidebarProvider>
      <DashboardSidebar></DashboardSidebar>
      <SidebarInset className="min-w-0">
        <div className="flex items-center gap-2 border-b bg-background px-3 py-2 md:px-4">
          <SidebarTrigger />
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
};

export default Dashboardlayout;