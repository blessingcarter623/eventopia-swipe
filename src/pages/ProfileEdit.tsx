
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileEdit = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    avatar_url: profile?.avatar_url || "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!profile) {
    return (
      <div className="app-height bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-yellow"></div>
      </div>
    );
  }
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to="/profile" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
          <div className="w-6"></div> {/* Empty div for spacing */}
        </div>
        
        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src={formData.avatar_url} 
                alt={formData.display_name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-neon-yellow"
              />
              <button 
                type="button"
                className="absolute bottom-1 right-1 bg-neon-yellow text-black rounded-full p-1"
                onClick={() => {
                  const newAvatarUrl = prompt("Enter new avatar URL:", formData.avatar_url);
                  if (newAvatarUrl) {
                    setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="display_name" className="text-white">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="bg-darkbg-lighter border-white/20 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="bg-darkbg-lighter border-white/20 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className="bg-darkbg-lighter border-white/20 text-white mt-1 resize-none h-32"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black font-bold"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default ProfileEdit;
