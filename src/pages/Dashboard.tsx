import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { TaskManager } from '@/components/dashboard/TaskManager';
import { PomodoroTimer } from '@/components/dashboard/PomodoroTimer';
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
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Sign Out</span>
            </Button>
          </div>
        </div>
        
        <WelcomeHeader />
        
        <QuoteWidget />
        
        <StatsOverview />
        
        {/* Main Grid - Tasks, Timer & AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <TaskManager />
          <div className="space-y-4 sm:space-y-5">
            <PomodoroTimer />
            <Calculator />
          </div>
          <div className="space-y-4 sm:space-y-5">
            <AIStudyAssistant />
            <FlashcardSystem />
          </div>
        </div>
        
        {/* Study Tools Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <GPACalculator />
          <QuickNotes />
          <DictionaryWidget />
          <WikipediaSearch />
        </div>

        {/* Schedule & Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <ClassSchedule />
          <CalendarWidget />
          <ExpenseTracker />
        </div>
        
        {/* Info & Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <WeatherWidget />
          <ResourceLinks />
        </div>
        
        <footer className="text-center text-muted-foreground text-xs sm:text-sm mt-8 sm:mt-12 pb-6 sm:pb-8">
          <p>Made with 💜 for students everywhere</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
