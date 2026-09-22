import { MessageCircle } from "lucide-react";
import { business } from "../config.js";

export default function WhatsAppButton() {
  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Swiss ZH Transport on WhatsApp"
    >
      <MessageCircle size={23} />
      <span>Let’s talk</span>
    </a>
  );
}
