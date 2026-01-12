-- Create table for favorite radio stations
CREATE TABLE public.favorite_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  station_uuid TEXT NOT NULL,
  station_name TEXT NOT NULL,
  station_url TEXT NOT NULL,
  station_favicon TEXT,
  station_country TEXT,
  station_bitrate INTEGER,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, station_uuid)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_stations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorites" 
ON public.favorite_stations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.favorite_stations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorite_stations 
FOR DELETE 
USING (auth.uid() = user_id);