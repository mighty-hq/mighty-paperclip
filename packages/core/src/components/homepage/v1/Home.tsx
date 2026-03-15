'use client';

import React from 'react';
import { Command, Zap, Clock, Sparkles, ClipboardList, FileText, ArrowRight } from 'lucide-react';

interface HomeProps {
  headerActionLabel?: string;
  onHeaderAction?: () => void;
  onOpenCommand?: () => void;
}

const Home: React.FC<HomeProps> = ({ onOpenCommand, onHeaderAction, headerActionLabel }) => {
  const features = [
    {
      icon: Command,
      title: 'Quick Launcher',
      description: 'Access everything with a simple keyboard shortcut',
      gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
      icon: ClipboardList,
      title: 'Clipboard History',
      description: 'Never lose what you copied. Access unlimited history',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: FileText,
      title: 'Smart Snippets',
      description: 'Save and organize your frequently used content',
      gradient: 'from-pink-500/20 to-orange-500/20',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and efficiency',
      gradient: 'from-orange-500/20 to-yellow-500/20',
    },
  ];

  const recentActivity = [
    { type: 'copy', content: 'npm install react-router-dom', time: '2m ago' },
    { type: 'snippet', content: 'Email signature', time: '15m ago' },
    { type: 'copy', content: 'https://github.com/extensions', time: '1h ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Command className="h-5 w-5 text-blue-400" />
            </div>
            <span className="font-semibold text-lg text-white">Mighty Shortcut</span>
          </div>
          {onHeaderAction ? (
            <button
              type="button"
              onClick={onHeaderAction}
              className="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-medium text-sm text-white transition-all duration-200 hover:bg-white/10">
              {headerActionLabel ?? 'Login'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </header>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Command className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="mb-4 font-bold text-5xl text-white">
            Your Productivity
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {' '}
              Supercharged
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400 text-xl">
            A powerful clipboard manager and quick launcher. Access your clipboard history, saved snippets, and commands
            with lightning speed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onOpenCommand}
              className="group flex items-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700">
              <Command className="h-5 w-5" />
              Open Command Palette
              <kbd className="hidden rounded bg-black/20 px-2 py-1 text-xs sm:inline-block">Ctrl+K</kbd>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-white text-xl">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mb-16 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-1 font-bold text-3xl text-white">100+</div>
            <div className="text-gray-400 text-sm">Clipboard Items</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-1 font-bold text-3xl text-white">25</div>
            <div className="text-gray-400 text-sm">Saved Snippets</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-1 font-bold text-3xl text-white">5</div>
            <div className="text-gray-400 text-sm">Categories</div>
          </div>
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
                    {activity.type === 'copy' ? (
                      <ClipboardList className="h-4 w-4 text-blue-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <span className="text-gray-300 text-sm">{activity.content}</span>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-400 text-sm">
            <Sparkles className="h-4 w-4" />
            Press <kbd className="mx-1 rounded bg-white/10 px-2 py-1">Ctrl+K</kbd> or
            <kbd className="mx-1 rounded bg-white/10 px-2 py-1">Cmd+K</kbd> to open the command palette
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
