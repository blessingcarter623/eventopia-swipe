
import React, { useState } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { mockUsers, mockEvents } from "@/data/index";
import { ArrowLeft, Settings, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const user = mockUsers[0]; // Using the first user as the profile user
  const [activeTab, setActiveTab] = useState<"events" | "images" | "reels">("events");
  
  const userEvents = mockEvents.filter(event => event.organizer.id === user.id);
  
  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <Settings className="w-6 h-6 text-white" />
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pt-4">
          <div className="flex items-start">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.displayName} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-neon-yellow"
              />
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black rounded-full p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 6.75L9.75 17.25L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
              <p className="text-gray-400">@{user.username}</p>
              {user.bio && <p className="text-white mt-1">{user.bio}</p>}
              
              <div className="flex items-center gap-3 mt-3">
                <button className="bg-neon-yellow text-black font-medium px-5 py-2 rounded-full text-sm hover:brightness-110 transition-all flex-1">
                  Follow
                </button>
                <button className="bg-white/10 text-white font-medium px-3 py-2 rounded-full text-sm border border-white/20">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* User Stats */}
          <div className="flex justify-between mt-6 border-b border-white/10 pb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user.posts}</p>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user.followers.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user.following.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Following</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-4">
          <div className="flex border-b border-white/10">
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "events" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "images" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("images")}
            >
              Images
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === "reels" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("reels")}
            >
              Reels
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "events" && (
              <div className="grid grid-cols-2 gap-2">
                {userEvents.map(event => (
                  <Link to={`/event/${event.id}`} key={event.id} className="relative aspect-square rounded-xl overflow-hidden">
                    <img 
                      src={event.media.url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                      <h3 className="text-white font-bold text-sm line-clamp-1">{event.title}</h3>
                      <p className="text-gray-300 text-xs">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {activeTab === "images" && (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden bg-darkbg-lighter animate-pulse">
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === "reels" && (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[9/16] rounded-md overflow-hidden bg-darkbg-lighter animate-pulse">
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Profile;
