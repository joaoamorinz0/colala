<div align="center">

# Colalá

**Descubra cafés, restaurantes, bares e experiências que combinam com o seu rolê.**

Um app mobile-first, curado por pessoas, para quem quer sair de casa sem passar uma hora decidindo aonde ir.

[Acessar o app](https://usecolala.com.br) · [Instagram @usecolala](https://instagram.com/usecolala)

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalável-D97757)

</div>

---

## Sobre o projeto

O Colalá nasceu de um problema comum: o grupo quer sair, ninguém decide, e a conversa morre no "tanto faz". O app reúne lugares e eventos com contexto de verdade (clima, propósito, o que o espaço oferece) para que a escolha seja rápida e certeira.

Hoje o foco está em **Brasília e Entorno**, com curadoria feita à mão e uma comunidade começando a contribuir.

## Funcionalidades

**Descoberta**

- Lugares organizados em categorias com subcategorias (cafeterias, restaurantes, bares, experiências e mais)
- Filtros pensados para o dia a dia: _work friendly_, _pet friendly_, Wi-Fi, pôr do sol e locais que recebem clube do livro
- Busca diversificada, que aceita combinações como "cafeteria pintura"
- Página de cada lugar com fotos, horários, contato, redes sociais e eventos que estão acontecendo ali

**Experiências e eventos**

- Aba de experiências com feiras, oficinas, eventos gastronômicos, de música e de arte
- Eventos únicos ou recorrentes (semanal, quinzenal, mensal), gratuitos ou pagos
- Seção **"Curadoria por"**: curadores parceiros (como o Mapas de Afeto) assinam os eventos que indicam, com identidade visual própria (cores e tipografia)

**Comunidade**

- Avaliações com nota, comentário, fotos e tags descritivas ("Aconchegante", "Ótimo pra trabalhar" e outras)
- Favoritos e lista de "quero ir"
- Perfil com bio, cidade, interesses e redes sociais (Instagram, TikTok e links livres), com controle de privacidade sobre o que aparece
- Sugestão de novos locais pelos usuários, que ficam pendentes até a aprovação manual

**Plataforma**

- PWA instalável, pensado primeiro para o celular
- Painel administrativo para locais, eventos e curadores
- Segurança por RLS (Row Level Security) em todas as tabelas do Supabase

## Estado atual

O Colalá está **no ar e em fase inicial de validação**.

| Indicador            | Hoje                                |
| -------------------- | ----------------------------------- |
| Usuários cadastrados | 23                                  |
| Locais publicados    | 37 (Brasília e Valparaíso de Goiás) |
| Categorias           | 11 principais, 23 subcategorias     |
| Eventos publicados   | 7                                   |
| Curadores parceiros  | 2                                   |

_Dados de novembro de 2026._

## Roadmap

- [x] Lançamento do app como PWA
- [x] Avaliações com fotos e tags
- [x] Eventos com curadoria de parceiros
- [x] Filtros por estilo de lugar e sugestão de locais pela comunidade
- [ ] Badges e coleções (categorias, regiões, quantidade de lugares, desafios especiais)
- [ ] Check-in por QR Code em lugares e eventos parceiros
- [ ] Mescla de home e busca em uma única tela "Discover"
- [ ] Filtros para locais que aceitam oficinas e clube do livro
- [ ] Rolês compartilhados, convites por link e divisão de despesas
- [ ] Publicação na Google Play Store
- [ ] Mais cidades

## Stack

| Camada           | Tecnologia                              |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 15 (App Router)                 |
| Linguagem        | TypeScript                              |
| Estilo           | Tailwind CSS v4 e shadcn/ui             |
| Backend          | Supabase (Postgres, Auth, Storage, RLS) |
| Dados no cliente | TanStack Query                          |
| Formulários      | React Hook Form e Zod                   |
| Ícones           | Lucide React                            |
| PWA              | @ducanh2912/next-pwa                    |
| Qualidade        | ESLint, Prettier, Husky e lint-staged   |
| Deploy           | Vercel                                  |

## Como rodar localmente

**Pré-requisitos:** Node.js 20 ou superior e um projeto no [Supabase](https://supabase.com).

```bash
# 1. Clone o repositório
git clone https://github.com/joaoamorinz0/colala.git
cd colala

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# preencha com as chaves do seu projeto Supabase

# 4. Rode em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Banco de dados

Os scripts SQL ficam na raiz do repositório e devem ser executados em ordem no SQL Editor do Supabase:

| Arquivo            | O que faz                    |
| ------------------ | ---------------------------- |
| `01_tables.sql`    | Tabelas                      |
| `02_indexes.sql`   | Índices                      |
| `03_functions.sql` | Funções                      |
| `04_triggers.sql`  | Triggers                     |
| `05_storage.sql`   | Buckets de storage           |
| `06_rls.sql`       | Políticas de segurança (RLS) |
| `07_seed.sql`      | Dados iniciais               |

### Validações

```bash
npm run lint
npm run format:check
npm run build
```

## Arquitetura

```
src/
  app/            Rotas, layouts do App Router e composição de páginas
  components/     Componentes compartilhados (ui, cards, layout, navigation, search, place)
  features/       Módulos por domínio de produto
  hooks/          Hooks reutilizáveis
  lib/            Clientes, helpers e integrações base
  services/       Camada de acesso a dados
  providers/      Providers client-side centralizados
  types/          Tipos globais
  utils/          Utilitários sem dependência de framework
  styles/         CSS global, tema e tokens
  constants/      Constantes compartilhadas
```

**Decisões principais**

- `src/app` fica fino: rotas compõem layouts e features, sem concentrar regra de negócio.
- Cada domínio de produto vive em `features/<domínio>`, o que permite crescer sem espalhar estado pelo app.
- Server Components por padrão; `"use client"` apenas quando há estado, contexto ou APIs do navegador.
- Chamadas ao Supabase passam por uma camada própria, e toda entrada de dados é validada com Zod.
- A segurança é garantida no banco: leitura pública onde faz sentido, escrita restrita por RLS e permissões de admin.

## Identidade visual

| Elemento | Valor     |
| -------- | --------- |
| Fundo    | `#F8F7F4` |
| Texto    | `#222222` |
| Destaque | `#D97757` |

## Contribuindo

Sugestões de lugares, eventos e melhorias são bem-vindas.

- **Quer indicar um lugar ou evento?** Use o formulário dentro do app.
- **Encontrou um bug ou tem uma ideia?** Abra uma [issue](https://github.com/joaoamorinz0/colala/issues).
- **Quer contribuir com código?** Abra um PR. O pre-commit roda `lint-staged` automaticamente; rode `npm run lint` e `npm run format:check` antes de enviar.
- **Organiza eventos ou curadoria?** Fale com a gente pelo [Instagram](https://instagram.com/usecolala).

## Autor

Feito por **João** ([@joaoamorinz0](https://github.com/joaoamorinz0)), com feedback de uma comunidade de pessoas que adoram sair de casa.
