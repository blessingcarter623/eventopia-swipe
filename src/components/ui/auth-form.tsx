
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: 'login' | 'signup';
  type: 'user' | 'organizer';
  onSubmit: (data: any) => void;
}

export function AuthForm({ mode, type, onSubmit }: AuthFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    bio: '',
    agreeTerms: false,
    isOrganizer: type === 'organizer',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (mode === 'signup') {
      if (!formData.username || !formData.email || !formData.password || !formData.displayName) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.agreeTerms) {
        toast({
          title: "Error",
          description: "You must agree to terms and conditions",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Submit the form data
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold text-neon-yellow">
          {mode === 'login' ? 'Login to Moja' : type === 'organizer' ? 'Event Organizer Sign Up' : 'Sign Up to Moja'}
        </h1>
        <p className="text-gray-400">
          {mode === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Create your account to enjoy Moja events'}
        </p>
      </div>

      {mode === 'signup' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username*</Label>
            <Input 
              id="username" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="bg-darkbg-lighter border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white">Display Name*</Label>
            <Input 
              id="displayName" 
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Display Name"
              className="bg-darkbg-lighter border-white/20 text-white"
            />
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email*</Label>
        <Input 
          id="email" 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="bg-darkbg-lighter border-white/20 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password*</Label>
        <div className="relative">
          <Input 
            id="password" 
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Your Password"
            className="bg-darkbg-lighter border-white/20 text-white pr-10"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      {mode === 'signup' && type === 'organizer' && (
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">Bio (Optional)</Label>
          <Input 
            id="bio" 
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself or your organization"
            className="bg-darkbg-lighter border-white/20 text-white"
          />
        </div>
      )}
      
      {mode === 'signup' && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="agreeTerms" 
            name="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, agreeTerms: checked === true }))
            }
          />
          <Label 
            htmlFor="agreeTerms" 
            className="text-sm text-gray-300 font-normal cursor-pointer"
          >
            I agree to the terms of service and privacy policy
          </Label>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black font-bold"
      >
        {mode === 'login' ? 'Login' : 'Create Account'}
      </Button>
      
      {mode === 'login' ? (
        <p className="text-center text-gray-400 text-sm">
          Don't have an account? 
          <a href="/signup" className="text-neon-yellow ml-1 hover:underline">
            Sign up
          </a>
        </p>
      ) : (
        <p className="text-center text-gray-400 text-sm">
          Already have an account? 
          <a href="/login" className="text-neon-yellow ml-1 hover:underline">
            Log in
          </a>
        </p>
      )}
    </form>
  );
}
