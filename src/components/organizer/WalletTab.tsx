
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WalletTabProps {
  isLoading: boolean;
  onRefresh: () => void;
}

interface Transaction {
  id: string;
  amount: number;
  payment_date: string;
  status: string;
  event_title?: string;
  payment_reference?: string;
}

const WalletTab: React.FC<WalletTabProps> = ({ isLoading, onRefresh }) => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (profile) {
      fetchWalletData();
    }
  }, [profile]);
  
  const fetchWalletData = async () => {
    setLocalLoading(true);
    try {
      // Fetch wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('organizer_wallets')
        .select('balance')
        .eq('organizer_id', profile?.id)
        .single();
        
      if (walletError) throw walletError;
      
      if (walletData) {
        setWalletBalance(walletData.balance || 0);
      }
      
      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          payment_date,
          status,
          payment_reference,
          events(title)
        `)
        .eq('organizer_id', profile?.id)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false })
        .limit(10);
        
      if (transactionsError) throw transactionsError;
      
      if (transactionsData) {
        const formattedTransactions = transactionsData.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          payment_date: tx.payment_date,
          status: tx.status,
          event_title: tx.events?.title || 'Unknown Event',
          payment_reference: tx.payment_reference
        }));
        
        setTransactions(formattedTransactions);
      }
      
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet data",
        variant: "destructive"
      });
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    
    if (amount > walletBalance) {
      toast({
        title: "Error",
        description: "Withdrawal amount cannot exceed your balance",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create withdrawal transaction record
      const { error: withdrawalError } = await supabase
        .from('payment_transactions')
        .insert({
          organizer_id: profile?.id,
          amount: -amount, // Negative amount for withdrawals
          status: 'completed',
          payment_method: 'withdrawal',
          payment_reference: `WITHDRAW-${Date.now()}`,
          buyer_id: profile?.id // Setting buyer_id to organizer ID for withdrawals
        });
        
      if (withdrawalError) throw withdrawalError;
      
      // Update wallet balance
      const { error: walletError } = await supabase.rpc('update_organizer_balance', { 
        p_organizer_id: profile?.id,
        p_amount: -amount // Negative amount to decrease balance
      });
      
      if (walletError) throw walletError;
      
      // Success
      toast({
        title: "Withdrawal Successful",
        description: `R ${amount.toFixed(2)} has been withdrawn from your wallet`,
      });
      
      // Reset form and close dialog
      setWithdrawAmount("");
      setWithdrawDetails("");
      setIsWithdrawDialogOpen(false);
      
      // Refresh wallet data
      fetchWalletData();
      
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading || localLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className="bg-darkbg-lighter border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-neon-yellow" />
            Organizer Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-neon-yellow mb-4">
              R {walletBalance.toFixed(2)}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                className="w-full bg-neon-yellow text-black hover:bg-neon-yellow/90"
                onClick={() => setIsWithdrawDialogOpen(true)}
                disabled={walletBalance <= 0}
              >
                Withdraw Funds
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-600"
                onClick={fetchWalletData}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-3">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-6 bg-darkbg-lighter rounded-lg border border-gray-700">
            <p className="text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(transaction => (
              <Card 
                key={transaction.id} 
                className="bg-darkbg-lighter border-gray-700"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">
                        {transaction.amount < 0 ? 'Withdrawal' : transaction.event_title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.payment_date).toLocaleDateString()} • 
                        {new Date(transaction.payment_date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={`font-bold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {transaction.amount < 0 ? '-' : '+'} R {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="bg-darkbg border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Withdraw Funds</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center mb-4">
              <div className="text-gray-400 mb-1">Available Balance:</div>
              <div className="text-2xl font-bold text-neon-yellow">R {walletBalance.toFixed(2)}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount (R)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={walletBalance.toString()}
                step="0.01"
                required
                className="bg-darkbg-lighter border-gray-700 text-white"
              />
              {parseFloat(withdrawAmount) > walletBalance && (
                <div className="text-red-500 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Amount exceeds available balance
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdrawDetails">Banking Details</Label>
              <Input
                id="withdrawDetails"
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
                placeholder="Enter your banking details for transfer"
                required
                className="bg-darkbg-lighter border-gray-700 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsWithdrawDialogOpen(false)}
              className="border border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawSubmit}
              disabled={isProcessing || !withdrawAmount || !withdrawDetails || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance}
              className="bg-neon-yellow text-black font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Withdraw
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTab;
