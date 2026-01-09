import { useState, useEffect } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';

export const WelcomeHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const { profile, user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentTime]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get display name with fallbacks
  const displayName = profile?.display_name || 
    user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || 
    'Student';

  return (
    <div className="gradient-hero rounded-2xl p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">Student Dashboard</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
          {greeting}, <span className="text-gradient">{displayName}!</span>
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="text-2xl font-mono font-semibold text-primary">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};
