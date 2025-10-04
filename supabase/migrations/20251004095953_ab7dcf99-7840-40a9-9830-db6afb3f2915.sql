-- Create enum for PPE status
CREATE TYPE ppe_status AS ENUM ('compliant', 'violation', 'partial');

-- Create enum for PPE types
CREATE TYPE ppe_type AS ENUM ('helmet', 'vest', 'gloves', 'mask', 'goggles', 'boots');

-- Create detections table
CREATE TABLE public.detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detection_results JSONB NOT NULL,
  overall_status ppe_status NOT NULL,
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;

-- RLS policies for detections
CREATE POLICY "Users can view their own detections"
  ON public.detections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own detections"
  ON public.detections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detections"
  ON public.detections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detections"
  ON public.detections FOR DELETE
  USING (auth.uid() = user_id);

-- Create violations table
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id UUID REFERENCES public.detections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  missing_ppe ppe_type NOT NULL,
  location TEXT,
  severity TEXT DEFAULT 'medium',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- RLS policies for violations
CREATE POLICY "Users can view their own violations"
  ON public.violations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create violations"
  ON public.violations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own violations"
  ON public.violations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create analytics summary table
CREATE TABLE public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_detections INTEGER DEFAULT 0,
  compliant_count INTEGER DEFAULT 0,
  violation_count INTEGER DEFAULT 0,
  partial_count INTEGER DEFAULT 0,
  avg_confidence DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics
CREATE POLICY "Users can view their own analytics"
  ON public.analytics_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their analytics"
  ON public.analytics_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their analytics"
  ON public.analytics_summary FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  confidence_threshold DECIMAL(5,2) DEFAULT 70.0,
  enabled_ppe_types JSONB DEFAULT '["helmet", "vest", "gloves", "mask", "goggles", "boots"]'::jsonb,
  auto_alert BOOLEAN DEFAULT TRUE,
  save_snapshots BOOLEAN DEFAULT TRUE,
  show_bboxes BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_detections_updated_at
  BEFORE UPDATE ON public.detections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for detection images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('detection-images', 'detection-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for detection images
CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'detection-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'detection-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'detection-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );