# Painel Administrativo COLALÁ

Painel administrativo completo para gerenciar locais, categorias e uploads de imagens no Supabase.

## 🎯 Funcionalidades

### Locais (Places)
- ✅ **Listar locais** - Visualize todos os locais cadastrados em um tabela
- ✅ **Criar novo local** - Adicione um novo local com formulário completo
- ✅ **Editar local** - Modifique informações de um local existente
- ✅ **Deletar local** - Remova locais com confirmação
- ✅ **Upload de imagem** - Faça upload de imagem de capa para o Supabase Storage

### Categorias
- ✅ **Listar categorias** - Veja todas as categorias disponíveis
- ✅ **Criar categoria** - Adicione novas categorias com ícone (emoji)
- ✅ **Editar categoria** - Modifique categorias existentes
- ✅ **Deletar categoria** - Remova categorias (com validação)

### Segurança
- ✅ **Autenticação** - Rotas protegidas que redirecionam para login
- ✅ **Supabase Auth** - Integrado com autenticação Supabase

## 📁 Estrutura de Arquivos

```
src/
├── app/admin/                          # Rotas do painel admin
│   ├── page.tsx                        # Dashboard principal
│   ├── places/
│   │   ├── page.tsx                    # Listagem de locais
│   │   ├── new/page.tsx                # Criar novo local
│   │   └── [id]/edit/page.tsx          # Editar local
│   └── categories/page.tsx             # Gerenciar categorias
├── components/admin/                   # Componentes do admin
│   ├── admin-layout.tsx                # Layout com sidebar
│   ├── page-header.tsx                 # Header de página
│   ├── place-form.tsx                  # Formulário de lugares
│   ├── form-field.tsx                  # Campo de formulário
│   ├── loading-spinner.tsx             # Spinner de carregamento
│   └── index.ts                        # Exports
├── services/
│   └── admin.service.ts                # Serviços do admin (CRUD + Upload)
├── types/
│   └── category.ts                     # Tipo de categoria
└── middleware.ts                        # Middleware de autenticação
```

## 🚀 Como Usar

### 1. Acessar o Painel
- Navegue para `/admin`
- Você será redirecionado para login se não estiver autenticado
- Após fazer login, você terá acesso ao dashboard

### 2. Gerenciar Locais

#### Criar novo local:
1. Clique no botão "Novo Local" no dashboard ou na página de locais
2. Preencha o formulário com:
   - **Nome do Local** (obrigatório)
   - **Descrição**
   - **Cidade**
   - **Categoria** (seleção de dropdown)
   - **Nível de Preço** (1-4)
   - **Instagram**
   - **Imagem de Capa** (upload)
3. Clique em "Salvar Local"

#### Editar local:
1. Na listagem de locais, clique no ícone ✏️
2. Modifique os dados desejados
3. Clique em "Salvar Local"

#### Deletar local:
1. Na listagem de locais, clique no ícone 🗑️
2. Confirme a exclusão
3. O local será removido imediatamente

### 3. Gerenciar Categorias

#### Criar categoria:
1. Na página de categorias, clique em "Nova Categoria"
2. Preencha:
   - **Nome** (obrigatório)
   - **Descrição** (opcional)
   - **Ícone** (emoji, máx 2 caracteres)
3. Clique em "Adicionar"

#### Editar categoria:
1. Clique no ícone ✏️ da categoria
2. Edite os dados
3. Clique em "Salvar"

#### Deletar categoria:
1. Clique no ícone 🗑️ da categoria
2. Confirme a exclusão

### 4. Upload de Imagens
- As imagens são enviadas automaticamente para o Supabase Storage (bucket: `places`)
- URL pública é gerada automaticamente
- Máximo 5MB por imagem (recomendado)

## 🔧 Configuração do Supabase

### Tabelas Necessárias

#### Tabela: `places`
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  price_level INTEGER,
  instagram TEXT,
  cover_image TEXT,
  category_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### Tabela: `categories`
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Bucket

Crie um bucket chamado `places` no Supabase Storage:
1. Vá para o Supabase Dashboard
2. Clique em "Storage"
3. Crie novo bucket com nome: `places`
4. Configure para público ou privado conforme necessário

### Políticas de Acesso (RLS)

**Para Places:**
```sql
-- Ler: Público
CREATE POLICY "Public read access" ON places
  FOR SELECT USING (true);

-- Criar/Editar/Deletar: Apenas autenticados
CREATE POLICY "Authenticated users can insert" ON places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own places" ON places
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete own places" ON places
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 🔐 Segurança e Autenticação

### Proteção de Rotas

Todas as rotas `/admin/*` são protegidas por middleware:
- ✅ Verifica se o usuário está autenticado
- ✅ Redireciona para `/login` se não estiver
- ✅ Permite adicionar validação de role (admin) no futuro

### Implementar Roles de Admin (Opcional)

Se você quiser restringir apenas para administradores:

1. **No seu BD**, adicione coluna `role` na tabela de usuários
2. **No middleware** (`middleware.ts`), descomente e configure:

```typescript
const isAdmin = user.user_metadata?.role === 'admin';
if (!isAdmin) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

3. **Set na autenticação** quando criar usuário admin:
```typescript
supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'admin'
    }
  }
})
```

## 📦 Componentes Reutilizáveis

### AdminLayout
Layout principal com sidebar de navegação
```tsx
<AdminLayout>
  {/* Seu conteúdo aqui */}
</AdminLayout>
```

### PageHeader
Header de página com título e action opcional
```tsx
<PageHeader 
  title="Título"
  description="Descrição"
  action={<button>Ação</button>}
/>
```

### PlaceForm
Formulário completo para criar/editar locais
```tsx
<PlaceForm 
  initialData={place}
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

### FormField
Campo de formulário com label e validação
```tsx
<FormField
  label="Nome"
  name="name"
  value={value}
  onChange={handleChange}
  error={error}
/>
```

## 🛠️ Serviços Disponíveis

### Places
- `createPlace(client, place)` - Criar local
- `updatePlace(client, id, place)` - Editar local
- `deletePlace(client, id)` - Deletar local
- `getPlaceById(client, id)` - Buscar local por ID
- `getAllPlaces(client)` - Listar todos

### Categories
- `createCategory(client, category)` - Criar categoria
- `updateCategory(client, id, category)` - Editar categoria
- `deleteCategory(client, id)` - Deletar categoria
- `getCategoryById(client, id)` - Buscar categoria
- `getAllCategories(client)` - Listar todas

### Upload
- `uploadImage(client, file, bucket)` - Upload de imagem
- `deleteImage(client, filePath, bucket)` - Deletar imagem

## 🎨 Customização

### Cores e Tema
Todos os componentes usam Tailwind CSS. Para customizar:
1. Edite as classes Tailwind nos componentes
2. Ou customize via `tailwind.config.ts`

### Menu Lateral
Para adicionar novo item ao menu, edite `src/components/admin/admin-layout.tsx`:
```tsx
const adminMenuItems = [
  {
    label: 'Novo Item',
    href: '/admin/novo',
    icon: NewIcon,
  },
  // ...
];
```

## ⚠️ Troubleshooting

### Erro: "Supabase não configurado"
- Verifique variáveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Erro ao fazer upload de imagem
- Verifique se o bucket `places` existe no Storage
- Confirme as políticas de acesso RLS

### Usuário redirecionado para login
- Confirme se está autenticado no Supabase
- Verifique as políticas de RLS das tabelas

## 📚 Próximos Passos

Para melhorar ainda mais o painel:
- [ ] Adicionar paginação na listagem de locais
- [ ] Implementar busca/filtro por categoria
- [ ] Adicionar validação de formulário com Zod
- [ ] Implementar notificações de sucesso/erro
- [ ] Adicionar funcionalidade de bulk upload
- [ ] Histórico de alterações/audit log
- [ ] Export de dados (CSV/JSON)
- [ ] Dashboard com estatísticas

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
