import { useScroll, useSpring, motion } from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div className="reading-progress" style={{ scaleX: progress }} />
  );
}
