import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Users, Building2, Calendar, Settings } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.dashboard');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AdminDashboard() {
  const t = await getTranslations('admin.dashboard');

  const stats = [
    {
      title: t('stats.totalUsers'),
      value: '250',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: t('stats.totalClasses'),
      value: '15',
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      title: t('stats.totalTeachers'),
      value: '8',
      icon: Building2,
      color: 'text-purple-500',
    },
    {
      title: t('stats.activeStudents'),
      value: '180',
      icon: Users,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('recentActivity')}</h2>
          <div className="space-y-4">
            {/* Add recent activity list here */}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('systemStatus')}</h2>
          <div className="space-y-4">
            {/* Add system status information here */}
          </div>
        </Card>
      </div>
    </div>
  );
} 