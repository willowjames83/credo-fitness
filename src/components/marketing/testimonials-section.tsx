"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I don't need motivation. I need smart programming across everything I do. Credo finally gets that.",
    initials: "MK",
    name: "M.K.",
    context: "Software Engineer, 42",
  },
  {
    quote:
      "The Credo Score changed how I think about training. It's not about any single workout. It's the system.",
    initials: "SR",
    name: "S.R.",
    context: "Physician, 47",
  },
  {
    quote:
      "I was using Hevy for lifts and a spreadsheet for everything else. Credo replaced all of it.",
    initials: "AT",
    name: "A.T.",
    context: "Product Manager, 39",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-28 px-5 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white border border-[#E5E5E8] rounded-2xl p-6 md:p-8 relative overflow-hidden hover:shadow-lg hover:shadow-black/[0.04] transition-shadow duration-300"
            >
              {/* Large decorative quote mark */}
              <span className="absolute top-4 right-6 text-[80px] leading-none font-[family-name:var(--font-dm-serif)] text-[#E8501A]/[0.06] select-none pointer-events-none">
                &ldquo;
              </span>
              <p className="text-[#1A1A1E] leading-relaxed mb-6 relative">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0D0D0F] flex items-center justify-center text-sm font-semibold text-white/80">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1E]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#9E9EA3]">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
