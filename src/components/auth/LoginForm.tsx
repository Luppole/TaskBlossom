
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface LoginFormProps {
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setLoading, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useSupabase();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Successfully logged in!');
      onSuccess();
    } catch (error: any) {
      let errorMessage = 'Failed to log in';
      
      // Handle Supabase auth errors
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many failed login attempts. Please try again later';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      {error && (
        <motion.p 
          className="text-sm text-destructive" 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      <Button type="submit" className="w-full">Log In</Button>
    </motion.form>
  );
};

export default LoginForm;
