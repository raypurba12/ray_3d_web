import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { fadeIn } from "../../utils/motion";
import { Header } from "../atoms/Header";
import { TTestimonial } from "../../types";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";

const FeedbackCard: React.FC<{ index: number } & TTestimonial> = ({
  index,
  testimonial,
  name,
  designation,
  company,
  image,
}) => (
  <motion.div
    variants={fadeIn("", "spring", index * 0.2, 0.75)}
    className="bento-card flex-1 min-w-[280px] max-w-md rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
  >
    <div>
      <Quote size={28} className="text-acid/60 mb-4" />
      <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans">
        "{testimonial}"
      </p>
    </div>

    <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <p className="font-display text-sm font-bold text-white tracking-tight">
          {name}
        </p>
        <p className="font-mono text-xs text-secondary mt-0.5">
          {designation} • {company}
        </p>
      </div>

      {image ? (
        <img
          src={image}
          alt={`feedback_by-${name}`}
          className="h-10 w-10 rounded-full border border-white/10 object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] font-display text-sm font-bold text-acid">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  </motion.div>
);

const Feedbacks = () => {
  const { testimonials } = usePortfolioContent();

  return (
    <div className="mx-auto max-w-7xl w-full my-16 px-6 sm:px-16">
      <div className="mb-10">
        <Header useMotion={true} {...config.sections.feedbacks} />
      </div>

      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <FeedbackCard
              key={testimonial.name}
              index={index}
              {...testimonial}
            />
          ))}
        </div>
      ) : (
        <div className="bento-card rounded-2xl p-10 text-center">
          <p className="font-display text-lg font-bold text-white">
            No testimonials yet
          </p>
          <p className="mt-2 text-sm text-secondary">
            Collaborations and client feedback will be featured here soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
