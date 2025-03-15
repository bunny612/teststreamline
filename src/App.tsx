
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Results from "./pages/Results";
import ExamManage from "./pages/ExamManage";
import ExamCreate from "./pages/ExamCreate";
import ExamEdit from "./pages/ExamEdit";
import ExamUpcoming from "./pages/ExamUpcoming";

// Layouts
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Teacher Routes */}
              <Route path="/exams/manage" element={<ExamManage />} />
              <Route path="/exams/create" element={<ExamCreate />} />
              <Route path="/exams/edit/:id" element={<ExamEdit />} />
              
              {/* Student Routes */}
              <Route path="/exams/upcoming" element={<ExamUpcoming />} />
              <Route path="/results" element={<Results />} />
              <Route path="/results/:id" element={<Results />} />
              
              {/* Profile & Settings */}
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
            </Route>
            
            {/* Index route redirector */}
            <Route path="/" element={<Index />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
