"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ---------- Animated counter that ticks up when scrolled into view ----------
export function AnimatedCounter({
  value,
  duration = 1.6,
  decimals = 0,
  format = true,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  format?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      const rounded = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
      if (format) {
        setDisplay(formatNum(Number(rounded)));
      } else {
        setDisplay(rounded);
      }
    });
    return () => unsub();
  }, [spring, decimals, format]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

// ---------- Scroll-triggered reveal wrapper ----------
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------- Staggered container for lists of items ----------
export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------- Animated SEO score ring with cinematic fill ----------
export function AnimatedScoreRing({
  score,
  size = 120,
  stroke = 10,
  delay = 0.4,
}: {
  score: number;
  size?: number;
  stroke?: number;
  delay?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const offset = useTransform(
    motionValue,
    (v) => circumference - (v / 100) * circumference
  );

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => motionValue.set(score), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [inView, score, motionValue, delay]);

  const color =
    score >= 85 ? "#10b981" : score >= 65 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 35 ? "#f97316" : "#ef4444";
  const grade =
    score >= 85 ? "A+" : score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F";
  const label =
    score >= 85 ? "Excellent" : score >= 75 ? "Strong" : score >= 65 ? "Good" : score >= 50 ? "Average" : score >= 35 ? "Weak" : "Critical";

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{ strokeDashoffset: offset, stroke: color }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={score}
          duration={1.6}
          className="font-bold tabular-nums"
        />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
          {grade} · {label}
        </span>
      </div>
    </div>
  );
}

// ---------- Cinematic animated background (floating orbs / grid) ----------
export function CinematicBackground({ variant = "orbs" }: { variant?: "orbs" | "grid" | "mesh" }) {
  if (variant === "grid") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 80%)",
          }}
        />
      </div>
    );
  }
  if (variant === "mesh") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.14 158), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-20 right-0 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.13 195), transparent 70%)" }}
          animate={{ scale: [1.1, 1, 1.1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }
  // orbs
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-10 left-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.14 158), transparent 70%)" }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.13 195), transparent 70%)" }}
        animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
