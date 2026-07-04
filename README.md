# Colalá

Colalá é um aplicativo mobile-first para descoberta de cafés, restaurantes, bares e experiências.

Este repositório começa como uma base de produção organizada, escalável e intencionalmente sem regras de negócio. A prioridade desta fase é arquitetura, consistência técnica e velocidade segura para futuras squads evoluírem o produto.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase
- React Hook Form
- Zod
- TanStack Query
- Lucide React
- ESLint
- Prettier
- Husky
- lint-staged

## Como executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para validações locais:

```bash
npm run lint
npm run format:check
npm run build
```

Crie um `.env.local` a partir do `.env.example` quando a integração com Supabase for ativada.

## Arquitetura

```txt
src/
  app/            Rotas, layouts do App Router e composição de páginas
  components/     Componentes compartilhados e sem regra de negócio
  features/       Módulos por domínio de produto
  hooks/          Hooks reutilizáveis e agnósticos de domínio
  lib/            Clientes, helpers e integrações base
  services/       Futura camada de acesso a dados e gateways
  providers/      Providers client-side centralizados
  types/          Tipos globais compartilhados
  utils/          Utilitários sem dependência de framework
  styles/         CSS global, tema e tokens
  constants/      Constantes compartilhadas
```

## Decisões arquiteturais

- `src/app` fica fino: rotas devem compor layouts e features, não concentrar regra de negócio.
- `features/*` reserva os limites de domínio desde o primeiro dia. Auth, home, busca, lugares, favoritos e perfil podem crescer sem espalhar estado e componentes específicos pelo app inteiro.
- `components/*` separa UI compartilhada por intenção: `ui`, `cards`, `layout`, `navigation`, `search` e `place`.
- Providers ficam em `src/providers` e são agregados por `AppProviders`, evitando que o layout raiz conheça detalhes de Query Client, tema ou Supabase.
- Supabase está configurado como infraestrutura, mas sem autenticação, banco, API routes ou chamadas reais.
- TanStack Query já nasce centralizado para padronizar cache, retry e stale time antes das primeiras integrações.
- `ThemeProvider` força modo claro por enquanto. A classe `.dark` e os tokens escuros existem para evolução futura sem refatoração visual.
- shadcn/ui está preparado via `components.json`, com aliases alinhados ao projeto e componentes base em `src/components/ui`.
- Tailwind CSS v4 concentra tokens globais em `src/styles/globals.css`, incluindo cores, espaçamento, radius e sombras.
- `@/` aponta para `src/`, reduzindo imports frágeis e facilitando reorganização interna.
- Layouts `MainLayout`, `AuthLayout` e `PublicLayout` existem como composição visual. Eles não fazem autenticação nem autorização nesta fase.

## Convenções

- Escrever componentes com props tipadas e exports explícitos.
- Manter componentes compartilhados livres de regra de negócio.
- Colocar lógica de domínio dentro de `features/<domain>`.
- Preferir Server Components por padrão e marcar `"use client"` apenas quando houver estado, contexto, browser APIs ou hooks client-side.
- Não criar chamadas a Supabase fora de uma camada própria quando a regra de negócio começar.
- Validar entrada de dados futura com Zod e integrar formulários via React Hook Form.
- Usar Lucide React para ícones de interface.
- Rodar lint e Prettier antes de abrir PR. O pre-commit executa `lint-staged`.

## Estado atual

O projeto contém apenas:

- Configuração inicial.
- Providers base.
- Layouts iniciais.
- Páginas placeholder.
- Componentes tipados e reutilizáveis.

Não contém:

- Regras de negócio.
- Autenticação.
- Banco de dados.
- APIs.
- Fluxos de produto implementados.
