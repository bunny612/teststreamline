
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if logged in, otherwise to login page
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default Index;
