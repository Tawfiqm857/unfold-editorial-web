import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface AnalyticsProps {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ totalOrders, totalSpent, lastOrderDate }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount / 100);
  };

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      change: totalOrders > 0 ? '+100%' : '0%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Spent',
      value: formatAmount(totalSpent),
      icon: DollarSign,
      change: totalSpent > 0 ? '+100%' : '0%',
      changeType: 'positive' as const
    },
    {
      title: 'Member Since',
      value: lastOrderDate ? new Date(lastOrderDate).toLocaleDateString() : 'New Member',
      icon: Users,
      change: 'Active',
      changeType: 'neutral' as const
    },
    {
      title: 'Engagement',
      value: totalOrders > 0 ? 'High' : 'New',
      icon: TrendingUp,
      change: totalOrders > 0 ? 'Engaged' : 'Starting',
      changeType: totalOrders > 0 ? 'positive' : 'neutral' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.changeType === 'positive' ? 'text-green-600' : 
              stat.changeType === 'negative' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Analytics;