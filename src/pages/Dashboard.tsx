import { useState, useCallback } from 'react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { TaskManager } from '@/components/dashboard/TaskManager';
import { PomodoroTimer, TimerMode } from '@/components/dashboard/PomodoroTimer';
import { QuickNotes } from '@/components/dashboard/QuickNotes';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { QuoteWidget } from '@/components/dashboard/QuoteWidget';
import { ClassSchedule } from '@/components/dashboard/ClassSchedule';
import { GPACalculator } from '@/components/dashboard/GPACalculator';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { ResourceLinks } from '@/components/dashboard/ResourceLinks';
import { AIStudyAssistant } from '@/components/dashboard/AIStudyAssistant';
import { DictionaryWidget } from '@/components/dashboard/DictionaryWidget';
import { WikipediaSearch } from '@/components/dashboard/WikipediaSearch';
import { FlashcardSystem } from '@/components/dashboard/FlashcardSystem';
import { ExpenseTracker } from '@/components/dashboard/ExpenseTracker';
import { Calculator } from '@/components/dashboard/Calculator';
import { FocusMusicPlayer } from '@/components/dashboard/FocusMusicPlayer';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { PullToRefresh } from '@/components/dashboard/PullToRefresh';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [pomodoroState, setPomodoroState] = useState<{ isRunning: boolean; mode: TimerMode }>({
    isRunning: false,
    mode: 'focus'
  });

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed!');
  }, []);

  const handlePomodoroStateChange = useCallback((isRunning: boolean, mode: TimerMode) => {
    setPomodoroState({ isRunning, mode });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              Logged in as <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile-settings')} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          
          <WelcomeHeader />
          
          {/* Quick Stats & Motivation */}
          <div className="mb-6">
            <QuoteWidget key={`quote-${refreshKey}`} />
          </div>
          
          <div className="mb-6">
            <StatsOverview key={`stats-${refreshKey}`} />
          </div>

          {/* Section: Focus Zone */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Focus Zone
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:row-span-2" data-section="timer">
                <PomodoroTimer onStateChange={handlePomodoroStateChange} />
              </div>
              <FocusMusicPlayer 
                isPomodoroRunning={pomodoroState.isRunning} 
                pomodoroMode={pomodoroState.mode} 
              />
              <div className="md:col-span-1">
                <TaskManager key={`tasks-${refreshKey}`} />
              </div>
            </div>
          </div>

          {/* Section: Study Tools */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Study Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AIStudyAssistant />
              <FlashcardSystem key={`flashcards-${refreshKey}`} />
              <QuickNotes key={`notes-${refreshKey}`} />
            </div>
          </div>

          {/* Section: Academics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Academics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GPACalculator />
              <ClassSchedule />
              <CalendarWidget />
              <Calculator />
            </div>
          </div>

          {/* Section: Research & Reference */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Research & Reference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DictionaryWidget />
              <WikipediaSearch />
              <ResourceLinks />
            </div>
          </div>

          {/* Section: Life Management */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Life Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExpenseTracker key={`expenses-${refreshKey}`} />
              <WeatherWidget key={`weather-${refreshKey}`} />
            </div>
          </div>
          
          <footer className="text-center text-muted-foreground text-xs sm:text-sm mt-8 pb-6">
            <p>Made with 💜 for students everywhere</p>
          </footer>
        </div>
      </PullToRefresh>
      
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
