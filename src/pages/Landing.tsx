import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/dashboard/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Clock, 
  Target, 
  Sparkles,
  GraduationCap,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    { icon: Target, title: 'Task Management', description: 'Stay organized with smart task tracking and priorities' },
    { icon: Clock, title: 'Pomodoro Timer', description: 'Boost focus with proven time management techniques' },
    { icon: Brain, title: 'Flashcard System', description: 'Master subjects with spaced repetition learning' },
    { icon: BookOpen, title: 'Study Resources', description: 'Access dictionary, Wikipedia, and AI assistance' },
    { icon: Calendar, title: 'Schedule Planner', description: 'Never miss a class or deadline again' },
    { icon: TrendingUp, title: 'GPA Calculator', description: 'Track your academic progress effortlessly' },
  ];

  const stats = [
    { number: '10K+', label: 'Active Students' },
    { number: '95%', label: 'Improved Grades' },
    { number: '2M+', label: 'Tasks Completed' },
    { number: '4.9', label: 'User Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyHub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')} className="hidden sm:inline-flex">
              Get Started
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-float">
              <Sparkles className="h-4 w-4" />
              Your Academic Success Starts Here
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Master Your Studies with
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-slow">
                Smart Learning Tools
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              All-in-one student dashboard featuring task management, flashcards with spaced repetition, 
              Pomodoro timer, GPA calculator, and AI-powered study assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover-lift"
              >
                Start Learning Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="text-lg px-8 py-6"
              >
                I Have an Account
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-12">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover-lift transition-all"
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</span>
                  {stat.icon && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className={`text-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="text-primary"> Excel</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for students to boost productivity and achieve academic success.
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card transition-all hover-lift"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className={`max-w-4xl mx-auto text-center p-8 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Users className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Thousands of Successful Students
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start your journey to academic excellence today. It's free to get started!
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="text-lg px-10 py-6 shadow-lg"
            >
              Create Free Account
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              {/* Brand Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">StudyHub</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Your all-in-one student productivity platform. Built with passion for learners everywhere.
                </p>
                <p className="text-sm text-muted-foreground">
                  Made with 💜 for students everywhere
                </p>
              </div>

              {/* Developer Contact Section */}
              <div>
                <h4 className="font-semibold mb-4">Developer Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span>Abhishek Prasad Verma</span>
                  </div>
                  <a 
                    href="mailto:vermaawishek1234@gmail.com" 
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    vermaawishek1234@gmail.com
                  </a>
                  <a 
                    href="tel:+919507277348" 
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    +91-9507277348
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-6 border-t border-border/50">
              <a 
                href="https://www.linkedin.com/in/abhishek-prasad-verma-4a33482a3/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                <Linkedin className="h-4 w-4 text-primary" />
                LinkedIn
              </a>
              <a 
                href="https://github.com/abhishekverma19" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                <Github className="h-4 w-4 text-primary" />
                GitHub
              </a>
              <a 
                href="https://dev-showcase-studio-15.lovable.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                <Globe className="h-4 w-4 text-primary" />
                Portfolio
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} StudyHub. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
