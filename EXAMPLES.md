# 💻 Exemplos de Uso - Painel Administrativo

## Como Usar os Serviços Admin

### Exemplo 1: Criar um Local

```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { createPlace } from '@/services/admin.service';

const client = createSupabaseBrowserClient();

const novoLocal = await createPlace(client, {
  name: 'Restaurante XYZ',
  description: 'Melhor comida italiana da cidade',
  city: 'São Paulo',
  price_level: 3,
  instagram: '@restaurantexyz',
  cover_image: 'https://...imagem.jpg',
  category_id: 1,
});

console.log('Local criado:', novoLocal);
```

### Exemplo 2: Buscar Todos os Locais

```typescript
import { getAllPlaces } from '@/services/admin.service';

const places = await getAllPlaces(client);
console.log('Total de locais:', places.length);
places.forEach(place => {
  console.log(`- ${place.name} em ${place.city}`);
});
```

### Exemplo 3: Editar um Local

```typescript
import { updatePlace } from '@/services/admin.service';

const localAtualizado = await updatePlace(client, 'uuid-do-local', {
  name: 'Novo Nome',
  price_level: 4,
});

console.log('Local atualizado:', localAtualizado);
```

### Exemplo 4: Deletar um Local

```typescript
import { deletePlace } from '@/services/admin.service';

await deletePlace(client, 'uuid-do-local');
console.log('Local deletado com sucesso!');
```

### Exemplo 5: Trabalhar com Categorias

```typescript
import { 
  createCategory, 
  getAllCategories, 
  updateCategory,
  deleteCategory 
} from '@/services/admin.service';

// Criar
const categoria = await createCategory(client, {
  name: 'Restaurantes',
  description: 'Estabelecimentos de comida',
  icon: '🍴',
});

// Listar todas
const categorias = await getAllCategories(client);

// Atualizar
const atualizada = await updateCategory(client, categoria.id, {
  name: 'Bares e Restaurantes',
});

// Deletar
await deleteCategory(client, categoria.id);
```

### Exemplo 6: Upload de Imagem

```typescript
import { uploadImage } from '@/services/admin.service';

// Assumindo que você tem um input file
const inputFile = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = inputFile?.files?.[0];

if (file) {
  const imageUrl = await uploadImage(client, file, 'places');
  console.log('Imagem enviada:', imageUrl);
  
  // Agora você pode usar imageUrl ao criar/atualizar um local
  await createPlace(client, {
    name: 'Novo Local',
    cover_image: imageUrl,
    // ... outros campos
  });
}
```

### Exemplo 7: Deletar Imagem

```typescript
import { deleteImage } from '@/services/admin.service';

const filePath = 'timestamp-filename.jpg'; // Extrair do imageUrl
await deleteImage(client, filePath, 'places');
```

## Usando os Componentes

### Exemplo 1: PlaceForm

```tsx
import { PlaceForm } from '@/components/admin';
import { createPlace } from '@/services/admin.service';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export function MeuComponente() {
  const handleSubmit = async (data) => {
    const client = createSupabaseBrowserClient();
    await createPlace(client, data);
  };

  return <PlaceForm onSubmit={handleSubmit} />;
}
```

### Exemplo 2: Formulário Customizado

```tsx
import { FormField } from '@/components/admin';
import { useState } from 'react';

export function MeuFormulario() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  return (
    <FormField
      label="Nome do Local"
      value={name}
      onChange={(e) => setName(e.target.value)}
      error={error}
      placeholder="Digite o nome"
    />
  );
}
```

### Exemplo 3: Page Header

```tsx
import { PageHeader } from '@/components/admin';
import Link from 'next/link';

export function MinhaPage() {
  return (
    <PageHeader
      title="Minha Página"
      description="Descrição da página"
      action={
        <Link href="/novo">
          <button className="...">Novo</button>
        </Link>
      }
    />
  );
}
```

### Exemplo 4: Info Card

```tsx
import { InfoCard } from '@/components/admin';

export function MeuComponente() {
  return (
    <>
      <InfoCard
        type="success"
        title="Sucesso!"
        message="Local criado com sucesso"
      />
      <InfoCard
        type="warning"
        title="Atenção"
        message="Este é um formulário incompleto"
      />
      <InfoCard
        type="error"
        title="Erro"
        message="Falha ao carregar dados"
      />
    </>
  );
}
```

## Padrões de Uso

### Pattern 1: Hook Customizado para Lugar

```typescript
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { getAllPlaces, updatePlace, deletePlace } from '@/services/admin.service';
import type { Place } from '@/types/place';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error('Supabase não configurado');
      
      const data = await getAllPlaces(client);
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  };

  const deleteOne = async (id: string) => {
    const client = createSupabaseBrowserClient();
    if (!client) throw new Error('Supabase não configurado');
    
    await deletePlace(client, id);
    setPlaces(places.filter(p => p.id !== id));
  };

  return { places, loading, error, loadPlaces, deleteOne };
}

// Uso:
function MeuComponente() {
  const { places, loadPlaces } = usePlaces();

  useEffect(() => {
    loadPlaces();
  }, []);

  return <div>{/* ... */}</div>;
}
```

### Pattern 2: Validação de Formulário

```typescript
import { z } from 'zod';

const placeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  city: z.string().optional(),
  price_level: z.number().min(1).max(4).optional(),
  instagram: z.string().optional(),
});

type PlaceInput = z.infer<typeof placeSchema>;

function validarPlace(data: unknown) {
  try {
    return placeSchema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { errors: err.flatten() };
    }
  }
}
```

### Pattern 3: Carregamento com QueryClient

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllPlaces, createPlace } from '@/services/admin.service';

export function usePlacesQuery() {
  const query = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const client = createSupabaseBrowserClient();
      return getAllPlaces(client);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const client = createSupabaseBrowserClient();
      return createPlace(client, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  return { query, createMutation };
}
```

## Tratamento de Erros

### Exemplo 1: Try/Catch

```typescript
async function criarLocalComErro() {
  try {
    const client = createSupabaseBrowserClient();
    const lugar = await createPlace(client, {
      name: '',
      // ... erro: nome vazio
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
      showNotification({
        type: 'error',
        message: error.message,
      });
    }
  }
}
```

### Exemplo 2: Validação Prévia

```typescript
function validarDados(data) {
  const erros = {};

  if (!data.name?.trim()) {
    erros.name = 'Nome é obrigatório';
  }

  if (data.price_level && (data.price_level < 1 || data.price_level > 4)) {
    erros.price_level = 'Preço deve estar entre 1 e 4';
  }

  return Object.keys(erros).length > 0 ? erros : null;
}
```

## Navegação

### Exemplo: Redirect após criar local

```typescript
import { useRouter } from 'next/navigation';

export function CriarLocalPage() {
  const router = useRouter();

  const handleSubmit = async (data) => {
    const client = createSupabaseBrowserClient();
    const novoLocal = await createPlace(client, data);
    
    // Redirecionar para listagem
    router.push('/admin/places' as any);
  };

  return <PlaceForm onSubmit={handleSubmit} />;
}
```

## Dicas e Boas Práticas

1. **Sempre verificar se client existe**
   ```typescript
   const client = createSupabaseBrowserClient();
   if (!client) throw new Error('Supabase não configurado');
   ```

2. **Usar loading states**
   ```typescript
   {isLoading ? <LoadingSpinner /> : <Content />}
   ```

3. **Confirmar antes de deletar**
   ```typescript
   if (!confirm('Tem certeza?')) return;
   ```

4. **Tratar erros de forma amigável**
   ```typescript
   showNotification({
     type: 'error',
     message: 'Algo deu errado',
   });
   ```

5. **Validar na submissão do form**
   ```typescript
   const erros = validarDados(formData);
   if (erros) setFormErrors(erros);
   ```

---

Todos esses exemplos funcionam com a estrutura criada! 🎉
