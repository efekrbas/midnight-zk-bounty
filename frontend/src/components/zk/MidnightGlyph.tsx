import React from "react";

export function MidnightGlyph({
  className = "size-5",
  glow = true,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div className="absolute inset-0 rounded-full bg-cyan/30 blur-sm animate-pulse" />
      )}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative size-full"
      >
        {/* Outer Zero-Knowledge Constellation Hexagon */}
        <polygon
          points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeDasharray="2 3"
          className="text-cyan/60"
        />

        {/* Outer Orbiting Pairings Ring */}
        <circle
          cx="24"
          cy="24"
          r="16"
          stroke="url(#midnight-zk-grad)"
          strokeWidth="2"
          strokeDasharray="4 2"
        />

        {/* Midnight Crescent & Shielded Eclipse */}
        <path
          d="M 24 10 A 14 14 0 1 0 38 24 A 12 12 0 1 1 24 10 Z"
          fill="url(#midnight-core-grad)"
          opacity="0.85"
        />

        {/* Central Cryptographic Witness Keypoint */}
        <circle cx="24" cy="24" r="3.5" fill="#00FFA3" />
        <circle cx="24" cy="24" r="1.5" fill="#FFFFFF" />

        {/* 6 Circuit Constraint Vertices */}
        <circle cx="24" cy="3" r="2" fill="#00F2FE" />
        <circle cx="42" cy="13.5" r="2" fill="#6C5CE7" />
        <circle cx="42" cy="34.5" r="2" fill="#00FFA3" />
        <circle cx="24" cy="45" r="2" fill="#00F2FE" />
        <circle cx="6" cy="34.5" r="2" fill="#6C5CE7" />
        <circle cx="6" cy="13.5" r="2" fill="#00FFA3" />

        {/* Gradients */}
        <defs>
          <linearGradient id="midnight-zk-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F2FE" />
            <stop offset="0.5" stopColor="#6C5CE7" />
            <stop offset="1" stopColor="#00FFA3" />
          </linearGradient>
          <linearGradient id="midnight-core-grad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F2FE" stopOpacity="0.9" />
            <stop offset="1" stopColor="#6C5CE7" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
