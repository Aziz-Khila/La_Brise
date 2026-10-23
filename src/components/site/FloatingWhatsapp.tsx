import { WhatsappIcon } from "@/components/ui/Icons";
import { whatsappHref } from "@/lib/links";

type FloatingWhatsappProps = {
  number: string;
  message?: string;
};

export function FloatingWhatsapp({ number, message }: FloatingWhatsappProps) {
  return (
    <a
      className="floating-whatsapp"
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
    >
      <WhatsappIcon />
    </a>
  );
}
