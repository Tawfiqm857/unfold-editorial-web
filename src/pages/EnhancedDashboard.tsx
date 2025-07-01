import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import Analytics from '@/components/Analytics';
import ActivityFeed from '@/components/ActivityFeed';
import ProfileManager from '@/components/ProfileManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShoppingCart, Package, CreditCard, LogOut, Settings, BarChart3, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

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
  notification_preferences: any;
}

const EnhancedDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserData();
      logActivity('dashboard_visit');
    }
  }, [user, loading, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const logActivity = async (action: string, details?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          details: details || {},
          ip_address: 'web',
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleSignOut = async () => {
    await logActivity('user_logout');
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const lastOrderDate = orders.length > 0 ? orders[0].created_at : undefined;

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name || user?.email}
                </h1>
                <p className="text-gray-600">
                  Manage your account and track your orders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="mb-8">
            <Analytics 
              totalOrders={orders.length}
              totalSpent={totalSpent}
              lastOrderDate={lastOrderDate}
            />
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => navigate('/order')}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order Magazine
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Browse Articles
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your latest magazine orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-4">Start by ordering your first magazine copy!</p>
                        <Button onClick={() => navigate('/order')}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Order Now
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">Order #{order.order_number}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatAmount(order.total_amount)}</p>
                                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(order.payment_status)}>
                                Payment: {order.payment_status}
                              </Badge>
                              <Badge className={getStatusColor(order.order_status)}>
                                Order: {order.order_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('orders')}
                          >
                            View All Orders
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Order History
                  </CardTitle>
                  <CardDescription>
                    Complete history of your magazine orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-4">Start by ordering your first magazine copy!</p>
                      <Button onClick={() => navigate('/order')}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">Order #{order.order_number}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatAmount(order.total_amount)}</p>
                              <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(order.payment_status)}>
                              Payment: {order.payment_status}
                            </Badge>
                            <Badge className={getStatusColor(order.order_status)}>
                              Order: {order.order_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileManager />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityFeed />
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-500">Last updated recently</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add extra security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedDashboard;