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
  Coffee
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

const SOUND_TRACKS: SoundTrack[] = [
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    icon: <Music className="w-4 h-4" />,
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    category: 'lofi'
  },
  {
    id: 'lofi-study',
    name: 'Study Beats',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    category: 'lofi'
  },
  {
    id: 'rain',
    name: 'Rain Sounds',
    icon: <CloudRain className="w-4 h-4" />,
    url: 'https://rainymood.com/audio1112/0.m4a',
    category: 'nature'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    icon: <Waves className="w-4 h-4" />,
    url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3',
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    icon: <TreePine className="w-4 h-4" />,
    url: 'https://www.soundjay.com/nature/forest-ambient-1.mp3',
    category: 'nature'
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    icon: <Wind className="w-4 h-4" />,
    url: 'https://www.soundjay.com/misc/sounds/white-noise-01.mp3',
    category: 'ambient'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    icon: <Flame className="w-4 h-4" />,
    url: 'https://www.soundjay.com/nature/campfire-1.mp3',
    category: 'ambient'
  }
];

interface FocusMusicPlayerProps {
  isPomodoroRunning?: boolean;
  pomodoroMode?: 'focus' | 'shortBreak' | 'longBreak';
}

export const FocusMusicPlayer = ({ isPomodoroRunning, pomodoroMode }: FocusMusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SoundTrack>(SOUND_TRACKS[0]);
  const [autoSync, setAutoSync] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        console.log('Autoplay prevented');
      });
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
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
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
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
      case 'nature': return 'bg-success/20 text-success border-success/30';
      case 'ambient': return 'bg-accent/20 text-accent-foreground border-accent/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="gradient-card border shadow-soft hover-lift">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            Focus Music
          </div>
          {autoSync && isPomodoroRunning !== undefined && (
            <Badge variant="outline" className={cn(
              "text-xs",
              isPomodoroRunning && pomodoroMode === 'focus' 
                ? "bg-success/10 text-success border-success/30" 
                : "bg-muted"
            )}>
              {isPomodoroRunning && pomodoroMode === 'focus' ? '🎵 Synced' : '⏸ Synced'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio 
          ref={audioRef} 
          src={currentTrack.url} 
          loop 
          preload="none"
        />

        {/* Current Track Display */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          isPlaying ? "bg-primary/5 border-primary/20" : "bg-muted/30"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isPlaying ? "gradient-primary animate-pulse" : "bg-muted"
          )}>
            {currentTrack.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{currentTrack.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentTrack.category}</p>
          </div>
          {isPlaying && (
            <div className="flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{ 
                    height: `${12 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.1}s`
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
            className={cn(
              "w-14 h-14 rounded-full",
              isPlaying ? "gradient-success" : "gradient-primary"
            )}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
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
        <div className="flex items-center gap-3 px-2">
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="flex-1"
          />
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Track Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Sound
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SOUND_TRACKS.map((track) => (
              <Button
                key={track.id}
                variant="outline"
                size="sm"
                onClick={() => selectTrack(track)}
                className={cn(
                  "h-auto py-2 px-3 justify-start gap-2",
                  currentTrack.id === track.id && getCategoryColor(track.category)
                )}
              >
                {track.icon}
                <span className="text-xs truncate">{track.name}</span>
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
            className={cn("text-xs h-7", autoSync && "gradient-primary")}
          >
            {autoSync ? 'On' : 'Off'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
