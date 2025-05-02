
import React, { useState } from 'react';
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
import { Badge } from '@/types/achievement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BadgeDisplay from '@/components/achievements/BadgeDisplay';

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.string().min(1, "Icon is required"),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary'], {
    required_error: "Rarity is required",
  }),
});

interface BadgeFormProps {
  badge?: Badge;
  onSuccess: () => void;
}

const iconOptions = [
  { value: 'award', label: 'Award' },
  { value: 'star', label: 'Star' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'medal', label: 'Medal' },
  { value: 'badge', label: 'Badge' },
  { value: 'sparkles', label: 'Sparkles' }
];

const BadgeForm: React.FC<BadgeFormProps> = ({ badge, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [previewBadge, setPreviewBadge] = useState<Badge>({
    id: badge?.id || 'preview',
    name: badge?.name || 'Badge Preview',
    description: badge?.description || 'Badge description',
    icon: badge?.icon || 'award',
    rarity: badge?.rarity || 'common',
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: badge?.name || '',
      description: badge?.description || '',
      icon: badge?.icon || 'award',
      rarity: badge?.rarity || 'common',
    },
  });

  // Update preview when form changes
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name || value.description || value.icon || value.rarity) {
        setPreviewBadge(prev => ({
          ...prev,
          name: value.name || prev.name,
          description: value.description || prev.description,
          icon: value.icon as string || prev.icon,
          rarity: value.rarity as Badge['rarity'] || prev.rarity,
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (badge) {
        // Update existing badge
        const { error } = await supabase
          .from('badges')
          .update({
            name: values.name,
            description: values.description,
            icon: values.icon,
            rarity: values.rarity,
          })
          .eq('id', badge.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Badge updated successfully',
        });
      } else {
        // Create new badge
        const { error } = await supabase
          .from('badges')
          .insert({
            name: values.name,
            description: values.description,
            icon: values.icon,
            rarity: values.rarity,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Badge created successfully',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save badge',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center mb-4">
          <BadgeDisplay badge={previewBadge} size="lg" />
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Task Master" {...field} />
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
                  placeholder="Complete 50 tasks to earn this badge" 
                  {...field} 
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
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
          name="rarity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rarity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rarity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : badge ? 'Update' : 'Create'} Badge
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BadgeForm;
