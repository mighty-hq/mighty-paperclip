import React from 'react';
import { Link } from '../utils/useNavigation';
import { Command, Zap, Clock, Sparkles, ClipboardList, FileText, Shield, Keyboard } from 'lucide-react';

const HomePage: React.FC = () => {
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
      icon: Sparkles,
      title: 'AI Prompts',
      description: 'Organize and execute your AI prompts efficiently',
      gradient: 'from-orange-500/20 to-yellow-500/20',
    },
    {
      icon: Keyboard,
      title: 'Keyboard First',
      description: 'Navigate everything without touching your mouse',
      gradient: 'from-green-500/20 to-blue-500/20',
    },
    {
      icon: Shield,
      title: 'Privacy Focused',
      description: 'Your data stays on your device, encrypted and secure',
      gradient: 'from-cyan-500/20 to-purple-500/20',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Command className="h-10 w-10 text-blue-400" />
          </div>

          <h1 className="mb-6 font-bold text-6xl text-white">
            Your Productivity
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-gray-400 text-xl">
            A powerful clipboard manager, snippet organizer, and quick launcher. Built for developers, designers, and
            power users.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg bg-blue-600 px-8 py-4 font-medium text-lg text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700">
              Get Started Free
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-white/10 bg-white/5 px-8 py-4 font-medium text-lg text-white transition-colors hover:bg-white/10">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-4xl text-white">Powerful Features</h2>
            <p className="text-gray-400 text-xl">Everything you need to boost your productivity</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12">
            <h2 className="mb-4 font-bold text-4xl text-white">Ready to get started?</h2>
            <p className="mb-8 text-gray-300 text-xl">
              Join thousands of users who are already boosting their productivity.
            </p>
            <Link
              to="/dashboard"
              className="inline-block rounded-lg bg-blue-600 px-8 py-4 font-medium text-lg text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700">
              Start Using Mighty Shortcut
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
