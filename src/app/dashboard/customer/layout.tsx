import React from "react";

import { requirrole } from "@/lib/core/server";

const AdminDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requirrole("customer");

  return children;
};

export default AdminDashboardLayout;
