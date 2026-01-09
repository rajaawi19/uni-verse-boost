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
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <WelcomeHeader />
        
        <QuoteWidget />
        
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TaskManager />
          </div>
          <div className="space-y-6">
            <PomodoroTimer />
            <FlashcardSystem />
            <AIStudyAssistant />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <ClassSchedule />
          <QuickNotes />
          <GPACalculator />
          <ExpenseTracker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DictionaryWidget />
          <WikipediaSearch />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CalendarWidget />
          <WeatherWidget />
          <ResourceLinks />
        </div>
        
        <footer className="text-center text-muted-foreground text-sm mt-12 pb-8">
          <p>Made with 💜 for students everywhere</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
