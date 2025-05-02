
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Badge } from '@/types/achievement';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  badgeId: z.string().min(1, "Badge selection is required"),
  requiredCount: z.coerce.number().min(1, "Required count must be at least 1"),
  completed: z.boolean().default(false),
});

interface AchievementFormProps {
  achievement?: Achievement;
  onSuccess: () => void;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ achievement, onSuccess }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: achievement?.title || '',
      description: achievement?.description || '',
      badgeId: achievement?.badge.id || '',
      requiredCount: achievement?.requiredCount || 1,
      completed: achievement?.completed || false,
    },
  });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*') as { data: any[], error: any };

        if (error) throw error;

        // Transform data to match our Badge type
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
        console.error('Error fetching badges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load badges',
          variant: 'destructive',
        });
      }
    };

    fetchBadges();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (achievement) {
        // Update existing achievement
        const { error } = await supabase
          .from('user_achievements')
          .update({
            title: values.title,
            description: values.description,
            badge_id: values.badgeId,
            required_count: values.requiredCount,
            completed: values.completed,
            completed_at: values.completed ? new Date().toISOString() : null,
          })
          .eq('id', achievement.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Achievement updated successfully',
        });
      } else {
        // Create new achievement
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            title: values.title,
            description: values.description,
            badge_id: values.badgeId,
            required_count: values.requiredCount,
            completed: values.completed,
            completed_at: values.completed ? new Date().toISOString() : null,
            progress: values.completed ? 100 : 0,
            user_id: 'ADMIN', // This would be replaced with actual user ID in a real implementation
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Achievement created successfully',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save achievement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Complete 5 tasks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Complete 5 tasks in a single day to earn this achievement" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="badgeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a badge" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {badges.map((badge) => (
                    <SelectItem key={badge.id} value={badge.id}>
                      {badge.name} ({badge.rarity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requiredCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Count</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Completed</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Mark this achievement as completed
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : achievement ? 'Update' : 'Create'} Achievement
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AchievementForm;
