
import React, { useState, useEffect } from "react";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { ArrowLeft, Settings, Share2, LogOut, LayoutDashboard, Wallet, CreditCard, ArrowDown, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Profile = () => {
  const { profile, signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"events" | "wallet">("events");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Mock data for wallet
  const walletBalance = 1250.75;
  const pendingPayouts = 450.25;
  const totalEarnings = 3890.50;
  const recentTransactions = [
    { id: 1, event: "Summer Music Festival", amount: 750.00, date: "2024-03-15", status: "completed" },
    { id: 2, event: "Tech Conference 2024", amount: 380.50, date: "2024-03-10", status: "completed" },
    { id: 3, event: "Comedy Night Special", amount: 450.25, date: "2024-03-05", status: "pending" },
  ];
  
  // Fetch user's events from Supabase
  const { data: userEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get events where the user is the organizer
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id);
      
      if (error) {
        console.error("Error fetching user events:", error);
        throw error;
      }
      
      // Transform the data to match the Event type
      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        media: {
          type: event.media_type as 'image' | 'video',
          url: event.media_url || '',
          thumbnail: event.thumbnail_url || '',
        },
        location: event.location || '',
        date: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
        time: event.time || '',
        price: typeof event.price === 'number' ? event.price : 'Free',
        category: event.category || '',
        organizer: {
          id: profile?.id || '',
          name: profile?.display_name || 'Event Organizer',
          avatar: profile?.avatar_url || '',
          isVerified: profile?.is_verified || false,
        },
        stats: {
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 10000),
        },
        tags: event.tags || [],
        isSaved: false,
      }));
    },
    enabled: !!user,
  });
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsWithdrawing(false);
      toast({
        title: "Withdrawal Initiated",
        description: `$${withdrawAmount} has been sent to your bank account. It may take 2-3 business days to process.`,
      });
      setWithdrawAmount("");
    }, 1500);
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
          <Link to="/" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <div className="flex gap-2">
            <button onClick={handleSignOut} className="text-white hover:text-neon-yellow">
              <LogOut className="w-6 h-6" />
            </button>
            <Settings className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pt-4">
          <div className="flex items-start">
            <div className="relative">
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-neon-yellow"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black rounded-full p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 6.75L9.75 17.25L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
              <p className="text-gray-400">@{profile.username}</p>
              <div className="flex items-center mt-1">
                <span className="text-white bg-darkbg-lighter px-2 py-1 rounded-full text-xs font-medium">
                  {profile.role === 'organizer' ? 'Event Organizer' : 'User'}
                </span>
              </div>
              {profile.bio && <p className="text-white mt-1">{profile.bio}</p>}
              
              <div className="flex items-center gap-3 mt-3">
                <Link 
                  to="/profile/edit" 
                  className="bg-neon-yellow text-black font-medium px-5 py-2 rounded-full text-sm hover:brightness-110 transition-all flex-1 text-center"
                >
                  Edit Profile
                </Link>
                <button className="bg-white/10 text-white font-medium px-3 py-2 rounded-full text-sm border border-white/20">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Show Dashboard Link for Organizers */}
              {profile.role === 'organizer' && (
                <Link 
                  to="/organizer/dashboard" 
                  className="flex items-center justify-center gap-2 mt-3 bg-gradient-to-r from-neon-yellow to-amber-400 text-black font-medium px-5 py-2 rounded-full text-sm hover:brightness-110 transition-all w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organizer Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* User Stats */}
          <div className="flex justify-between mt-6 border-b border-white/10 pb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.posts}</p>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.followers}</p>
              <p className="text-gray-400 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.following}</p>
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
              className={`flex-1 py-3 text-center font-medium ${activeTab === "wallet" ? "text-neon-yellow border-b-2 border-neon-yellow" : "text-gray-400"}`}
              onClick={() => setActiveTab("wallet")}
            >
              Wallet
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "events" && (
              isLoadingEvents ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-yellow mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading events...</p>
                </div>
              ) : userEvents.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userEvents.map((event: Event) => (
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
              ) : (
                <div className="text-center py-10 text-gray-400">
                  {profile.role === 'organizer' ? 
                    <p>You haven't created any events yet. Go create some!</p> : 
                    <p>No events to show.</p>
                  }
                </div>
              )
            )}
            
            {activeTab === "wallet" && (
              <div className="space-y-4 p-2">
                {/* Wallet Overview */}
                <div className="bg-gradient-to-r from-darkbg-lighter to-darkbg-card p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Wallet Balance</h3>
                    <Wallet className="text-neon-yellow w-5 h-5" />
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">Available Balance</p>
                    <p className="text-white text-2xl font-bold">${walletBalance.toFixed(2)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-darkbg/60 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Pending</p>
                      <p className="text-white font-semibold">${pendingPayouts.toFixed(2)}</p>
                    </div>
                    <div className="bg-darkbg/60 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Total Earnings</p>
                      <p className="text-white font-semibold">${totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4 bg-neon-yellow text-black hover:bg-neon-yellow/90">
                        Withdraw Funds
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-darkbg-lighter text-white border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Withdraw Funds</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Enter the amount you want to withdraw to your bank account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right col-span-1">Amount</Label>
                          <div className="relative col-span-3">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-400">$</span>
                            </div>
                            <Input
                              placeholder="0.00"
                              className="pl-7 bg-darkbg border-gray-700 text-white"
                              type="number"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right col-span-1">Method</Label>
                          <div className="col-span-3">
                            <select 
                              className="w-full rounded-md bg-darkbg border border-gray-700 text-white p-2"
                            >
                              <option value="bank">Bank Account (•••• 4567)</option>
                              <option value="paypal">PayPal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          className="bg-neon-yellow text-black hover:bg-neon-yellow/90"
                          onClick={handleWithdraw}
                          disabled={!withdrawAmount || isWithdrawing || parseFloat(withdrawAmount) > walletBalance}
                        >
                          {isWithdrawing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                          ) : (
                            "Withdraw"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Recent Transactions */}
                <div className="bg-darkbg-lighter p-4 rounded-xl">
                  <h3 className="text-white font-bold mb-4">Recent Transactions</h3>
                  
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center py-3 border-b border-gray-800 last:border-b-0"
                    >
                      <div>
                        <p className="text-white font-medium">{transaction.event}</p>
                        <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.status === 'pending' ? 'text-amber-400' : 'text-green-400'}`}>
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" className="w-full mt-2 text-neon-yellow hover:text-neon-yellow/90 hover:bg-darkbg border border-gray-800">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View All Transactions
                  </Button>
                </div>
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

// Custom Label component for the dialog
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none text-white ${className}`} {...props}>
    {children}
  </label>
);

export default Profile;
