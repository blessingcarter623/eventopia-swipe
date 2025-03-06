
import React, { useState, useEffect } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { AuthNavigationBar } from "@/components/ui/auth-navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'user' | 'organizer'>('user');
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handleSignUp = async (data: any) => {
    const userData = {
      display_name: data.displayName,
      role: data.isOrganizer ? 'organizer' : 'user' as 'user' | 'organizer', // explicitly type as union type
    };
    
    await signUp(data.email, data.password, userData);
  };
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        <div className="max-w-md mx-auto pt-6">
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger 
                value="user" 
                onClick={() => setUserType('user')}
                className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
              >
                Regular User
              </TabsTrigger>
              <TabsTrigger 
                value="organizer" 
                onClick={() => setUserType('organizer')}
                className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black"
              >
                Event Organizer
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <AuthForm mode="signup" type="user" onSubmit={handleSignUp} />
            </TabsContent>
            
            <TabsContent value="organizer">
              <AuthForm mode="signup" type="organizer" onSubmit={handleSignUp} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AuthNavigationBar />
    </div>
  );
};

export default SignUp;
