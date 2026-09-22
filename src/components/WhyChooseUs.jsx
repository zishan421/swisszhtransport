import { Clock3, ShieldCheck, MessageCircle } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

export default function WhyChooseUs() {
  return (
    <section className="details-section container">
      <Reveal>
        <Label>IT’S IN THE DETAILS</Label>
        <h2>
          Considered at <em>every turn.</em>
        </h2>
      </Reveal>
      <div className="details-grid">
        {[
          [
            Clock3,
            "Your time, respected.",
            "From the first conversation to the final stop, your schedule shapes the journey.",
          ],
          [
            ShieldCheck,
            "Your space, protected.",
            "Personal service and a private setting, so you can settle in and feel at ease.",
          ],
          [
            MessageCircle,
            "A real person, always.",
            "Speak directly with us. Clear arrangements, thoughtful answers and no unnecessary steps.",
          ],
        ].map(([Icon, title, copy], i) => (
          <Reveal delay={i * 0.12} className="detail-item" key={title}>
            <Icon size={25} strokeWidth={1.3} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
