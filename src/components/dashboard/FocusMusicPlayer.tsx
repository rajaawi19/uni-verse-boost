import { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward,
  Waves,
  Wind,
  TreePine,
  CloudRain,
  Flame,
  Coffee,
  Bird,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SoundTrack {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  category: 'lofi' | 'nature' | 'ambient' | 'focus' | 'jazz';
}

// Reliable free audio sources - using direct MP3 files that work cross-origin
const SOUND_TRACKS: SoundTrack[] = [
  // === LO-FI & CHILL BEATS ===
  {
    id: 'lofi-chill',
    name: 'Lofi Chill Vibes',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    category: 'lofi'
  },
  {
    id: 'lofi-beats',
    name: 'Study Beats',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'lofi'
  },
  {
    id: 'lofi-dream',
    name: 'Dreamy Lofi',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    category: 'lofi'
  },
  {
    id: 'lofi-night',
    name: 'Night Study',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    category: 'lofi'
  },
  
  // === JAZZ & COFFEEHOUSE ===
  {
    id: 'jazz-smooth',
    name: 'Smooth Jazz',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    category: 'jazz'
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    category: 'jazz'
  },
  {
    id: 'jazz-mellow',
    name: 'Mellow Jazz',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    category: 'jazz'
  },
  
  // === FOCUS & CONCENTRATION ===
  {
    id: 'focus-deep',
    name: 'Deep Focus',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    category: 'focus'
  },
  {
    id: 'focus-ambient',
    name: 'Ambient Focus',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    category: 'focus'
  },
  {
    id: 'focus-zen',
    name: 'Zen Concentration',
    icon: <Music className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    category: 'focus'
  },
  
  // === NATURE SOUNDS (using reliable freesound samples) ===
  {
    id: 'rain',
    name: 'Rain Sounds',
    icon: <CloudRain className="w-4 h-4" />,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Rain_moderate.ogg',
    category: 'nature'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: <Waves className="w-4 h-4" />,
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ocean_Waves.ogg',
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: <Bird className="w-4 h-4" />,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Bird_singing.ogg',
    category: 'nature'
  },
  {
    id: 'wind',
    name: 'Wind Ambience',
    icon: <Wind className="w-4 h-4" />,
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Wind_sound.ogg',
    category: 'nature'
  },
  
  // === AMBIENT & WHITE NOISE ===
  {
    id: 'ambient-space',
    name: 'Space Ambient',
    icon: <Waves className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    category: 'ambient'
  },
  {
    id: 'ambient-drone',
    name: 'Ambient Drone',
    icon: <TreePine className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    category: 'ambient'
  },
  {
    id: 'fireplace',
    name: 'Cozy Fireplace',
    icon: <Flame className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    category: 'ambient'
  },
  {
    id: 'cafe',
    name: 'Café Ambience',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    category: 'ambient'
  }
];

const CATEGORIES = [
  { id: 'lofi', label: 'Lo-Fi', color: 'from-purple-500 to-pink-500' },
  { id: 'jazz', label: 'Jazz', color: 'from-amber-500 to-orange-500' },
  { id: 'focus', label: 'Focus', color: 'from-blue-500 to-cyan-500' },
  { id: 'nature', label: 'Nature', color: 'from-green-500 to-emerald-500' },
  { id: 'ambient', label: 'Ambient', color: 'from-slate-500 to-gray-600' }
];

interface FocusMusicPlayerProps {
  isPomodoroRunning?: boolean;
  pomodoroMode?: 'focus' | 'shortBreak' | 'longBreak';
}

export const FocusMusicPlayer = ({ isPomodoroRunning, pomodoroMode }: FocusMusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SoundTrack>(SOUND_TRACKS[0]);
  const [autoSync, setAutoSync] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('lofi');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const filteredTracks = SOUND_TRACKS.filter(t => t.category === selectedCategory);

  // Initialize audio element with better error handling
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Audio unavailable - try another track');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
      setIsPlaying(true);
    };

    const handleEnded = () => {
      // For non-looping tracks, restart
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Auto-play/pause based on Pomodoro timer state
  useEffect(() => {
    if (autoSync && isPomodoroRunning !== undefined) {
      if (isPomodoroRunning && pomodoroMode === 'focus') {
        handlePlay();
      } else if (!isPomodoroRunning || pomodoroMode !== 'focus') {
        handlePause();
      }
    }
  }, [isPomodoroRunning, pomodoroMode, autoSync]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    
    setError(null);
    setIsLoading(true);

    try {
      // Set source if not set or different
      if (!audioRef.current.src || !audioRef.current.src.includes(currentTrack.url.split('/').pop() || '')) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
      
      // Small delay to ensure audio is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.log('Play error:', err);
      setIsLoading(false);
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Tap play to start');
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const selectTrack = (track: SoundTrack) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsPlaying(false);
    setCurrentTrack(track);
    setError(null);
    
    if (wasPlaying) {
      // Use setTimeout to allow state update first
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = track.url;
          audioRef.current.load();
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setError('Tap play to start');
          });
        }
      }, 150);
    }
  };

  const nextTrack = () => {
    const categoryTracks = SOUND_TRACKS.filter(t => t.category === selectedCategory);
    const currentIndex = categoryTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % categoryTracks.length;
    selectTrack(categoryTracks[nextIndex >= 0 ? nextIndex : 0]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lofi': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'jazz': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'focus': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'nature': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'ambient': return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryGradient = (categoryId: string) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? `bg-gradient-to-r ${cat.color}` : '';
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span>Focus Music</span>
          </div>
          {autoSync && isPomodoroRunning !== undefined && (
            <Badge variant="outline" className={cn(
              "text-xs",
              isPomodoroRunning && pomodoroMode === 'focus' 
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" 
                : "bg-muted"
            )}>
              {isPomodoroRunning && pomodoroMode === 'focus' ? '🎵 Synced' : '⏸ Ready'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Track Display */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          isPlaying ? "bg-primary/5 border-primary/20" : "bg-muted/30"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
            isPlaying ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-muted"
          )}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span className={isPlaying ? "text-white" : ""}>{currentTrack.icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{currentTrack.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentTrack.category}</p>
            {error && <p className="text-xs text-orange-500">{error}</p>}
          </div>
          {isPlaying && !isLoading && (
            <div className="flex gap-0.5 items-end h-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{ 
                    height: `${8 + (i % 3) * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="h-9 w-9"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={togglePlay}
            size="lg"
            disabled={isLoading}
            className={cn(
              "w-12 h-12 rounded-full transition-all",
              isPlaying 
                ? "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                : "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 text-white" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextTrack}
            className="h-9 w-9"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 px-1">
          <VolumeX className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="flex-1"
          />
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </div>

        {/* Category Tabs */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "text-xs h-7 px-3",
                  selectedCategory === cat.id && `${getCategoryGradient(cat.id)} text-white border-0`
                )}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Track Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {CATEGORIES.find(c => c.id === selectedCategory)?.label} Tracks ({filteredTracks.length})
          </p>
          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredTracks.map((track) => (
              <Button
                key={track.id}
                variant="outline"
                size="sm"
                onClick={() => selectTrack(track)}
                className={cn(
                  "h-auto py-2 px-3 justify-start gap-2 text-xs",
                  currentTrack.id === track.id && getCategoryColor(track.category)
                )}
              >
                {track.icon}
                <span className="truncate">{track.name}</span>
                {currentTrack.id === track.id && isPlaying && (
                  <div className="ml-auto flex gap-0.5 items-end h-3">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-0.5 bg-current rounded-full animate-pulse"
                        style={{ 
                          height: `${4 + (i % 3) * 3}px`,
                          animationDelay: `${i * 0.15}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Auto-sync Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Sync with Pomodoro
          </span>
          <Button
            variant={autoSync ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoSync(!autoSync)}
            className={cn(
              "text-xs h-7",
              autoSync && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            )}
          >
            {autoSync ? 'On' : 'Off'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
