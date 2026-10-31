import React, { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

import { EarthCanvas } from "../canvas";
import { FluidGradient } from "../canvas/FluidGradient";
import { SectionWrapper } from "../../hoc";
import { slideIn } from "../../utils/motion";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { sendContactMessage } from "../../features/portfolio/api";
import { Header } from "../atoms/Header";
import { Magnetic } from "../atoms/Magnetic";
import { useIsMobile } from "../../hooks/useMediaQuery";

const INITIAL_STATE = Object.fromEntries(
  Object.keys(config.contact.form).map((input) => [input, ""])
);

const FluidGradientCanvas = () => {
  const isMobile = useIsMobile();
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <FluidGradient />
        </Suspense>
      </Canvas>
    </div>
  );
};

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { profile } = usePortfolioContent();
  const contactEmail = profile.email || config.html.email;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | undefined
  ) => {
    if (e === undefined) return;
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | undefined
  ) => {
    if (e === undefined) return;
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      await sendContactMessage({
        name: form["name"],
        email: form["email"],
        message: form["message"],
      });
      setStatus("success");
      setForm(INITIAL_STATE);
      setTimeout(() => setStatus("idle"), 6000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse gap-8 overflow-hidden xl:mt-8 xl:flex-row items-stretch relative">
      {/* Ambient Fluid Background */}
      <div className="absolute inset-0 -z-10 opacity-60">
        <FluidGradientCanvas />
      </div>

      {/* Contact Form Card */}
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="bento-card flex-[0.8] rounded-2xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <Header useMotion={false} {...config.contact} />

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5"
          >
            {Object.keys(config.contact.form).map((input) => {
              const { span, placeholder } =
                config.contact.form[input as keyof typeof config.contact.form];
              const isTextArea = input === "message";

              return (
                <label key={input} className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/70">
                    {span}
                  </span>
                  {isTextArea ? (
                    <textarea
                      rows={5}
                      name={input}
                      required
                      value={form[`${input}`]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-acid focus:bg-white/[0.06] transition-all outline-none resize-none font-sans"
                    />
                  ) : (
                    <input
                      type={input === "email" ? "email" : "text"}
                      name={input}
                      required
                      value={form[`${input}`]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-acid focus:bg-white/[0.06] transition-all outline-none font-sans"
                    />
                  )}
                </label>
              );
            })}

            {status === "success" && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <CheckCircle2 size={16} />
                <span>Transmission successful. I will get back to you shortly.</span>
              </div>
            )}

            {status === "error" && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 font-mono text-xs">
                <AlertCircle size={16} />
                <span>Transmission issue. Please reach out directly to {contactEmail}.</span>
              </div>
            )}

            <Magnetic strength={0.2} max={12}>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-acid text-black font-semibold text-sm hover:bg-white transition-all shadow-glow disabled:opacity-50 cursor-pointer w-fit"
              >
                <Send size={15} />
                <span>{loading ? "Transmitting..." : "Send Transmission"}</span>
              </button>
            </Magnetic>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
          <span>Encrypted Direct Channel</span>
          <span>Latency &lt; 50ms</span>
        </div>
      </motion.div>

      {/* Earth 3D Canvas */}
      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="h-[350px] md:h-[500px] xl:h-auto xl:flex-1 relative rounded-2xl overflow-hidden bento-card"
      >
        <EarthCanvas />

        {profile.avatar && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-2.5 pr-5 backdrop-blur-md">
            <img
              src={profile.avatar}
              alt={profile.name || "Profile photo"}
              className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">
                {profile.name}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                {profile.tagline}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
