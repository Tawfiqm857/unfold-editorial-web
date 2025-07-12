import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ShoppingCart, Settings, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'user_signup':
        return <User className="h-4 w-4" />;
      case 'user_login':
        return <LogIn className="h-4 w-4" />;
      case 'order_created':
        return <ShoppingCart className="h-4 w-4" />;
      case 'profile_updated':
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.action) {
      case 'user_signup':
        return 'Account created';
      case 'user_login':
        return 'Signed in to account';
      case 'order_created':
        return `Order ${activity.details?.order_number || 'created'}`;
      case 'profile_updated':
        return 'Profile information updated';
      default:
        return activity.action.replace('_', ' ');
    }
  };

  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'user_signup':
        return <Badge variant="secondary">Account</Badge>;
      case 'user_login':
        return <Badge variant="outline">Auth</Badge>;
      case 'order_created':
        return <Badge>Order</Badge>;
      case 'profile_updated':
        return <Badge variant="secondary">Profile</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your recent account activity</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getActivityBadge(activity.action)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;