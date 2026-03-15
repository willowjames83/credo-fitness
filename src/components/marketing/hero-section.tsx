"use client";

import { motion } from "framer-motion";
import { CredoScoreRing } from "@/components/shared/credo-score-ring";
import { AppDownloadBadges } from "@/components/shared/app-download-badges";
import { PILLARS } from "@/lib/constants";

const pillarScores = [
  { ...PILLARS.strength, score: 68 },
  { ...PILLARS.stability, score: 41 },
  { ...PILLARS.cardio, score: 76 },
  { ...PILLARS.nutrition, score: 85 },
];

const headlineWords = ["Train", "for", "the", "body", "you", "want", "today,", "and", "need", "at", "80."];

export function HeroSection() {
  return (
    <section className="relative bg-[#0D0D0F] bg-noise pt-24 pb-16 md:pt-32 md:pb-32 px-5 md:px-6 overflow-hidden">
      {/* Radial glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E8501A] rounded-full opacity-[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12">
        {/* Text */}
        <div className="md:w-[60%]">
          <h1 className="font-[family-name:var(--font-dm-serif)] text-[2.5rem] sm:text-5xl md:text-7xl text-white leading-[1.1]">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 text-lg text-[#9E9EA3] max-w-lg leading-relaxed"
          >
            Strength, stability, cardio, and nutrition. One app. One score.
            Built on the science of living longer and better.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <AppDownloadBadges badgeHeight={44} />
            <a
              href="#how-it-works"
              className="text-[#9E9EA3] hover:text-white transition-colors text-sm font-medium"
            >
              See how it works &rarr;
            </a>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          className="md:w-[40%] flex flex-col items-center relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {/* Glow behind ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[240px] h-[240px] bg-[#E8501A] rounded-full opacity-[0.08] blur-[60px] pointer-events-none" />
          <CredoScoreRing size={180} score={72} dark />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {pillarScores.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm"
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: pillar.color }} />
                  <span className="text-xs font-medium text-white/80">{pillar.label}</span>
                  <span className="text-xs font-mono text-white/50">{pillar.score}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
