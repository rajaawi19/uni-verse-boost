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
  category: 'lofi' | 'nature' | 'ambient';
}

// Using free, working audio sources
const SOUND_TRACKS: SoundTrack[] = [
  {
    id: 'lofi-hiphop',
    name: 'Lo-Fi Hip Hop',
    icon: <Music className="w-4 h-4" />,
    url: 'https://stream.zeno.fm/0r0xa792kwzuv', // Lofi Girl radio stream
    category: 'lofi'
  },
  {
    id: 'chillhop',
    name: 'Chillhop',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', // Chillhop radio stream
    category: 'lofi'
  },
  {
    id: 'rain',
    name: 'Rain Sounds',
    icon: <CloudRain className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112c589.mp3',
    category: 'nature'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: <Waves className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2024/11/15/audio_d8fbfc9f46.mp3',
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: <Bird className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2022/03/12/audio_b4f7e5a4bc.mp3',
    category: 'nature'
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: <Wind className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_b83e9f7d3b.mp3',
    category: 'ambient'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    icon: <Flame className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2024/03/18/audio_a3dfd5deaf.mp3',
    category: 'ambient'
  },
  {
    id: 'forest-ambient',
    name: 'Forest Night',
    icon: <TreePine className="w-4 h-4" />,
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_54ca0ffa52.mp3',
    category: 'ambient'
  }
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('canplaythrough', () => {
      setIsLoading(false);
      setError(null);
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to load audio');
    });

    audio.addEventListener('waiting', () => {
      setIsLoading(true);
    });

    audio.addEventListener('playing', () => {
      setIsLoading(false);
      setIsPlaying(true);
    });

    return () => {
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
      if (!audioRef.current.src || audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
      }
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log('Autoplay prevented or error:', err);
      setIsLoading(false);
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Click to play');
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

  const selectTrack = async (track: SoundTrack) => {
    const wasPlaying = isPlaying;
    handlePause();
    setCurrentTrack(track);
    setError(null);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      if (wasPlaying) {
        setTimeout(() => handlePlay(), 100);
      }
    }
  };

  const nextTrack = () => {
    const currentIndex = SOUND_TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % SOUND_TRACKS.length;
    selectTrack(SOUND_TRACKS[nextIndex]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lofi': return 'bg-primary/20 text-primary border-primary/30';
      case 'nature': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'ambient': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
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

        {/* Track Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Sound
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SOUND_TRACKS.map((track) => (
              <Button
                key={track.id}
                variant="outline"
                size="sm"
                onClick={() => selectTrack(track)}
                className={cn(
                  "h-auto py-1.5 px-2 justify-start gap-1.5 text-xs",
                  currentTrack.id === track.id && getCategoryColor(track.category)
                )}
              >
                {track.icon}
                <span className="truncate">{track.name}</span>
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
