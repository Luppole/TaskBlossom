
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const { user } = useFirebase();

  // Close modal if user is logged in
  if (user && isOpen) {
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-xl font-semibold">Welcome to TaskBlossom</span>
              <span className="text-2xl">🌸</span>
            </motion.div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="login" className="py-4">
                <LoginForm setLoading={setLoading} onSuccess={onClose} />
              </TabsContent>
              
              <TabsContent value="signup" className="py-4">
                <SignupForm setLoading={setLoading} onSuccess={onClose} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
        
        <div className="flex flex-col space-y-2 mt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue as guest</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            disabled={loading}
            onClick={onClose}
          >
            Continue Without Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
