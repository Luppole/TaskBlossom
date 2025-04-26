
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const { user } = useFirebase();
  
  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>TaskBlossom | Sign In</title>
        <meta name="description" content="Sign in or create an account to use TaskBlossom's full features." />
      </Helmet>
      
      <motion.div
        className="flex flex-col items-center justify-center min-h-[80vh] px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CardTitle className="text-2xl font-bold">Welcome to TaskBlossom</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to your account or create a new one
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="login">
                  <LoginForm setLoading={setLoading} onSuccess={() => {}} />
                </TabsContent>
                
                <TabsContent value="signup">
                  <SignupForm setLoading={setLoading} onSuccess={() => {}} />
                </TabsContent>
              </motion.div>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                By continuing, you agree to TaskBlossom's{' '}
                <a href="#" className="underline hover:text-primary">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
};

export default Auth;
