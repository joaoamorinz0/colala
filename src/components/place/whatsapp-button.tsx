import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type WhatsAppButtonProps = {
  phone: string;
  className?: string;
  /** Label exibido no botão. */
  label?: string;
};

/**
 * Monta o link do WhatsApp a partir de um número de telefone.
 * Para números brasileiros (10-11 dígitos) adiciona o prefixo 55.
 */
function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12) {
    return `https://wa.me/${digits}`;
  }
  if (digits.length >= 10) {
    return `https://wa.me/55${digits}`;
  }
  return `https://wa.me/${digits}`;
}

/**
 * Botão de contato principal para locais que não possuem sistema de reserva
 * interno — leva direto para o WhatsApp do estabelecimento.
 */
export function WhatsAppButton({
  phone,
  className,
  label = "Chamar no WhatsApp",
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(phone);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]",
        "bg-[#25D366] shadow-[0_8px_20px_-6px_rgba(37,211,102,0.55)] hover:bg-[#1ebe5b]",
        className,
      )}
    >
      <MessageCircle className="size-5" />
      {label}
    </a>
  );
}
