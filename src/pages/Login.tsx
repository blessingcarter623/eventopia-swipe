
import React, { useEffect } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { AuthNavigationBar } from "@/components/ui/auth-navigation-bar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handleLogin = async (data: any) => {
    await signIn(data.email, data.password);
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
