
import { Home, Users, Mail, BarChart3, Settings, Zap } from 'lucide-react';
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Leads",
    url: "/dashboard",
    icon: Users,
  },
  {
    title: "Email Campaigns",
    url: "#",
    icon: Mail,
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "Speed Tests",
    url: "#",
    icon: Zap,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <UISidebar className="border-r border-slate-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">LeadFlow</h2>
            <p className="text-xs text-slate-500">Lead Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-slate-100 transition-colors">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Pro Tip</h3>
          <p className="text-xs text-slate-600">Use speed tests to identify leads with slow websites for better targeting.</p>
        </div>
      </SidebarFooter>
    </UISidebar>
  );
}
