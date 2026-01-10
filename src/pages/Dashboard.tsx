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
          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
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
        
        <QuoteWidget />
        
        <StatsOverview />
        
        {/* Row 1: Core Tools - Tasks, Timer, AI, Flashcards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <TaskManager />
          </div>
          <PomodoroTimer />
          <Calculator />
        </div>
        
        {/* Row 2: Study Helpers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <AIStudyAssistant />
          <FlashcardSystem />
          <GPACalculator />
          <QuickNotes />
        </div>

        {/* Row 3: Reference & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <ClassSchedule />
          <DictionaryWidget />
          <WikipediaSearch />
        </div>
        
        {/* Row 4: Calendar, Expense & Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <CalendarWidget />
          <ExpenseTracker />
          <WeatherWidget />
          <ResourceLinks />
        </div>
        
        <footer className="text-center text-muted-foreground text-xs sm:text-sm mt-8 pb-6">
          <p>Made with 💜 for students everywhere</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
