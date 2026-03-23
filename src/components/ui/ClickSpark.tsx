"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Spark = {
  x: number;
  y: number;
  angle: number;
  progress: number;
  distance: number;
  length: number;
  startTime: number;
  colorIndex: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);

type ClickSparkProps = {
  children: React.ReactNode;
  sparkColor?: string;
  sparkColorSecondary?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "ease-out" | "ease-in" | "linear";
  extraScale?: number;
};

const SPARK_COLOR_PRIMARY = "#facc15";
const SPARK_COLOR_SECONDARY = "#111111";

export function ClickSpark({
  children,
  sparkColor = SPARK_COLOR_PRIMARY,
  sparkColorSecondary = SPARK_COLOR_SECONDARY,
  sparkSize = 8,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 450,
  easing = "ease-out",
  extraScale = 1.1,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const count = isMobile ? Math.min(5, sparkCount) : sparkCount;

  const getEasing = useCallback(
    (t: number) => {
      switch (easing) {
        case "ease-in":
          return t * t;
        case "linear":
          return t;
        default:
          return easeOut(t);
      }
    },
    [easing]
  );

  const addSparks = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const x = clientX;
      const y = clientY;
      const now = performance.now();

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const distance = sparkRadius * extraScale * (0.8 + Math.random() * 0.4);
        sparksRef.current.push({
          x,
          y,
          angle,
          progress: 0,
          distance,
          length: sparkSize * (0.8 + Math.random() * 0.4),
          startTime: now,
          colorIndex: i % 2,
        });
      }
    },
    [count, sparkRadius, sparkSize, extraScale]
  );

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      addSparks(clientX, clientY);
    },
    [addSparks]
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let lastTouch = 0;
    const onClick = (e: MouseEvent) => {
      if (Date.now() - lastTouch < 400) return;
      handlePointer(e.clientX, e.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches?.[0];
      if (t) {
        lastTouch = Date.now();
        handlePointer(t.clientX, t.clientY);
      }
    };
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [handlePointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setSize();

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    const animate = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = now - spark.startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = getEasing(t);

        const endX = spark.x + Math.cos(spark.angle) * spark.distance * eased;
        const endY = spark.y + Math.sin(spark.angle) * spark.distance * eased;
        const startX = spark.x + Math.cos(spark.angle) * spark.distance * eased * 0.2;
        const startY = spark.y + Math.sin(spark.angle) * spark.distance * eased * 0.2;

        const alpha = 1 - eased;
        ctx.strokeStyle = spark.colorIndex === 0 ? sparkColor : sparkColorSecondary;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;

        return t < 1;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [duration, sparkColor, sparkColorSecondary, getEasing]);

  return (
    <div className="relative w-full min-h-full">
      {children}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
        style={{
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
        }}
        aria-hidden
      />
    </div>
  );
}
