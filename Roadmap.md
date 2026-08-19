# Roadmap — Feedback da Stephanie (influenciadora)

> Origem: conversa com a Stephanie após ela testar o Colalá. Itens já
> implementados (atributos work_friendly/pet_friendly/wifi/accepts_book_club
>
> - filtro modal) foram removidos desta lista — ver commit correspondente.

## 🟢 Baixo esforço — próximos a atacar

### Subcategorias temáticas adicionais

Hoje já existe estrutura de subcategoria (Restaurantes > Italiana/Japonesa/
Brasileira/Árabe; Bares > Wine Bar/Pub/Rooftop; Passeios > Feiras/Trilhas/
Museus). Só falta popular subcategorias temáticas como "Cafeteria + arte",
"Cafeteria + pintura" etc., se fizer sentido para o catálogo atual.
**Sem trabalho de código — só cadastro via /admin/categories.**

### Outras redes sociais no perfil do local

Hoje só há campo para Instagram. Adicionar campo(s) para TikTok e/ou um
campo genérico "Outras redes" (label + link) na tabela `places` e no
formulário admin.
**Esforço: 1 coluna nova + ajuste de formulário e exibição.**

---

## 🟡 Médio esforço — depende de decisão de produto antes de codar

### Fotos e tags de atmosfera nas avaliações

Ex: usuário marcar a review como "Aconchegante", "Barulhento", "Bom pra
grupo" etc., além de poder anexar foto à avaliação.
**Precisa decidir:** lista fixa de tags ou tags livres? Quantas fotos por
review? Isso é a via de crowdsourcing mais confiável para os atributos
que hoje dependem de pesquisa manual (work_friendly, pet_friendly etc.).

### Filtro "aceita clube/oficina sem cobrar" vs "cobra"

Depende da feature de Experiências existir primeiro (ver abaixo) — hoje
não há distinção entre "local que recebe grupo de graça" e "local que
cobra pelo espaço/oficina".

---

## 🔴 Alto esforço — decisão de produto maior, não iniciar sem alinhar

### Aba de Experiências (feiras, oficinas, eventos, shows)

Diferente de "lugar fixo" — evento tem data/hora, pode ser recorrente ou
único. É um tipo de entidade novo no banco, não um ajuste em `places`.
**Decisão necessária:** isso vira uma tabela nova (`events`) com relação
opcional a `places`, ou fica fora do escopo do Colalá por enquanto?

### Locais de estadia (hospedagem)

Categoria de negócio bem diferente do que o Colalá cobre hoje (comer/
beber/passear). Também teria implicações de precificação, disponibilidade
por data, etc. — muito mais próximo de um Airbnb do que do app atual.
**Decisão necessária:** faz sentido pro Colalá, ou é produto separado?

### Atrair quem organiza experiências, não só quem consome

Não é uma feature técnica isolada — é uma mudança de posicionamento
(o Colalá também serve para organizadores divulgarem, não só para quem
busca). Depende da feature de Experiências existir primeiro.

### Mesclar Home + Search em "Discover" único

Redesenho de navegação e IA de descoberta (feed único em vez de duas
telas separadas). Alto risco de regressão se feito sem planejamento —
não deve ser feito via prompt solto, precisa de um plano de UX próprio.

---

## Itens já implementados (para referência)

- ✅ Badges de atributos: Work friendly, Pet friendly, Wi-Fi, Aceita
  clube do livro (places.work_friendly / pet_friendly / wifi /
  accepts_book_club)
- ✅ Filtro combinável (categoria + subcategoria + atributos) via modal
  de funil em /search
- ✅ Estrutura de subcategoria (parent_id em categories)
