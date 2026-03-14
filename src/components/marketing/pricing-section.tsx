"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { AppDownloadBadges } from "@/components/shared/app-download-badges";

const freeFeatures = [
  { label: "Workout logging", included: true },
  { label: "2 custom routines", included: true },
  { label: "Strength Score", included: true },
  { label: "Basic charts", included: true },
  { label: "Protein tracking", included: true },
  { label: "Auto-programming", included: false },
  { label: "Full Credo Score", included: false },
  { label: "All domain scores", included: false },
  { label: "Stability warmups", included: false },
  { label: "Cardio integration", included: false },
  { label: "MCP access", included: false },
  { label: "Unlimited routines", included: false },
];

const proFeatures = [
  { label: "Everything in Free", included: true },
  { label: "Auto-programming", included: true },
  { label: "Full Credo Score", included: true },
  { label: "All domain scores", included: true },
  { label: "Stability warmups", included: true },
  { label: "Cardio integration", included: true },
  { label: "MCP access", included: true },
  { label: "Unlimited routines", included: true },
  { label: "Credo Ten benchmarks", included: true },
  { label: "Advanced analytics", included: true },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-28 px-6 bg-[#FAFAFA] relative">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.02] pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-dm-serif)] text-3xl md:text-[2.75rem] text-[#1A1A1E]"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-[#6B6B73] text-lg"
          >
            Start free. Upgrade when you&apos;re ready.
          </motion.p>

          {/* Toggle */}
          <div className="mt-6 inline-flex items-center gap-1 bg-[#EEEFF1] rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual
                  ? "bg-white text-[#1A1A1E] shadow-sm"
                  : "text-[#6B6B73] hover:text-[#1A1A1E]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                annual
                  ? "bg-white text-[#1A1A1E] shadow-sm"
                  : "text-[#6B6B73] hover:text-[#1A1A1E]"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-[#2D8A4E] font-semibold">
                Save 37%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-[#E5E5E8] rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold text-[#1A1A1E]">Free</h3>
            <p className="text-sm text-[#6B6B73] mt-1">Free forever</p>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold text-[#1A1A1E]">$0</span>
            </div>
            <AppDownloadBadges badgeHeight={34} />
            <ul className="mt-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  {f.included ? (
                    <Check className="w-4 h-4 text-[#2D8A4E] shrink-0" />
                  ) : (
                    <Minus className="w-4 h-4 text-[#9E9EA3] shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      f.included ? "text-[#1A1A1E]" : "text-[#9E9EA3]"
                    }`}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-2xl p-8 bg-white shadow-xl shadow-[#E8501A]/[0.06]"
            style={{
              border: "2px solid transparent",
              backgroundClip: "padding-box",
              backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #E8501A, #E8501A66, #E8501A)",
              backgroundOrigin: "padding-box, border-box",
            }}
          >
            <div className="absolute -top-3 right-6 bg-[#E8501A] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-[#E8501A]/20">
              Most Popular
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1E]">Pro</h3>
            <p className="text-sm text-[#6B6B73] mt-1">
              Every pillar. Every score. Full system.
            </p>
            <div className="mt-4 mb-1">
              <span className="text-4xl font-bold text-[#1A1A1E]">
                {annual ? "$12.50" : "$19.99"}
              </span>
              <span className="text-[#6B6B73] text-sm ml-1">/month</span>
            </div>
            {annual && (
              <p className="text-xs text-[#6B6B73] mb-5">
                $149.99 billed annually
              </p>
            )}
            {!annual && <div className="mb-5" />}
            <p className="text-xs text-[#9E9EA3] mb-6">
              Also available: $299.99 lifetime
            </p>
            <AppDownloadBadges badgeHeight={34} />
            <ul className="mt-8 space-y-3">
              {proFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#2D8A4E] shrink-0" />
                  <span className="text-sm text-[#1A1A1E]">{f.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
