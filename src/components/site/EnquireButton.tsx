import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Keeps the leading + and strips everything else, so a phone saved as
 * "+39 333 123 4567" works in wa.me/tel: links which need digits only. */
function toDialable(phone: string) {
  return phone.trim().replace(/(?!^\+)[^\d]/g, "");
}

export function EnquireButton({
  email,
  phone,
  subject,
  label = "Enquire",
  className,
}: {
  email: string;
  phone: string | null;
  subject: string;
  label?: string;
  className?: string;
}) {
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  // No phone on file — same as before, a direct email link.
  if (!phone || !phone.trim()) {
    return (
      <a href={mailtoHref} className={className}>
        {label}
      </a>
    );
  }

  const dialable = toDialable(phone);
  const waNumber = dialable.replace("+", "");
  const waMessage = encodeURIComponent(`Hi, I'm interested in: ${subject}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className, "outline-none")}>{label}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`https://t.me/+${waNumber}`} target="_blank" rel="noreferrer">
            <Send className="size-4" /> Telegram
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`tel:${dialable}`}>
            <Phone className="size-4" /> Call
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={mailtoHref}>
            <Mail className="size-4" /> Email
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
