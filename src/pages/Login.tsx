
import React from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { AuthNavigationBar } from "@/components/ui/auth-navigation-bar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = (data: any) => {
    // In a real app, this would connect to your backend
    console.log("Login data:", data);
    
    // Simulate a successful login
    const mockUser = {
      displayName: "Test User",
      role: data.email.includes("organizer") ? "organizer" : "user"
    };
    
    toast({
      title: "Logged in successfully!",
      description: `Welcome back, ${mockUser.displayName}!`,
    });
    
    // Redirect based on user type
    if (mockUser.role === "organizer") {
      navigate("/organizer/dashboard");
    } else {
      navigate("/dashboard");
    }
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="max-w-md mx-auto pt-6">
          <AuthForm mode="login" type="user" onSubmit={handleLogin} />
        </div>
      </div>
      
      <AuthNavigationBar />
    </div>
  );
};

export default Login;
