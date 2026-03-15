import React from 'react';
import { TrendingUp, ClipboardList, FileText, Sparkles, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  console.log('DashboardPage');
  const stats = [
    { label: 'Clipboard Items', value: '127', icon: ClipboardList, color: 'blue' },
    { label: 'Saved Snippets', value: '43', icon: FileText, color: 'purple' },
    { label: 'Prompts', value: '78', icon: Sparkles, color: 'orange' },
    { label: 'Usage Today', value: '2.5h', icon: Clock, color: 'green' },
  ];

  const recentActivity = [
    { type: 'clipboard', content: 'npm install react-router-dom', time: '2m ago' },
    { type: 'snippet', content: 'Email Signature', time: '15m ago' },
    { type: 'prompt', content: 'Code Review Assistant', time: '1h ago' },
    { type: 'clipboard', content: 'https://github.com/extensions', time: '2h ago' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your productivity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/20',
            purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/20',
            orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/20',
            green: 'from-green-500/20 to-green-600/20 border-green-500/20',
          };

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} rounded-xl border p-6 backdrop-blur-sm`}>
              <div className="mb-4 flex items-center justify-between">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="mb-1 font-bold text-3xl text-white">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-lg text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  {activity.type === 'clipboard' ? (
                    <ClipboardList className="h-4 w-4 text-blue-400" />
                  ) : activity.type === 'snippet' ? (
                    <FileText className="h-4 w-4 text-purple-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-orange-400" />
                  )}
                </div>
                <span className="text-gray-300 text-sm">{activity.content}</span>
              </div>
              <span className="text-gray-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:bg-white/10">
          <ClipboardList className="mb-3 h-8 w-8 text-blue-400" />
          <h3 className="mb-1 font-semibold text-white">View Clipboard</h3>
          <p className="text-gray-400 text-sm">Access your clipboard history</p>
        </button>
        <button className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:bg-white/10">
          <FileText className="mb-3 h-8 w-8 text-purple-400" />
          <h3 className="mb-1 font-semibold text-white">Create Snippet</h3>
          <p className="text-gray-400 text-sm">Save a new code snippet</p>
        </button>
        <button className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:bg-white/10">
          <Sparkles className="mb-3 h-8 w-8 text-orange-400" />
          <h3 className="mb-1 font-semibold text-white">Browse Prompts</h3>
          <p className="text-gray-400 text-sm">Explore AI prompts library</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
