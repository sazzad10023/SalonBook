import React from "react";

import { requirrole } from "@/lib/core/server";

const AdminDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requirrole("admin");

  return children;
};

export default AdminDashboardLayout;
