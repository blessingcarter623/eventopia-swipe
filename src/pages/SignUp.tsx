
import React, { useState } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { AuthNavigationBar } from "@/components/ui/auth-navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'user' | 'organizer'>('user');
  
  const handleSignUp = (data: any) => {
    // In a real app, this would connect to your backend
    console.log("Sign up data:", data);
    
    // Simulate a successful signup
    toast({
      title: "Account created!",
      description: `Welcome to Moja, ${data.displayName}!`,
    });
    
    // Redirect based on user type
    if (data.isOrganizer) {
      navigate("/organizer/dashboard");
    } else {
      navigate("/dashboard");
    }
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
