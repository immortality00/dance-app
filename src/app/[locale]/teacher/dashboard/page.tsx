import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Calendar, Users, BookOpen, BarChart } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacher.dashboard');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function TeacherDashboard() {
  const t = await getTranslations('teacher.dashboard');

  const stats = [
    {
      title: t('stats.totalStudents'),
      value: '120',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: t('stats.activeClasses'),
      value: '8',
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      title: t('stats.upcomingLessons'),
      value: '12',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      title: t('stats.attendanceRate'),
      value: '95%',
      icon: BarChart,
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
          <h2 className="text-xl font-semibold mb-4">{t('upcomingLessons')}</h2>
          <div className="space-y-4">
            {/* Add upcoming lessons list here */}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('recentActivity')}</h2>
          <div className="space-y-4">
            {/* Add recent activity list here */}
          </div>
        </Card>
      </div>
    </div>
  );
} 