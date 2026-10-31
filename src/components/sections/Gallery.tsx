import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { styles } from "../../constants/styles";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { Header } from "../atoms/Header";

const lightboxButtonClass =
  "absolute z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white";

const GalleryContent = () => {
  const { gallery } = usePortfolioContent();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? index : (index - 1 + gallery.length) % gallery.length
    );
  }, [gallery.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? index : (index + 1) % gallery.length
    );
  }, [gallery.length]);

  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, showPrev, showNext]);

  if (gallery.length === 0) return null;

  const activeImage = activeIndex !== null ? gallery[activeIndex] : null;
  const activePosition = (activeIndex ?? 0) + 1;

  return (
    <>
      <Header useMotion={true} p="// VISUAL ARCHIVE" h2="Gallery." />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base"
      >
        Selected frames from 3D experiments, client builds, and visual studies.
      </motion.p>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {gallery.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-colors hover:border-acid/40"
          >
            <img
              src={image.image}
              alt={image.title || `Gallery photo ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
              <span className="font-display text-sm font-semibold text-white">
                {image.title || "Untitled"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>
          </button>
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {activeImage && (
            <motion.div
              key="gallery-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label={activeImage.title || "Gallery image"}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
              onClick={close}
            >
              <button
                type="button"
                aria-label="Close gallery"
                onClick={close}
                className={`${lightboxButtonClass} right-4 top-4`}
              >
                <X size={18} />
              </button>

              <button
                type="button"
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                className={`${lightboxButtonClass} left-2 top-1/2 -translate-y-1/2 sm:left-6`}
              >
                <ChevronLeft size={20} />
              </button>

              <figure
                className="max-w-6xl"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  src={activeImage.image}
                  alt={activeImage.title || "Gallery photo"}
                  decoding="async"
                  className="mx-auto max-h-[80vh] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
                />
                <figcaption className="mt-4 text-center font-mono text-xs text-white/50">
                  {activeImage.title && (
                    <span className="mr-2 text-white/90">
                      {activeImage.title}
                    </span>
                  )}
                  <span>
                    {activePosition} / {gallery.length}
                  </span>
                </figcaption>
              </figure>

              <button
                type="button"
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className={`${lightboxButtonClass} right-2 top-1/2 -translate-y-1/2 sm:right-6`}
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const Gallery = () => {
  const { gallery } = usePortfolioContent();

  if (gallery.length === 0) return null;

  return (
    <motion.section
      id="gallery"
      className={`${styles.padding} relative z-0 mx-auto max-w-7xl`}
    >
      <GalleryContent />
    </motion.section>
  );
};

export default Gallery;
