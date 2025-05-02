
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Badge, Edit, Plus, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Achievement } from '@/types/achievement';
import AchievementForm from '@/components/admin/AchievementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadAchievements();
  }, []);
  
  const loadAchievements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, badge_id(*)') as { data: any[], error: any };
      
      if (error) throw error;
      
      // Transform the data to match our types
      const formattedAchievements: Achievement[] = data?.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        badge: {
          id: achievement.badge_id.id,
          name: achievement.badge_id.name,
          description: achievement.badge_id.description,
          icon: achievement.badge_id.icon,
          rarity: achievement.badge_id.rarity,
          unlockedAt: achievement.badge_id.unlocked_at || undefined,
        },
        progress: achievement.progress,
        completed: achievement.completed,
        completedAt: achievement.completed_at || undefined,
        requiredCount: achievement.required_count,
        currentCount: achievement.current_count,
      })) || [];
      
      setAchievements(formattedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: "Error loading achievements",
        description: "Could not load achievements data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Achievement deleted",
        description: "The achievement has been deleted successfully.",
      });
      
      loadAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Error deleting achievement",
        description: "Could not delete the achievement.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Award className="mr-2 h-6 w-6" />
            Manage Achievements
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Achievement
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Create and manage achievements that users can earn.
          </p>
          
          {loading ? (
            <div className="text-center py-8">Loading achievements...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>Required Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No achievements found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    achievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell className="font-medium">{achievement.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="h-4 w-4 text-primary" />
                            {achievement.badge.name}
                          </div>
                        </TableCell>
                        <TableCell>{achievement.requiredCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAchievement(achievement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAchievement(achievement.id)}>
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Achievement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <AchievementForm 
              achievement={selectedAchievement} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadAchievements();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Achievement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Achievement</DialogTitle>
          </DialogHeader>
          <AchievementForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              loadAchievements();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAchievements;
