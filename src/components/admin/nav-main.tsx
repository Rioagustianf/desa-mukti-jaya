"use client";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import * as React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: LucideIcon;
    items: {
      title: string;
      url: string;
      icon: LucideIcon;
    }[];
  }[];
}) {
  const pathname = usePathname();
  // Initialize with the first item open by default
  const [open, setOpen] = React.useState<{ [key: string]: boolean }>(() => {
    const initialState: { [key: string]: boolean } = {};
    if (items.length > 0) {
      initialState[items[0].title] = true;
    }
    return initialState;
  });

  return (
    <div>
      {items.map((group) => (
        <Collapsible
          key={group.title}
          open={open[group.title]}
          onOpenChange={(v) =>
            setOpen((prev) => ({ ...prev, [group.title]: v }))
          }
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full flex items-center justify-between text-white hover:bg-blue-700">
              <span className="flex items-center gap-2">
                <group.icon className="w-5 h-5" />
                <span>{group.title}</span>
              </span>
              <ChevronRight
                className={`ml-auto h-4 w-4 transition-transform ${
                  open[group.title] ? "rotate-90" : ""
                }`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu className="pl-3">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors ${
                        pathname === item.url
                          ? "bg-blue-800 text-white font-semibold"
                          : "text-blue-50 hover:bg-blue-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
