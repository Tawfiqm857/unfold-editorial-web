import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Upload, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  avatar_url: string;
  bio: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

const ProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create default profile
        const defaultProfile = {
          user_id: user?.id || '',
          full_name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          avatar_url: '',
          bio: '',
          notification_preferences: {
            email: true,
            push: true,
            marketing: false
          }
        };
        setProfile(defaultProfile as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!profile) return;
    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences,
        [field]: value
      }
    });
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        notification_preferences: profile.notification_preferences
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'profile_updated',
          details: { fields_updated: Object.keys(profileData) }
        });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter your country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter your state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <Separator />

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing emails and offers
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;