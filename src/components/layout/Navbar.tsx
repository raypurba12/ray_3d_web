import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { navLinks } from "../../constants";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";

const Navbar = () => {
  const { gallery } = usePortfolioContent();
  const links =
    gallery.length > 0
      ? navLinks
      : navLinks.filter((nav) => nav.id !== "gallery");
  const [active, setActive] = useState<string | null>("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!toggle) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setToggle(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        menuRef.current?.contains(target) ||
        toggleRef.current?.contains(target)
      ) {
        return;
      }
      setToggle(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [toggle]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]")
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [gallery.length]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "py-3 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]"
          : "py-6 bg-transparent"
        }`}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-acid via-[#00f5a0] to-acid origin-left"
        style={{ scaleX }}
      />

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-16">
        {/* Brand Monogram */}
        <a href="#top" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-white text-base group-hover:border-acid transition-colors">
            R<span className="text-acid">.</span>
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white group-hover:text-acid transition-colors">
            {config.html.fullName}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
          {links.map((nav) => (
            <a
              key={nav.id}
              href={`#${nav.id}`}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 ${active === nav.id
                  ? "bg-white/10 text-white font-medium border border-white/15"
                  : "text-white/60 hover:text-white"
                }`}
            >
              {nav.title}
            </a>
          ))}
        </nav>

        {/* Contact CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider text-white/90 bg-white/[0.05] border border-white/10 hover:border-acid hover:text-acid transition-all duration-200"
          >
            <span>Let's Talk</span>
            <ArrowUpRight size={13} />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setToggle(!toggle)}
            aria-label="Toggle Navigation"
            aria-expanded={toggle}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white hover:text-acid"
          >
            {toggle ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Mobile Overlay Menu */}
          {toggle && (
            <div
              id="mobile-navigation"
              ref={menuRef}
              className="absolute right-6 top-16 z-50 w-60 rounded-2xl bg-[#121216]/95 border border-white/10 backdrop-blur-2xl p-3 shadow-2xl flex flex-col gap-1"
            >
              {links.map((nav) => (
                <a
                  key={nav.id}
                  href={`#${nav.id}`}
                  onClick={() => setToggle(false)}
                  className={`px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors ${active === nav.id
                      ? "bg-white/10 text-acid font-semibold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {nav.title}
                </a>
              ))}
              <hr className="border-white/10 my-1" />
              <a
                href="#contact"
                onClick={() => setToggle(false)}
                className="px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider text-center bg-acid text-black font-semibold"
              >
                Let's Talk
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
