## Colalá - Descubra Locais e Experiências ao Seu Redor
![Versão](https://img.shields.io/badge/Version-1.0.0-blue)
![Licença](https://img.shields.io/badge/License-MIT-green)
![Status de Construção](https://img.shields.io/badge/Build-Status-<http://buildstats.io/username/colala>-red)

Colalá é um aplicativo mobile-first para descoberta de cafés, restaurantes, bares e experiências. Com foco em uma experiência de usuário intuitiva e fácil de usar, o Colalá permite que você encontre e salve seus locais favoritos.

### Características
* Buscar locais por nome, localização ou categorias
* Favoritar locais para que possam ser encontrados facilmente posteriormente
* Editar seu perfil para que outros usuários possam vê-lo
* Ver a localização de um local diretamente a partir do card dele

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Yarn ou npm (gerenciador de pacotes)
- Uma conta no Supabase (para armazenamento de dados)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/username/colala.git

# Navegue até a pasta do projeto
cd colala

# Instale as dependências
yarn install

# Crie as pastas de build e public
yarn build

# Inicie o servidor de desenvolvimento
yarn dev
```

### Uso
Para buscar locais, você pode usar a barra de pesquisa no topo da página. Para favoritar locais, você pode clicar no ícone de coração ao lado do local desejado. Para editar seu perfil, você pode clicar no icone da sua foto google na navbar

```jsx
// Componente de busca
import { useState } from 'react';
import axios from 'axios';

function BuscaLocais() {
  const [locais, setLocais] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    axios.get(`https://exemple.com/busca?nome=${busca}`)
      .then(response => {
        setLocais(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [busca]);

  return (
    <div>
      <input type="text" value={busca} onChange={e => setBusca(e.target.value)} />
      {locais.map(local => (
        <div key={local.id}>{local.nome}</div>
      ))}
    </div>
  );
}
```

Colalá é licenciado sob a [Licença MIT](https://github.com/joaoamorinz0/colala/blob/master/LICENSE).
