import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward,
  Radio,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  codec: string;
  bitrate: number;
}

interface Category {
  id: string;
  label: string;
  color: string;
  searchTags: string[];
}

const CATEGORIES: Category[] = [
  { 
    id: 'lofi', 
    label: 'Lo-Fi', 
    color: 'from-purple-500 to-pink-500',
    searchTags: ['lofi', 'lo-fi', 'chillhop', 'chill beats', 'study']
  },
  { 
    id: 'jazz', 
    label: 'Jazz', 
    color: 'from-amber-500 to-orange-500',
    searchTags: ['jazz', 'smooth jazz', 'jazz cafe', 'bossa nova']
  },
  { 
    id: 'classical', 
    label: 'Classical', 
    color: 'from-blue-500 to-cyan-500',
    searchTags: ['classical', 'piano', 'orchestra', 'symphony']
  },
  { 
    id: 'ambient', 
    label: 'Ambient', 
    color: 'from-green-500 to-emerald-500',
    searchTags: ['ambient', 'relaxation', 'meditation', 'sleep', 'nature sounds']
  },
  { 
    id: 'electronic', 
    label: 'Electronic', 
    color: 'from-indigo-500 to-violet-500',
    searchTags: ['electronic', 'chillout', 'downtempo', 'synthwave']
  }
];

// Radio Browser API - completely free, no API key needed
const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

interface FocusMusicPlayerProps {
  isPomodoroRunning?: boolean;
  pomodoroMode?: 'focus' | 'shortBreak' | 'longBreak';
}

export const FocusMusicPlayer = ({ isPomodoroRunning, pomodoroMode }: FocusMusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStations, setIsFetchingStations] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('lofi');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch stations from Radio Browser API
  const fetchStations = useCallback(async (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    setIsFetchingStations(true);
    setError(null);

    try {
      // Try multiple search tags to get more variety
      const allStations: RadioStation[] = [];
      
      for (const tag of category.searchTags.slice(0, 2)) {
        const response = await fetch(
          `${RADIO_BROWSER_API}/stations/bytag/${encodeURIComponent(tag)}?limit=10&order=clickcount&reverse=true&hidebroken=true`,
          {
            headers: {
              'User-Agent': 'StudyDashboard/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data: RadioStation[] = await response.json();
          allStations.push(...data);
        }
      }

      // Remove duplicates and filter valid stations
      const uniqueStations = allStations
        .filter((station, index, self) => 
          index === self.findIndex(s => s.stationuuid === station.stationuuid) &&
          station.url_resolved &&
          station.name
        )
        .slice(0, 15);

      if (uniqueStations.length > 0) {
        setStations(uniqueStations);
        if (!currentStation || !uniqueStations.find(s => s.stationuuid === currentStation.stationuuid)) {
          setCurrentStation(uniqueStations[0]);
        }
      } else {
        setError('No stations found - try another category');
      }
    } catch (err) {
      console.error('Failed to fetch stations:', err);
      setError('Failed to load stations');
    } finally {
      setIsFetchingStations(false);
    }
  }, [currentStation]);

  // Fetch stations when category changes
  useEffect(() => {
    if (isOnline) {
      fetchStations(selectedCategory);
    }
  }, [selectedCategory, isOnline, fetchStations]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Station unavailable - try another');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
      setIsPlaying(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Auto-play/pause based on Pomodoro timer state
  useEffect(() => {
    if (autoSync && isPomodoroRunning !== undefined && currentStation) {
      if (isPomodoroRunning && pomodoroMode === 'focus') {
        handlePlay();
      } else if (!isPomodoroRunning || pomodoroMode !== 'focus') {
        handlePause();
      }
    }
  }, [isPomodoroRunning, pomodoroMode, autoSync, currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlay = async () => {
    if (!audioRef.current || !currentStation) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const streamUrl = currentStation.url_resolved || currentStation.url;
      
      if (audioRef.current.src !== streamUrl) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      
      // Report click to Radio Browser API (helps rank popular stations)
      fetch(`${RADIO_BROWSER_API}/url/${currentStation.stationuuid}`, { method: 'GET' }).catch(() => {});
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

  const selectStation = (station: RadioStation) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlaying(false);
    setCurrentStation(station);
    setError(null);
    
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          const streamUrl = station.url_resolved || station.url;
          audioRef.current.src = streamUrl;
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

  const nextStation = () => {
    if (stations.length === 0) return;
    
    const currentIndex = currentStation 
      ? stations.findIndex(s => s.stationuuid === currentStation.stationuuid)
      : -1;
    const nextIndex = (currentIndex + 1) % stations.length;
    selectStation(stations[nextIndex]);
  };

  const getCategoryGradient = (categoryId: string) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? `bg-gradient-to-r ${cat.color}` : '';
  };

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              currentCategory ? `bg-gradient-to-br ${currentCategory.color}` : "bg-gradient-to-br from-purple-500 to-pink-500"
            )}>
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span>Focus Radio</span>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {autoSync && isPomodoroRunning !== undefined && isOnline && (
              <Badge variant="outline" className={cn(
                "text-xs",
                isPomodoroRunning && pomodoroMode === 'focus' 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" 
                  : "bg-muted"
              )}>
                {isPomodoroRunning && pomodoroMode === 'focus' ? '🎵 Synced' : '⏸ Ready'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Station Display */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          isPlaying ? "bg-primary/5 border-primary/20" : "bg-muted/30"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all overflow-hidden",
            isPlaying ? `bg-gradient-to-br ${currentCategory?.color || 'from-purple-500 to-pink-500'}` : "bg-muted"
          )}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : currentStation?.favicon ? (
              <img 
                src={currentStation.favicon} 
                alt="" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Music className={cn("w-4 h-4", isPlaying && "text-white")} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {currentStation?.name || 'Select a station'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentStation?.country || 'Live radio stream'}
              {currentStation?.bitrate ? ` • ${currentStation.bitrate}kbps` : ''}
            </p>
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
            disabled={isLoading || !currentStation || !isOnline}
            className={cn(
              "w-12 h-12 rounded-full transition-all",
              isPlaying 
                ? "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                : `bg-gradient-to-br ${currentCategory?.color || 'from-purple-500 to-pink-500'}`
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
            onClick={nextStation}
            disabled={stations.length === 0}
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Genre
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchStations(selectedCategory)}
              disabled={isFetchingStations || !isOnline}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={cn("w-3 h-3 mr-1", isFetchingStations && "animate-spin")} />
              Refresh
            </Button>
          </div>
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

        {/* Station List */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Stations {stations.length > 0 && `(${stations.length})`}
          </p>
          
          {isFetchingStations ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading stations...</span>
            </div>
          ) : stations.length > 0 ? (
            <ScrollArea className="h-40">
              <div className="space-y-1.5 pr-3">
                {stations.map((station) => (
                  <Button
                    key={station.stationuuid}
                    variant="outline"
                    size="sm"
                    onClick={() => selectStation(station)}
                    className={cn(
                      "w-full h-auto py-2 px-3 justify-start gap-2 text-left",
                      currentStation?.stationuuid === station.stationuuid && 
                        `bg-gradient-to-r ${currentCategory?.color} text-white border-0`
                    )}
                  >
                    <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                      {station.favicon ? (
                        <img 
                          src={station.favicon} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Radio className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{station.name}</p>
                      <p className={cn(
                        "text-[10px] truncate",
                        currentStation?.stationuuid === station.stationuuid 
                          ? "text-white/70" 
                          : "text-muted-foreground"
                      )}>
                        {station.country} {station.bitrate ? `• ${station.bitrate}kbps` : ''}
                      </p>
                    </div>
                    {currentStation?.stationuuid === station.stationuuid && isPlaying && (
                      <Wifi className="w-3 h-3 animate-pulse" />
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              {error || (isOnline ? 'No stations available' : 'Connect to internet to load stations')}
            </div>
          )}
        </div>

        {/* API Attribution */}
        <p className="text-[10px] text-center text-muted-foreground/60">
          Powered by Radio Browser API • Free & Open Source
        </p>
      </CardContent>
    </Card>
  );
};
