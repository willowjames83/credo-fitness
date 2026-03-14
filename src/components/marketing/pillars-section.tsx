"use client";

import { motion } from "framer-motion";
import { PILLARS } from "@/lib/constants";

const pillarDescriptions: Record<string, string> = {
  strength:
    "Track every lift. Watch your estimated 1RM climb. Programming that auto-adjusts based on your performance.",
  stability:
    "The pillar everyone skips. Credo scores your mobility, generates warmups, and programs it in so you never have to think about it.",
  cardio:
    "Zone 2 minutes and VO\u2082 max. The two numbers that predict how long you will live. Syncs with Peloton, Strava, and Apple Watch.",
  nutrition:
    "One number: daily protein. No calorie counting. No food databases. Just hit your target.",
};

export function PillarsSection() {
  const pillars = Object.values(PILLARS);

  return (
    <section id="pillars" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-dm-serif)] text-3xl md:text-[2.75rem] text-[#1A1A1E]"
          >
            The Four Pillars
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-[#6B6B73] text-lg"
          >
            Every dimension of exercise that matters for longevity
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white border border-[#E5E5E8] rounded-2xl p-8 relative overflow-hidden hover:shadow-lg hover:shadow-black/[0.04] transition-shadow duration-300"
              >
                {/* Top gradient bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${pillar.color}, ${pillar.color}33)`,
                  }}
                />
                {/* Subtle glow on hover */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-[40px]"
                  style={{ backgroundColor: pillar.color }}
                />
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${pillar.color}10` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: pillar.color }} />
                  </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: pillar.color }}
                  >
                    {pillar.label}
                  </h3>
                </div>
                <p className="text-[#6B6B73] leading-relaxed">
                  {pillarDescriptions[pillar.key]}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
