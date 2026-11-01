import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { CSSProperties } from "react";

import { fadeIn } from "../../utils/motion";
import { Header } from "../atoms/Header";
import { TTestimonial } from "../../types";
import { usePortfolioContent } from "../../features/portfolio/content-context";

const FeedbackCard: React.FC<{ index: number } & TTestimonial> = ({
  index,
  testimonial,
  name,
  designation,
  company,
  image,
  rating,
}) => {
  const stars = Math.max(0, Math.min(5, Math.round(rating ?? 0)));

  return (
  <motion.div
    variants={fadeIn("", "spring", index * 0.2, 0.75)}
    className="bento-card flex w-[80vw] max-w-[22rem] shrink-0 flex-col justify-between rounded-2xl p-6 sm:w-[22rem] sm:max-w-none sm:p-8"
  >
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Quote size={28} className="text-acid/60" />
        {stars > 0 && (
          <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`Rated ${stars} out of 5`}
          >
            {Array.from({ length: 5 }, (_, starIndex) => (
              <Star
                key={starIndex}
                size={12}
                className={
                  starIndex < stars
                    ? "fill-acid text-acid"
                    : "text-white/15"
                }
              />
            ))}
          </div>
        )}
      </div>
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
          loading="lazy"
          decoding="async"
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
};

const Feedbacks = () => {
  const { testimonials, site, status } = usePortfolioContent();

  return (
    <div className="mx-auto max-w-7xl w-full py-10 sm:py-16 px-6 sm:px-16">
      <div className="mb-10">
        <Header
          useMotion={true}
          p={site.sections.feedbacks.label}
          h2={site.sections.feedbacks.title}
        />
      </div>

      {testimonials.length > 0 ? (
        <div className="marquee-viewport overflow-hidden">
          <div
            className="marquee-track flex w-max"
            style={
              {
                "--marquee-shift": `${100 / Math.max(2, Math.ceil(8 / testimonials.length))}%`,
              } as CSSProperties
            }
          >
            {Array.from(
              { length: Math.max(2, Math.ceil(8 / testimonials.length)) },
              (_, copy) => (
                <div
                  key={copy}
                  aria-hidden={copy > 0}
                  className="flex shrink-0 gap-6 pr-6"
                >
                  {testimonials.map((testimonial, index) => (
                    <FeedbackCard
                      key={`${copy}-${testimonial.name}-${index}`}
                      index={index}
                      {...testimonial}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      ) : status === "loading" ? (
        <div className="bento-card rounded-2xl p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Syncing testimonials…
          </p>
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
