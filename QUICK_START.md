# 🚀 Guia Rápido - Painel Administrativo COLALÁ

## Iniciar em 5 Minutos

### 1️⃣ **Configurar Supabase**

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Cole o script completo de [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
4. Execute o script
5. Crie o bucket `places` em Storage (Public)

### 2️⃣ **Testar o Painel**

```bash
npm run dev
```

Acesse: `http://localhost:3000/admin`

### 3️⃣ **Criar Primeira Categoria**

1. Faça login em `/login`
2. Vá para `/admin/categories`
3. Clique "Nova Categoria"
4. Preencha: Nome, Descrição (opcional), Ícone (emoji)
5. Clique "Adicionar"

### 4️⃣ **Criar Primeiro Local**

1. Vá para `/admin/places`
2. Clique "Novo Local"
3. Preencha todos os campos
4. Faça upload de uma imagem
5. Clique "Salvar Local"

## ✨ Funcionalidades Principais

| Página | Funcionalidades |
|--------|-----------------|
| `/admin` | Dashboard com atalhos rápidos |
| `/admin/places` | Listar, criar, editar, deletar locais |
| `/admin/places/new` | Formulário para novo local |
| `/admin/places/[id]/edit` | Editar local existente |
| `/admin/categories` | Gerenciar categorias |

## 📋 Campos de Local

```
✓ Nome (obrigatório)
✓ Descrição
✓ Cidade
✓ Categoria (dropdown)
✓ Nível de Preço (1-4)
✓ Instagram (@usuario)
✓ Imagem de Capa (upload)
```

## 🔐 Autenticação

- Todas as rotas `/admin` requerem autenticação
- Usuários não autenticados são redirecionados para `/login`
- Integrado com Supabase Auth

## 🎨 Estrutura Visual

```
┌─────────────────────────────────────┐
│  COLALÁ Admin                       │
├──────────────┬──────────────────────┤
│              │                      │
│  Sidebar     │  Conteúdo Principal  │
│  - Dashboard │  (Page)              │
│  - Locais    │                      │
│  - Categorias│                      │
│              │                      │
└──────────────┴──────────────────────┘
```

## 🛠️ Stack Técnico

- **Framework**: Next.js 15
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS
- **Banco**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Ícones**: Lucide React

## 📂 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `src/app/admin/` | Páginas do painel |
| `src/components/admin/` | Componentes reutilizáveis |
| `src/services/admin.service.ts` | Lógica de CRUD |
| `src/types/category.ts` | Tipo de categoria |
| `middleware.ts` | Proteção de rotas |
| `SUPABASE_SETUP.md` | Configuração Supabase |
| `ADMIN_PANEL_README.md` | Documentação completa |

## 💡 Dicas

1. **Imagens**: Use JPEG ou PNG, máximo 5MB
2. **Ícones**: Use emojis simples (🍕, 🏖️, etc)
3. **Preço**: 1 = Barato, 4 = Caro
4. **Categorias**: Crie antes de adicionar locais

## 🐛 Problemas Comuns

### "Supabase não configurado"
→ Verifique `.env.local` com as chaves corretas

### "Erro ao fazer upload"
→ Confirme se bucket `places` existe e é público

### "Redirecionado para login"
→ Faça login primeiro em `/login`

### "Tabela não existe"
→ Execute o script SQL de [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🎯 Próximos Passos

1. ✅ Configure o Supabase
2. ✅ Crie as categorias iniciais
3. ✅ Adicione alguns locais de teste
4. ✅ Teste o upload de imagens
5. ✅ Teste edição e deleção
6. ⭐ Customize conforme necessário

## 📞 Suporte

- 📖 [Documentação Completa](./ADMIN_PANEL_README.md)
- 🗄️ [Setup Supabase](./SUPABASE_SETUP.md)
- 🌐 [Docs Supabase](https://supabase.com/docs)
- ⚡ [Docs Next.js](https://nextjs.org/docs)

---

**Pronto para começar?** Execute `npm run dev` e acesse `/admin` 🚀
