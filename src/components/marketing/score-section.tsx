"use client";

import { motion } from "framer-motion";
import { CredoScoreRing } from "@/components/shared/credo-score-ring";
import { PILLARS } from "@/lib/constants";

const pillarScores = [
  { ...PILLARS.strength, score: 68 },
  { ...PILLARS.stability, score: 41 },
  { ...PILLARS.cardio, score: 76 },
  { ...PILLARS.nutrition, score: 85 },
];

export function ScoreSection() {
  return (
    <section className="relative bg-[#0D0D0F] bg-noise py-16 md:py-28 px-5 md:px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8501A] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-dm-serif)] text-3xl md:text-[2.75rem] text-white"
        >
          One number. Four pillars. No guesswork.
        </motion.h2>

        <motion.div
          className="mt-14 flex justify-center relative"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Ring glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] bg-[#E8501A] rounded-full opacity-[0.06] blur-[50px] pointer-events-none" />
          <CredoScoreRing size={200} score={72} dark />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {pillarScores.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03]"
              >
                <Icon className="w-4 h-4" style={{ color: pillar.color }} />
                <span className="text-sm font-medium text-white/80">
                  {pillar.label}
                </span>
                <span className="text-sm font-mono text-white/50">
                  {pillar.score}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
