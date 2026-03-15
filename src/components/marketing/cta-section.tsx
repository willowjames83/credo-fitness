"use client";

import { motion } from "framer-motion";
import { AppDownloadBadges } from "@/components/shared/app-download-badges";

export function CtaSection() {
  return (
    <section id="cta" className="relative bg-[#0D0D0F] bg-noise py-16 md:py-28 px-5 md:px-6 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E8501A] rounded-full opacity-[0.05] blur-[100px] pointer-events-none" />

      <motion.div
        className="max-w-2xl mx-auto text-center relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl md:text-[2.75rem] text-white leading-tight">
          Strong, active, and metabolically healthy at 80. That&apos;s the game.
        </h2>
        <div className="mt-10">
          <AppDownloadBadges badgeHeight={44} className="justify-center" />
        </div>
        <p className="mt-4 text-sm text-[#9E9EA3]">
          No credit card required
        </p>
      </motion.div>
    </section>
  );
}
