import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Modelo padrão usado quando GROQ_MODEL não está definido.
 *
 * IMPORTANTE: "llama-2-7b" antigamente causava 404 e fazia o endpoint cair
 * em emptyIntent. Não use modelos legados de llama sem confirmar a conta.
 *
 * Lista de modelos disponíveis na sua org Groq (via GET /models):
 *   - openai/gpt-oss-20b      (default recomendado: rápido, JSON mode, gratuito)
 *   - openai/gpt-oss-120b
 *   - qwen/qwen3.8-27b        (ótimo em português)
 *   - qwen/qwen3.6-27b
 *   - groq/compound, groq/compound-mini (roteiam p/ llama-3.3-70b / llama-4-scout)
 *
 * ATENÇÃO: vários desses retornam 403 "blocked at the organization level"
 * até serem habilitados em https://console.groq.com/settings/limits.
 * Habilite o modelo lá OU defina GROQ_MODEL com o id exato na Edge Function
 * depois de habilitar. Enquanto não habilitar, a função cai no fallback.
 */
const DEFAULT_MODEL = "openai/gpt-oss-20b";

type SearchIntent = {
  category_slugs: string[];
  subcategory_slugs: string[];
  tag_slugs: string[];
  keywords: string[];
};

// Resposta esperada da API da Groq (chat completions). `choices` é opcional
// porque o body de erro também é JSON: { error: { message } }.
interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

// Contexto vindo do Supabase (categories / review_tags).
interface ContextCategory {
  slug?: string | null;
  name?: string | null;
}

interface ContextTag {
  slug?: string | null;
  name?: string | null;
}

const emptyIntent: SearchIntent = {
  category_slugs: [],
  subcategory_slugs: [],
  tag_slugs: [],
  keywords: [],
};

function isEmptyIntent(intent: SearchIntent): boolean {
  return (
    intent.category_slugs.length === 0 &&
    intent.subcategory_slugs.length === 0 &&
    intent.tag_slugs.length === 0 &&
    intent.keywords.length === 0
  );
}

function normalizeSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function safeJsonFromResponse(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object")
      return parsed as Record<string, unknown>;
  } catch {
    // fallback below
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === "object")
        return parsed as Record<string, unknown>;
    } catch {
      // ignore and return empty object
    }
  }

  return {} as Record<string, unknown>;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function fallbackIntentFromQuery(query: string): SearchIntent {
  const normalized = query.toLowerCase();
  const aliasSource = stripAccents(normalized);
  const keywords = new Set<string>();

  const aliasMap: Array<[string, string[]]> = [
    [
      "trabalhar",
      [
        "trabalhar",
        "trabalho",
        "workspace",
        "cowork",
        "estudar",
        "wifi",
        "mesa",
        "cadeira",
      ],
    ],
    [
      "cafeteria",
      ["café", "cafe", "cafeteria", "coffee", "coffee shop", "cafezinho"],
    ],
    ["rooftop", ["rooftop", "terraco", "terraço", "vista", "topo", "telhado"]],
    [
      "familia",
      ["familia", "família", "criança", "criancas", "kids", "infantil"],
    ],
    ["bar", ["bar", "boteco", "drink", "cerveja", "coquetel", "night"]],
    ["pet", ["pet", "cachorro", "gato", "animal", "pet friendly"]],
    ["wifi", ["wifi", "wi-fi", "internet", "conexao"]],
    ["musica", ["musica", "música", "live", "show", "jazz", "samba"]],
    ["casal", ["casal", "date", "namoro", "romantico", "romântico"]],
    [
      "estudar",
      ["estudar", "estudo", "biblioteca", "silencioso", "concentração"],
    ],
    [
      "esporte",
      ["esporte", "esportes", "futebol", "futsal", "quadra", "academia"],
    ],
  ];

  for (const [key, values] of aliasMap) {
    if (aliasSource.includes(stripAccents(key))) {
      for (const value of values) {
        keywords.add(value);
      }
    }
  }

  const extraTokens = normalized
    .replace(/[!?.,;:()\-]/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 2 &&
        ![
          "pra",
          "para",
          "com",
          "sem",
          "uma",
          "um",
          "do",
          "da",
          "de",
          "e",
          "a",
          "o",
        ].includes(token),
    );

  for (const token of extraTokens) {
    keywords.add(token);
  }

  return {
    category_slugs: [],
    subcategory_slugs: [],
    tag_slugs: [],
    keywords: Array.from(keywords).slice(0, 12),
  };
}

async function fetchContextFromSupabase(): Promise<{
  categories: ContextCategory[];
  tags: ContextTag[];
}> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      `[parse-search-query] context Supabase incompleto (SUPABASE_URL=${Boolean(supabaseUrl)}, SB_SERVICE_ROLE_KEY=${Boolean(serviceRoleKey)}). Seguindo sem categorias/tags.`,
    );
    return { categories: [], tags: [] };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [categoriesResult, tagsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, parent_id, name")
      .order("name"),
    supabase.from("review_tags").select("id, slug, name").order("name"),
  ]);

  if (categoriesResult.error) {
    console.error(
      "[parse-search-query] erro ao buscar categories:",
      categoriesResult.error.message,
    );
  }
  if (tagsResult.error) {
    console.error(
      "[parse-search-query] erro ao buscar review_tags:",
      tagsResult.error.message,
    );
  }

  const categories = (categoriesResult.data ?? []) as ContextCategory[];
  const tags = (tagsResult.data ?? []) as ContextTag[];

  return { categories, tags };
}

function buildPrompt(
  query: string,
  categories: ContextCategory[],
  tags: ContextTag[],
) {
  const categoryList = categories
    .map((category) => `- ${category.slug ?? category.name ?? "unknown"}`)
    .join("\n");

  const tagList = tags
    .map((tag) => `- ${tag.slug ?? tag.name ?? "unknown"}`)
    .join("\n");

  return `
Você é um classificador de intenção de busca para um app de lugares e experiências.

Objetivo: extrair filtros úteis de uma pesquisa em linguagem natural.

Regra importante: responda SOMENTE em JSON puro, sem markdown, sem explicação, sem comentários.
Formato exato:
{
  "category_slugs": ["string"],
  "subcategory_slugs": ["string"],
  "tag_slugs": ["string"],
  "keywords": ["string"]
}

Categorias disponíveis:
${categoryList || "- nenhuma categoria disponível"}

Tags disponíveis:
${tagList || "- nenhuma tag disponível"}

Busca do usuário:
"${query}"

Diretrizes:
- Use apenas slugs existentes da categoria/tag.
- Se a busca não menciona categoria, use []
- Se a busca não menciona subcategoria, use []
- Se a busca não menciona tags, use []
- keywords deve conter termos relevantes para a busca (ex.: 'trabalhar', 'familia', 'rooftop', 'estudo', 'pet friendly')
- Evite palavras genéricas e duplicatas.
- Não adicione campos extras.
- Responda corretamente mesmo com buscas curtas.
  `.trim();
}

/**
 * Chama a Groq e retorna a intenção normalizada.
 * Retorna `null` (em vez de emptyIntent) quando não há chave, o modelo
 * falha ou a resposta é inválida, para que o chamador aplique o fallback
 * e registre o erro real em vez de mascarar com vazio.
 */
async function askGroq(
  query: string,
  categories: ContextCategory[],
  tags: ContextTag[],
): Promise<SearchIntent | null> {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  if (!groqApiKey) {
    console.error(
      "[parse-search-query] GROQ_API_KEY ausente. Aplicando fallback.",
    );
    return null;
  }

  const model = Deno.env.get("GROQ_MODEL") || DEFAULT_MODEL;

  const payload = {
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você extrai filtros de busca de lugares/experiências em JSON puro e sem texto extra.",
      },
      {
        role: "user",
        content: buildPrompt(query, categories, tags),
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error(
      "[parse-search-query] falha de rede ao chamar Groq:",
      networkError,
    );
    return null;
  }

  if (!response.ok) {
    // Loga o motivo real ANTES de qualquer retorno.
    const bodyText = await response.text().catch(() => "");
    let groqError: string = bodyText;
    try {
      const errJson = JSON.parse(bodyText) as GroqResponse;
      groqError = errJson?.error?.message ?? bodyText;
    } catch {
      groqError = bodyText;
    }
    console.error(
      `[parse-search-query] Groq HTTP ${response.status} ${response.statusText} (model=${model}): ${groqError}`,
    );
    return null;
  }

  let result: GroqResponse;
  try {
    result = (await response.json()) as GroqResponse;
  } catch (jsonError) {
    console.error(
      "[parse-search-query] Groq retornou JSON inválido:",
      jsonError,
    );
    return null;
  }

  const rawContent = result?.choices?.[0]?.message?.content ?? "{}";
  const parsed = safeJsonFromResponse(rawContent);

  const normalized: SearchIntent = {
    category_slugs: normalizeSlugs(parsed.category_slugs),
    subcategory_slugs: normalizeSlugs(parsed.subcategory_slugs),
    tag_slugs: normalizeSlugs(parsed.tag_slugs),
    keywords: normalizeSlugs(parsed.keywords),
  };

  if (!isEmptyIntent(normalized)) {
    return normalized;
  }

  console.warn(
    "[parse-search-query] Groq respondeu intenção vazia; aplicando fallback.",
  );
  return null;
}

Deno.serve(async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  let query = "";

  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query || query.length < 2) {
      return new Response(JSON.stringify(emptyIntent), {
        status: 200,
        headers,
      });
    }

    const { categories, tags } = await fetchContextFromSupabase();

    const groqIntent = await askGroq(query, categories, tags);

    // Se a Groq falhou, caiu em erro real ou devolveu vazio, usa o fallback.
    // Nunca devolvemos emptyIntent silenciosamente quando há uma query válida.
    const intent =
      groqIntent && !isEmptyIntent(groqIntent)
        ? groqIntent
        : fallbackIntentFromQuery(query);

    return new Response(JSON.stringify(intent), { status: 200, headers });
  } catch (error) {
    // Nunca devolve emptyIntent mudo: loga o motivo e aplica o fallback.
    console.error("[parse-search-query] erro no endpoint:", error);

    const fallback = fallbackIntentFromQuery(query);
    const debug = Deno.env.get("DEBUG") === "true";

    const payload = debug
      ? { ...fallback, _debug: { error: String(error), query } }
      : fallback;

    return new Response(JSON.stringify(payload), { status: 200, headers });
  }
});
