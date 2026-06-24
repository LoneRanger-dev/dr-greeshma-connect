"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Renders a soft aurora glow that follows the mouse cursor.
// Only active on desktop (pointer: fine) — hidden on touch devices and when
// prefers-reduced-motion is set.
export function CursorGlow() {
  const glowRef  = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos      = useRef({ x: -200, y: -200 });
  const reduced  = useReducedMotion();

  useEffect(() => {
    // Only show on fine-pointer (mouse) devices
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine || reduced) return;

    const glow  = glowRef.current;
    const trail = trailRef.current;
    if (!glow || !trail) return;

    glow.style.opacity  = "1";
    trail.style.opacity = "1";

    let rafId: number;
    let trailX = -200, trailY = -200;

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      // Glow follows cursor instantly
      glow!.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;

      // Trail lerps behind
      trailX += (pos.current.x - trailX) * 0.08;
      trailY += (pos.current.y - trailY) * 0.08;
      trail!.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9990] overflow-hidden">
      {/* Primary glow — teal */}
      <div
        ref={glowRef}
        className="absolute left-0 top-0 opacity-0"
        style={{
          width:           "420px",
          height:          "420px",
          borderRadius:    "50%",
          background:      "radial-gradient(circle, oklch(0.636 0.131 185.7 / 0.12) 0%, transparent 70%)",
          willChange:      "transform",
          mixBlendMode:    "screen",
        }}
      />
      {/* Trail — violet */}
      <div
        ref={trailRef}
        className="absolute left-0 top-0 opacity-0"
        style={{
          width:        "240px",
          height:       "240px",
          borderRadius: "50%",
          background:   "radial-gradient(circle, oklch(0.583 0.194 271.3 / 0.08) 0%, transparent 70%)",
          willChange:   "transform",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
