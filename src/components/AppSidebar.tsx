
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LayoutDashboard, LogOut, Settings, UserCircle, FileText, PenTool } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isTeacher = user?.role === 'teacher';

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="px-6 py-3 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-exam-primary" />
          <h1 className="text-xl font-bold text-exam-primary">ExamEase</h1>
        </div>
        <SidebarTrigger className="md:hidden absolute right-2 top-3" />
      </SidebarHeader>
      <SidebarContent>
        <div className="py-4 px-3">
          <div className="flex items-center gap-4 px-3 mb-6">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-exam-primary text-white">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={isActive('/dashboard') ? 'bg-exam-light text-exam-primary' : ''}
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isTeacher ? (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={isActive('/exams/manage') ? 'bg-exam-light text-exam-primary' : ''}
                        onClick={() => navigate('/exams/manage')}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        <span>Manage Exams</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={isActive('/exams/create') ? 'bg-exam-light text-exam-primary' : ''}
                        onClick={() => navigate('/exams/create')}
                      >
                        <PenTool className="h-5 w-5 mr-2" />
                        <span>Create Exam</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                ) : (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={isActive('/exams/upcoming') ? 'bg-exam-light text-exam-primary' : ''}
                        onClick={() => navigate('/exams/upcoming')}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        <span>Exams</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={isActive('/results') ? 'bg-exam-light text-exam-primary' : ''}
                        onClick={() => navigate('/results')}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        <span>Results</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={isActive('/profile') ? 'bg-exam-light text-exam-primary' : ''}
                    onClick={() => navigate('/profile')}
                  >
                    <UserCircle className="h-5 w-5 mr-2" />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={isActive('/settings') ? 'bg-exam-light text-exam-primary' : ''}
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
