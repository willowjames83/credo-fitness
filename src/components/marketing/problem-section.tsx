"use client";

import { motion } from "framer-motion";

export function ProblemSection() {
  return (
    <section className="relative py-28 px-6 bg-[#FAFAFA]">
      {/* Faint dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-[11px] uppercase tracking-[3px] text-[#9E9EA3] mb-6 font-medium"
        >
          The problem
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-[1.65rem] text-[#1A1A1E] leading-relaxed font-light"
        >
          You know VO&#8322; max, zone 2, grip strength, and progressive
          overload. You know exercise is the most powerful longevity
          intervention that exists. But your training lives in three apps
          and a spreadsheet. One for lifting. One for cardio. A note for
          protein. Nothing ties it together.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 text-xl md:text-[1.65rem] text-[#1A1A1E] leading-relaxed font-light"
        >
          You don&apos;t need another workout logger. You need a system
          that programs, tracks, and scores every dimension of exercise
          that matters for longevity.
        </motion.p>
      </div>
    </section>
  );
}
