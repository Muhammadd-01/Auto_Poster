-- Supabase Schema for LinkedIn Auto Publisher

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Karachi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: linkedin_connections
CREATE TABLE linkedin_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  linkedin_member_id TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One connection per user for MVP
);

-- Table: media
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: posts
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caption TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, PROCESSING, PUBLISHED, FAILED, CANCELLED
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Karachi',
  linkedin_post_id TEXT,
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: post_media (Many-to-many relationship)
CREATE TABLE post_media (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, media_id)
);

-- Table: notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, error, warning
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- LinkedIn Connections Policies
CREATE POLICY "Users can view own connection" ON linkedin_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own connection" ON linkedin_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connection" ON linkedin_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own connection" ON linkedin_connections FOR DELETE USING (auth.uid() = user_id);

-- Media Policies
CREATE POLICY "Users can view own media" ON media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own media" ON media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON media FOR DELETE USING (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Post Media Policies
CREATE POLICY "Users can view own post media" ON post_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own post media" ON post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own post media" ON post_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Set up Realtime for tables (Optional but useful for UI updates)
ALTER PUBLICATION supabase_realtime ADD TABLE posts, notifications;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
