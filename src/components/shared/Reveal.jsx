import { useReducedMotion, motion } from "motion/react";
import { ease } from "../../lib/animation.js";

export default function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
