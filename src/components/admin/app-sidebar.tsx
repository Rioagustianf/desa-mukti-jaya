"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { navMain } from "./sidebar-menu";
import logo from "../../../public/logo.png";
import Image from "next/image";
import Link from "next/link";

const user = {
  name: "Admin Desa",
  email: "admin@desa.com",
  avatar: "/avatars/admin.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      className="bg-blue-600 border-r border-blue-700"
      {...props}
    >
      <SidebarHeader className="bg-blue-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="text-white hover:bg-blue-800"
            >
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-blue-700">
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt="Logo"
                    width={32}
                    height={32}
                  ></Image>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                  <span className="truncate font-semibold text-white">
                    Desa Mukti Jaya
                  </span>
                  <span className="truncate text-xs text-blue-100">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-blue-600">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-blue-700">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
