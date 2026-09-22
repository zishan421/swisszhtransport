import { MessageCircle } from "lucide-react";
import { business } from "../config.js";
import SpecularButton from "./SpecularButton.jsx";

export default function WhatsAppButton() {
  return (
    <SpecularButton
      as="a"
      size="lg"
      radius={14}
      className="floating-whatsapp"
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Swiss ZH Transport on WhatsApp"
    >
      <MessageCircle size={23} />
      <span>Let’s talk</span>
    </SpecularButton>
  );
}
