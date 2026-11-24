"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    CalendarDays,
    CreditCard,
    LayoutGrid,
    Plus,
    Scissors,
    User,
    Users,
    type LucideIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

type Role = "admin" | "customer"

type MenuItem = {
    id: string
    name: string
    url: string
    icon: LucideIcon
}

const menuItemByRole: Record<Role, MenuItem[]> = {
    admin: [
        {
            id: "overview",
            name: "Overview",
            url: "/dashboard/admin",
            icon: LayoutGrid,
        },
        {
            id: "services",
            name: "Manage services",
            url: "/dashboard/admin/services",
            icon: Scissors,
        },
        {
            id: "appointments",
            name: "Appointments",
            url: "/dashboard/admin/appointments",
            icon: CalendarDays,
        },
          {
            id: "add_book",
            name: "Add Book",
            url: "/dashboard/admin/add_book",
            icon: Plus,
        },
        {
            id: "customers",
            name: "Customers",
            url: "/dashboard/admin/customers",
            icon: Users,
        },
        {
            id: "transactions",
            name: "Transactions",
            url: "/dashboard/admin/transactions",
            icon: CreditCard,
        },
        {
            id: "profile",
            name: "My profile",
            url: "/dashboard/admin/profile",
            icon: User,
        },
    ],
    customer: [
        {
            id: "overview",
            name: "Overview",
            url: "/dashboard/customer",
            icon: LayoutGrid,
        },
        {
            id: "appointments",
            name: "My appointments",
            url: "/dashboard/customer/appointments",
            icon: CalendarDays,
        },
        {
            id: "services",
            name: "Browse services",
            url: "/services",
            icon: Scissors,
        },
        {
            id: "profile",
            name: "My profile",
            url: "/dashboard/customer/profile",
            icon: User,
        },
    ],
}

export function DashboardSidebar() {
    const pathname = usePathname()
    const role: Role = pathname.startsWith("/dashboard/admin")
        ? "admin"
        : "customer"

    return (
        // <div className="py-10">
        <Sidebar className="top-16 !h-[calc(100svh-4rem)]">
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup />
                <SidebarGroup />
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItemByRole[role].map(
                            ({ id, name, url, icon: Icon }) => (
                                <SidebarMenuItem key={id}>
                                    <SidebarMenuButton
                                        isActive={pathname === url}
                                        render={<Link href={url} />}
                                    >
                                        <Icon />
                                        <span>{name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
        // </div>
    )
}
