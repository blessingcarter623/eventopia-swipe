
import React, { useState } from "react";
import { Event } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Mail, Share2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  
  if (!event) return null;
  
  const eventUrl = `${window.location.origin}/event/${event.id}`;
  
  const addEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput("");
    } else if (emailInput) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };
  
  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };
  
  const sendInvitations = () => {
    // In a real app, this would connect to a backend service
    // For now, we'll just show a success toast
    
    if (emails.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one email address",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Invitations sent!",
      description: `Invited ${emails.length} friends to "${event.title}"`,
    });
    
    onClose();
    setEmails([]);
    setMessage("");
  };
  
  const copyEventLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Link copied",
      description: "Event link copied to clipboard",
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darkbg text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription className="text-gray-400">
            Invite friends to "{event.title}" on {new Date(event.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-darkbg-lighter border-gray-700 text-white"
            />
            <Button onClick={addEmail} variant="outline" size="sm">Add</Button>
          </div>
          
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {emails.map(email => (
                <div key={email} className="flex items-center bg-darkbg-lighter px-2 py-1 rounded-full text-sm">
                  <span>{email}</span>
                  <button onClick={() => removeEmail(email)} className="ml-1 text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <Input
              placeholder="Add a personal message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-darkbg-lighter border-gray-700 text-white"
            />
          </div>
          
          <div className="flex justify-between p-3 rounded-md bg-darkbg-lighter">
            <span className="text-sm truncate">{eventUrl}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyEventLink}
              className="text-neon-yellow hover:text-neon-yellow/80"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyEventLink}
              className="text-white"
            >
              <Copy size={16} className="mr-1" /> Copy Link
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white"
              onClick={() => {
                window.open(`mailto:?subject=Join me at ${event.title}&body=Hey! I thought you might be interested in this event: ${event.title} on ${new Date(event.date).toLocaleDateString()}. Check it out here: ${eventUrl}${message ? "\n\n" + message : ""}`);
              }}
            >
              <Mail size={16} className="mr-1" /> Email
            </Button>
          </div>
          <Button onClick={sendInvitations} className="bg-neon-yellow text-black hover:bg-neon-yellow/90">
            <Share2 size={16} className="mr-1" /> Send Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendModal;
