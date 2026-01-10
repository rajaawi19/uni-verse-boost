import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Settings } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const WelcomeHeader = () => {
  const navigate = useNavigate();
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

  // Get initials for avatar fallback
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'S';
  };

  return (
    <div className="gradient-hero rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 gradient-primary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Top right controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/profile-settings')}
          className="h-8 w-8 rounded-full hover:bg-primary/10"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <ThemeSwitcher />
      </div>
      
      <div className="relative z-10 pr-10 sm:pr-0">
        <div className="flex items-center gap-4 mb-3">
          {/* Avatar */}
          <Avatar 
            className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => navigate('/profile-settings')}
          >
            <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
            <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2 text-primary mb-0.5">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Student Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground break-words">
              {greeting}, <span className="text-gradient">{displayName}!</span>
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{formatDate(currentTime)}</span>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-mono font-semibold text-primary">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};
