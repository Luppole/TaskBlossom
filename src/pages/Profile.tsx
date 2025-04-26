
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCircle, 
  Shield, 
  Activity, 
  Dumbbell, 
  Calendar, 
  ArrowLeft,
  Lock,
  Scale,
  FileDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirebase } from '@/contexts/FirebaseContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '@/types/friend';
import { saveAs } from 'file-saver';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");
  const { getUserProfile, user, exportUserData } = useFirebase();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        navigate('/');
        return;
      }
      
      try {
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, getUserProfile, navigate]);

  const handleExportData = async (dataType: 'meals' | 'workouts' | 'progress', format: 'csv' | 'pdf') => {
    if (!user || user.uid !== userId) return;
    
    try {
      const content = await exportUserData(dataType, format);
      
      if (format === 'csv') {
        // For CSV, create a blob and save it
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${dataType}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      } else {
        // For PDF, in a real app you would generate and download a PDF
        // This is a simplified version
        const blob = new Blob([content], { type: 'application/json' });
        saveAs(blob, `${dataType}_export_${new Date().toISOString().slice(0, 10)}.json`);
      }
    } catch (error) {
      console.error(`Error exporting ${dataType} data:`, error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">
            {t('profile.private')}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {t('profile.privateDescription')}
          </p>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/social')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </motion.div>
      </div>
    );
  }

  const isCurrentUser = user?.uid === userId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/social')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {profile.settings.publicProfile && (
                    <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center gap-1">
                      <UserCircle className="h-3 w-3" />
                      {t('profile.publicProfile')}
                    </div>
                  )}
                  
                  {profile.settings.shareProgress && (
                    <div className="bg-blue-500/10 text-blue-500 text-xs rounded-full px-2 py-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {t('profile.sharesProgress')}
                    </div>
                  )}
                  
                  {profile.settings.shareFitness && (
                    <div className="bg-green-500/10 text-green-500 text-xs rounded-full px-2 py-1 flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {t('profile.sharesFitness')}
                    </div>
                  )}
                </div>
              </div>
              
              {isCurrentUser && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <FileDown className="h-4 w-4" />
                        {t('profile.export')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportData('meals', 'csv')}>
                        {t('profile.exportMealsCSV')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportData('workouts', 'csv')}>
                        {t('profile.exportWorkoutsCSV')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportData('progress', 'csv')}>
                        {t('profile.exportProgressCSV')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="gap-2">
              <Activity className="h-4 w-4" />
              {t('profile.progress')}
            </TabsTrigger>
            <TabsTrigger value="fitness" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              {t('profile.fitness')}
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="progress">
              {profile.settings.shareProgress || isCurrentUser ? (
                profile.progressData?.progress && profile.progressData.progress.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Scale className="h-5 w-5 text-primary" />
                        <CardTitle>{t('profile.weightProgress')}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.progressData.progress.map((entry: any, index: number) => (
                        <div key={entry.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {format(entry.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">{entry.weight} kg</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scale className="mx-auto h-12 w-12 opacity-30 mb-4" />
                    <p>{t('profile.noProgressData')}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('profile.progressNotShared')}</h3>
                  <p className="text-muted-foreground">{t('profile.progressNotSharedDescription')}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="fitness">
              {profile.settings.shareFitness || isCurrentUser ? (
                profile.fitnessData?.workouts && profile.fitnessData.workouts.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <CardTitle>{t('profile.recentWorkouts')}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.fitnessData.workouts.map((workout: any, index: number) => (
                        <div key={workout.id || index} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{workout.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(workout.date, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{workout.duration} min</p>
                              <p className="text-sm text-muted-foreground">
                                {workout.exercises?.length || 0} {t('profile.exercises')}
                              </p>
                            </div>
                          </div>
                          
                          {workout.notes && (
                            <div className="mt-2 p-2 bg-background/80 rounded text-sm">
                              {workout.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Dumbbell className="mx-auto h-12 w-12 opacity-30 mb-4" />
                    <p>{t('profile.noFitnessData')}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('profile.fitnessNotShared')}</h3>
                  <p className="text-muted-foreground">{t('profile.fitnessNotSharedDescription')}</p>
                </div>
              )}
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Profile;
