import type { Event } from "@/types/event";

const WEEKDAY_NAMES = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
] as const;

const MONTH_SHORT = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

/**
 * Converte "YYYY-MM-DD" em Date local (meio-dia) para evitar deslocamento
 * de fuso ao formatar.
 */
export function parseEventDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0);
}

/** Formata "YYYY-MM-DD" como "23 AGO". */
export function formatDayMonth(dateStr: string): {
  day: string;
  month: string;
} {
  const date = parseEventDate(dateStr);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: MONTH_SHORT[date.getMonth()],
  };
}

/** Formata "HH:MM:SS" ou "HH:MM" como "HH:MM". */
export function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

/**
 * Rótulo legível da data do evento.
 * Ex.: "23 de ago. de 2026 · 19:00" ou com término "23–24 ago 2026".
 */
export function formatEventDateLabel(event: Event): string {
  const start = parseEventDate(event.start_date);
  const end = event.end_date ? parseEventDate(event.end_date) : null;

  const time = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);

  const sameYear = !end || end.getFullYear() === start.getFullYear();
  const sameMonth = sameYear && end && end.getMonth() === start.getMonth();

  const fmt = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  let label = fmt.format(start);

  if (end) {
    const endFmt = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      ...(sameMonth ? {} : { month: "short" }),
      ...(sameYear ? {} : { year: "numeric" }),
    });
    label += ` – ${endFmt.format(end)}`;
    if (!sameYear) label += ` ${start.getFullYear()}`;
  }

  if (time) {
    label += ` · ${time}`;
    if (endTime) label += ` – ${endTime}`;
  }

  return label;
}

/** Descrição legível do padrão de recorrência. Ex.: "Toda quinta-feira". */
export function formatRecurrenceLabel(event: Event): string {
  if (!event.is_recurring) return "";

  switch (event.recurrence_frequency) {
    case "weekly":
      return event.recurrence_day_of_week !== null
        ? `Toda ${WEEKDAY_NAMES[event.recurrence_day_of_week]}`
        : "Semanal";
    case "biweekly":
      return event.recurrence_day_of_week !== null
        ? `Quinzenal (${WEEKDAY_NAMES[event.recurrence_day_of_week]})`
        : "Quinzenal";
    case "monthly":
      return event.recurrence_day_of_month !== null
        ? `Todo dia ${event.recurrence_day_of_month} do mês`
        : "Mensal";
    default:
      return "Recorrente";
  }
}

/** Local legível: nome do place vinculado ou endereço livre. */
export function getEventLocationLabel(event: Event): string {
  if (event.place?.name) return event.place.name;
  return [event.location_name, event.city].filter(Boolean).join(" • ");
}

/** Preço formatado ou "Gratuito". */
export function getEventPriceLabel(event: Event): string {
  if (event.is_free || event.price === null || event.price === 0) {
    return "Gratuito";
  }
  return event.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
