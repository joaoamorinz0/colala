# Guia de Configuração Supabase - Painel Administrativo

## ✅ Checklist de Configuração

### 1. Banco de Dados - Tabelas

- [ ] **Tabela: `categories`**
  - Executar o SQL abaixo:
  ```sql
  CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Índice para melhor performance
  CREATE INDEX idx_categories_name ON categories(name);
  ```

- [ ] **Tabela: `places` (se ainda não existir)**
  - Executar o SQL abaixo:
  ```sql
  CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    city TEXT,
    price_level INT,
    instagram TEXT,
    cover_image TEXT,
    category_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  -- Índices para melhor performance
  CREATE INDEX idx_places_category_id ON places(category_id);
  CREATE INDEX idx_places_city ON places(city);
  CREATE INDEX idx_places_created_at ON places(created_at DESC);
  ```

### 2. Storage - Buckets

- [ ] **Criar bucket: `places`**
  1. Abra Supabase Dashboard → Storage
  2. Clique em "New Bucket"
  3. Nome: `places`
  4. Selecione "Public"
  5. Clique "Create bucket"

### 3. Row Level Security (RLS)

#### Para tabela `categories`:

- [ ] **Enable RLS**
  ```sql
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **Policy - Leitura Pública**
  ```sql
  CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (true);
  ```

- [ ] **Policy - Criar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can create categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  ```

- [ ] **Policy - Atualizar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

- [ ] **Policy - Deletar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');
  ```

#### Para tabela `places`:

- [ ] **Enable RLS**
  ```sql
  ALTER TABLE places ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **Policy - Leitura Pública**
  ```sql
  CREATE POLICY "Public read places" ON places
    FOR SELECT USING (true);
  ```

- [ ] **Policy - Criar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can create places" ON places
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  ```

- [ ] **Policy - Atualizar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can update places" ON places
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

- [ ] **Policy - Deletar (Autenticado)**
  ```sql
  CREATE POLICY "Authenticated users can delete places" ON places
    FOR DELETE USING (auth.role() = 'authenticated');
  ```

### 4. Storage - Políticas

- [ ] **Storage Policy - Leitura Pública (bucket: places)**
  ```sql
  -- Abra Supabase Dashboard → Storage → places → Policies
  -- Crie: SELECT
  -- Role: Public
  -- Condition: ((bucket_id = 'places'::text) AND (auth.role() = 'anon'::text) OR (auth.role() = 'authenticated'::text))
  ```

- [ ] **Storage Policy - Upload (Autenticado)**
  ```sql
  -- Crie: INSERT
  -- Role: Authenticated
  -- Condition: (bucket_id = 'places'::text) AND (auth.role() = 'authenticated'::text)
  ```

- [ ] **Storage Policy - Deletar (Autenticado)**
  ```sql
  -- Crie: DELETE
  -- Role: Authenticated
  -- Condition: (bucket_id = 'places'::text) AND (auth.role() = 'authenticated'::text)
  ```

## 🔑 Variáveis de Ambiente

- [ ] Confirme que as seguintes variáveis estão em `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
  ```

## 🧪 Testes Recomendados

Após configurar, teste:

1. **Criar Categoria**
   - [ ] Faça login
   - [ ] Vá para `/admin/categories`
   - [ ] Crie uma nova categoria

2. **Criar Local**
   - [ ] Vá para `/admin/places/new`
   - [ ] Preencha o formulário
   - [ ] Faça upload de uma imagem
   - [ ] Verifique se aparece na listagem

3. **Editar Local**
   - [ ] Clique em editar em um local
   - [ ] Modifique informações
   - [ ] Verifique as mudanças

4. **Deletar Local**
   - [ ] Clique em deletar
   - [ ] Confirme
   - [ ] Verifique remoção

## ⚡ Dicas de Performance

1. **Índices**: Já foram criados nas tabelas
2. **Cache**: Considere adicionar cache com React Query
3. **Paginação**: Implemente paginação para grandes listas
4. **Lazy Loading**: Use para imagens grandes

## 🆘 Troubleshooting

### Erro: "RLS policy denied"
- Verifique se as políticas estão criadas corretamente
- Confirme se o usuário está autenticado

### Erro: "Table does not exist"
- Execute os scripts SQL de criação das tabelas
- Verifique o nome exato da tabela

### Upload de imagem falha
- Verifique se o bucket `places` existe
- Confirme as políticas de storage

### Usuário não consegue acessar admin
- Verifique se está logado
- Confirme o middleware está ativo

## 📝 Script SQL Completo

Copie e cole tudo isso no SQL Editor do Supabase para configurar tudo de uma vez:

```sql
-- 1. Criar tabelas
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  price_level INT,
  instagram TEXT,
  cover_image TEXT,
  category_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 2. Criar índices
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_city ON places(city);
CREATE INDEX idx_places_created_at ON places(created_at DESC);

-- 3. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para categories
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Políticas para places
CREATE POLICY "Public read places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create places" ON places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update places" ON places
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete places" ON places
  FOR DELETE USING (auth.role() = 'authenticated');
```

## ✨ Pronto!

Após completar este checklist, seu painel administrativo estará totalmente funcional. 🎉
