interface CarIconProps {
  color: string;
  size?: number;
}

const ICON_ASPECT = 0.55; // height-to-width ratio of the car SVG viewBox (44/80)
const SPOKE_INNER_OFFSET = 2;
const SPOKE_OUTER_OFFSET = 4.3;

function CarBody({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="40" cy="43.5" rx="34" ry="2" fill="rgba(0,0,0,0.22)" />
      <rect x="4" y="23" width="72" height="14" rx="3" fill={color} />
      <path d="M20 23 L26 10 Q28 8 31 8 L51 8 Q54 8 56 10 L62 23 Z" fill={color} />
      <path d="M22 23 L27 11 Q29 9.5 31 9.5 L43 9.5 L39 23 Z" fill="rgba(255,255,255,0.11)" />
      <path d="M23.5 21.5 L28 11 L38 11 L38 21.5 Z" fill="rgba(186,230,253,0.82)" />
      <path d="M40 21.5 L40 11 L51 11 L57.5 21.5 Z" fill="rgba(186,230,253,0.82)" />
      <rect x="38" y="8.5" width="2" height="14" fill={color} />
      <rect x="7" y="24.5" width="66" height="2.5" rx="1.25" fill="rgba(255,255,255,0.1)" />
      <line x1="38" y1="23" x2="38" y2="35.5" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <ellipse cx="20" cy="31" rx="9" ry="3.5" fill="rgba(0,0,0,0.14)" />
      <ellipse cx="60" cy="31" rx="9" ry="3.5" fill="rgba(0,0,0,0.14)" />
      <rect x="74" y="26" width="4" height="5" rx="1.5" fill="#fde68a" />
      <rect x="2" y="26" width="4" height="5" rx="1.5" fill="#fca5a5" />
    </>
  );
}

function CarWheel({ cx }: { cx: number }) {
  return (
    <>
      <circle cx={cx} cy="37" r="7" fill="#1e293b" />
      <circle cx={cx} cy="37" r="4.5" fill="#334155" />
      <line x1={cx} y1="32.7" x2={cx} y2="35" stroke="#64748b" strokeWidth="1.2" />
      <line x1={cx} y1="39" x2={cx} y2="41.3" stroke="#64748b" strokeWidth="1.2" />
      <line
        x1={cx - SPOKE_OUTER_OFFSET}
        y1="37"
        x2={cx - SPOKE_INNER_OFFSET}
        y2="37"
        stroke="#64748b"
        strokeWidth="1.2"
      />
      <line
        x1={cx + SPOKE_INNER_OFFSET}
        y1="37"
        x2={cx + SPOKE_OUTER_OFFSET}
        y2="37"
        stroke="#64748b"
        strokeWidth="1.2"
      />
      <circle cx={cx} cy="37" r="1.8" fill="#475569" />
    </>
  );
}

export function CarIcon({ color, size = 60 }: CarIconProps) {
  const height = Math.round(size * ICON_ASPECT);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 80 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <CarBody color={color} />
      <CarWheel cx={20} />
      <CarWheel cx={60} />
    </svg>
  );
}
