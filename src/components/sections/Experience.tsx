import React, { useRef } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { Briefcase, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { SectionWrapper } from "../../hoc";
import { Header } from "../atoms/Header";
import { TExperience } from "../../types";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";

const ExperienceCard: React.FC<TExperience> = (experience) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "rgba(18, 18, 22, 0.85)",
        color: "#f4f4f5",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
      contentArrowStyle={{ borderRight: "7px solid rgba(255, 255, 255, 0.08)" }}
      date={experience.date}
      dateClassName="font-mono text-xs text-white/50"
      iconStyle={{
        background: "#09090b",
        border: "2px solid #d4ff00",
        boxShadow: "0 0 15px rgba(212, 255, 0, 0.3)",
        overflow: "visible",
      }}
      icon={
        <div className="flex h-full w-full items-center justify-center text-acid relative">
          {/* Main Icon */}
          <Briefcase size={18} className="relative z-10" />

          {/* Orbiting Stars around Icon */}
          <motion.div
            className="absolute"
            style={{ top: "-8px", right: "-8px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={10} className="text-acid" />
          </motion.div>

          <motion.div
            className="absolute"
            style={{ bottom: "-8px", left: "-8px" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={8} className="text-[#00f5a0]" />
          </motion.div>

          <motion.div
            className="absolute"
            style={{ top: "-6px", left: "-10px" }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={6} className="text-acid/60" />
          </motion.div>
        </div>
      }
    >
      <div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
          {experience.title}
        </h3>
        <p
          className="font-mono text-xs text-acid font-medium mt-1 tracking-wider uppercase"
          style={{ margin: 0 }}
        >
          {experience.companyName}
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className="text-secondary text-xs sm:text-sm leading-relaxed flex items-start gap-2"
          >
            <span className="text-acid font-bold mt-0.5">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </VerticalTimelineElement>
  );
};

// Floating star decoration component
const FloatingStar = ({ delay = 0, duration = 3, x = 0, y = 0 }) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    >
      <Sparkles size={16} className="text-acid/40" />
    </motion.div>
  );
};

const Experience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progressValue, setProgressValue] = React.useState(0);
  const { experiences } = usePortfolioContent();

  // Scroll progress for this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Update progress value
  React.useEffect(() => {
    return progressSpring.on("change", (v) => {
      setProgressValue(Math.round(v * 100));
    });
  }, [progressSpring]);

  return (
    <div ref={containerRef} className="relative">
      {/* Floating Stars Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <FloatingStar delay={0} duration={4} x={10} y={15} />
        <FloatingStar delay={1} duration={5} x={85} y={25} />
        <FloatingStar delay={0.5} duration={3.5} x={20} y={45} />
        <FloatingStar delay={2} duration={4.5} x={75} y={60} />
        <FloatingStar delay={1.5} duration={4} x={15} y={75} />
        <FloatingStar delay={0.8} duration={5} x={88} y={85} />
        <FloatingStar delay={2.5} duration={3.8} x={45} y={30} />
        <FloatingStar delay={1.2} duration={4.2} x={60} y={70} />
      </div>

      {/* Section Progress Indicator */}
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-3 p-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        {/* Progress Bar */}
        <div className="relative w-1 h-48 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-acid to-[#00f5a0] rounded-full"
            style={{
              height: useTransform(progressSpring, [0, 1], ["0%", "100%"]),
            }}
          />
        </div>

        {/* Progress Label */}
        <div className="font-mono text-[10px] text-white/40 tracking-wider whitespace-nowrap">
          <span className="text-acid font-bold">{progressValue}</span>%
        </div>
      </motion.div>

      <Header useMotion={true} {...config.sections.experience} />

      {experiences.length > 0 ? (
        <div className="mt-14 flex flex-col relative">
          {/* Subtle gradient overlay on timeline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-acid/[0.02] to-transparent pointer-events-none" />

          <VerticalTimeline lineColor="rgba(255, 255, 255, 0.08)">
            {experiences.map((experience, index) => (
              <ExperienceCard key={index} {...experience} />
            ))}
          </VerticalTimeline>
        </div>
      ) : (
        <div className="bento-card mt-14 rounded-2xl p-10 text-center">
          <p className="font-display text-lg font-bold text-white">
            Career timeline is being updated
          </p>
          <p className="mt-2 text-sm text-secondary">
            Professional experience will appear here soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionWrapper(Experience, "experience");
