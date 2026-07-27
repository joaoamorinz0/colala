-- Schema do Colalá para Supabase Postgres
-- Execute todo este script no SQL Editor do Supabase Dashboard

-- 1. Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Locais (Places)
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  city TEXT DEFAULT 'Maceió',
  neighborhood TEXT,
  address TEXT,
  price_level INT CHECK (price_level >= 1 AND price_level <= 4) DEFAULT 1,
  instagram TEXT,
  phone TEXT,
  website TEXT,
  cover_image TEXT,
  gallery JSONB,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  opening_hours TEXT,
  rating REAL,
  featured BOOLEAN DEFAULT false,
  work_friendly BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  wifi BOOLEAN DEFAULT false,
  sunset BOOLEAN DEFAULT false,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, place_id)
);

-- 6. Tabela de Avaliações (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, place_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- ÍNDICES DE PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_places_category_id ON public.places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_city ON public.places(city);
CREATE INDEX IF NOT EXISTS idx_places_status ON public.places(status);
CREATE INDEX IF NOT EXISTS idx_places_rating ON public.places(rating DESC);
CREATE INDEX IF NOT EXISTS idx_places_featured ON public.places(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_places_created_at ON public.places(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place_id ON public.favorites(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON public.reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- RLS (ROW LEVEL SECURITY)
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE PROFILES
CREATE POLICY "Perfis visíveis publicamente" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuário pode inserir próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuário pode atualizar próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuário pode deletar próprio perfil" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- POLÍTICAS DE CATEGORIAS
CREATE POLICY "Categorias visíveis publicamente" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin gerencia categorias" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- POLÍTICAS DE PLACES
CREATE POLICY "Locais publicados visíveis publicamente" ON public.places
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados criam locais" ON public.places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários editam próprios locais" ON public.places
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Usuários deletam próprios locais" ON public.places
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS DE FAVORITOS
CREATE POLICY "Usuário vê seus próprios favoritos" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere seus próprios favoritos" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário remove seus próprios favoritos" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS DE REVIEWS
CREATE POLICY "Reviews visíveis publicamente" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Usuários criam suas próprias reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários editam suas próprias reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam suas próprias reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGER PARA CRIAR PROFILE AUTOMÁTICO APÓS SIGNUP
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
