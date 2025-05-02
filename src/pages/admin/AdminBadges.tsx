
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge as BadgeIcon, Edit, Plus, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/types/achievement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BadgeForm from '@/components/admin/BadgeForm';
import BadgeDisplay from '@/components/achievements/BadgeDisplay';

const AdminBadges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadBadges();
  }, []);
  
  const loadBadges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*') as { data: any[], error: any };
      
      if (error) throw error;
      
      // Transform the data to match our types
      const formattedBadges: Badge[] = data?.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        unlockedAt: badge.unlocked_at || undefined,
      })) || [];
      
      setBadges(formattedBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
      toast({
        title: "Error loading badges",
        description: "Could not load badges data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteBadge = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this badge? This will also delete any achievements using this badge.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Badge deleted",
        description: "The badge has been deleted successfully.",
      });
      
      loadBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({
        title: "Error deleting badge",
        description: "Could not delete the badge. It might be in use by achievements.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <BadgeIcon className="mr-2 h-6 w-6" />
            Manage Badges
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Badge
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Create and manage badges that can be assigned to achievements.
          </p>
          
          {loading ? (
            <div className="text-center py-8">Loading badges...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Badge</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Rarity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No badges found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    badges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <BadgeDisplay badge={badge} size="sm" showTooltip={false} />
                        </TableCell>
                        <TableCell className="font-medium">
                          {badge.name}
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {badge.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium capitalize
                            ${badge.rarity === 'common' && 'bg-blue-100 text-blue-800'}
                            ${badge.rarity === 'uncommon' && 'bg-green-100 text-green-800'}
                            ${badge.rarity === 'rare' && 'bg-purple-100 text-purple-800'}
                            ${badge.rarity === 'epic' && 'bg-pink-100 text-pink-800'}
                            ${badge.rarity === 'legendary' && 'bg-amber-100 text-amber-800'}
                          `}>
                            {badge.rarity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditBadge(badge)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBadge(badge.id)}>
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
      
      {/* Edit Badge Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Badge</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <BadgeForm 
              badge={selectedBadge} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadBadges();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Badge Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Badge</DialogTitle>
          </DialogHeader>
          <BadgeForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              loadBadges();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBadges;
