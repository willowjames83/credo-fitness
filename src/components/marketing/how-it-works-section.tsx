"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Answer a few questions",
    description:
      "Your experience, equipment, and schedule. Profile built in under two minutes.",
  },
  {
    number: 2,
    title: "Get your program",
    description:
      "Credo builds a periodized strength program with stability work built in. Tailored to you.",
  },
  {
    number: 3,
    title: "Log your training",
    description:
      "Lifts, stability, cardio, and protein. One place. No switching between apps.",
  },
  {
    number: 4,
    title: "Watch your scores rise",
    description:
      "Your Credo Score improves week over week as your training becomes more complete.",
  },
  {
    number: 5,
    title: "Train with AI",
    description:
      "Connect Claude via MCP for coaching that reads your data and adjusts your program in real time.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6 bg-[#FAFAFA] relative">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.02] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-dm-serif)] text-3xl md:text-[2.75rem] text-[#1A1A1E]"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#E5E5E8] to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center text-center relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#E8501A] rounded-full opacity-20 blur-[8px]" />
                <div className="relative w-10 h-10 rounded-full bg-[#E8501A] text-white flex items-center justify-center text-sm font-bold mb-4">
                  {step.number}
                </div>
              </div>
              <h3 className="text-[#1A1A1E] font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#6B6B73] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
