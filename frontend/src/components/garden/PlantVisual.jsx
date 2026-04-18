const plantColors = {
  sunflower: { bloom: "#e4a72c", accent: "#8b5d2c", leaf: "#5f8f47" },
  tulip: { bloom: "#d86671", accent: "#b33f4c", leaf: "#5f8f47" },
  orchid: { bloom: "#a66bb8", accent: "#744982", leaf: "#4c8fa3" },
  cactus: { bloom: "#68a676", accent: "#d86671", leaf: "#5f8f47" }
};

const scaleByHealth = {
  thriving: 1,
  healthy: 0.9,
  needs_attention: 0.76,
  at_risk: 0.62,
  dormant: 0.48
};

export default function PlantVisual({ plantType = "tulip", health = "needs_attention", className = "" }) {
  const colors = plantColors[plantType] || plantColors.tulip;
  const scale = scaleByHealth[health] || 0.76;
  const muted = health === "dormant" || health === "at_risk";
  const opacity = health === "dormant" ? 0.48 : health === "at_risk" ? 0.72 : 1;
  const droop = health === "at_risk" || health === "dormant" ? "rotate(-7 64 72)" : "";

  return (
    <svg className={className} viewBox="0 0 128 128" role="img" aria-label={`${plantType} ${health}`}>
      <rect x="34" y="94" width="60" height="18" rx="5" fill="#c87951" opacity="0.92" />
      <path d="M40 110h48l-7 12H47z" fill="#a76242" />
      <g transform={`translate(64 96) scale(${scale}) translate(-64 -96)`} opacity={opacity}>
        {plantType === "cactus" ? (
          <g transform={droop}>
            <path d="M64 96V38" stroke={colors.leaf} strokeWidth="13" strokeLinecap="round" />
            <path d="M55 65c-20-2-23-16-23-27" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M73 74c18-2 23-17 23-32" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" />
            {health !== "dormant" ? <circle cx="80" cy="34" r="7" fill={colors.accent} /> : null}
          </g>
        ) : (
          <g transform={droop}>
            <path d="M64 98V42" stroke={colors.leaf} strokeWidth="7" strokeLinecap="round" />
            <path d="M61 78C43 75 33 65 29 51c18-2 31 7 37 22" fill={muted ? "#8aa078" : colors.leaf} />
            <path d="M67 83c19-4 29-15 32-31-18-2-31 8-37 25" fill={muted ? "#81998e" : colors.leaf} />
            {plantType === "sunflower" ? (
              <g>
                <circle cx="64" cy="32" r="18" fill={colors.bloom} />
                <circle cx="64" cy="32" r="8" fill={colors.accent} />
              </g>
            ) : plantType === "orchid" ? (
              <g fill={colors.bloom}>
                <ellipse cx="64" cy="31" rx="13" ry="18" />
                <ellipse cx="50" cy="39" rx="13" ry="10" transform="rotate(-28 50 39)" />
                <ellipse cx="78" cy="39" rx="13" ry="10" transform="rotate(28 78 39)" />
                <circle cx="64" cy="40" r="6" fill={colors.accent} />
              </g>
            ) : (
              <g>
                <path d="M48 28c12 1 18 10 16 28-13-5-19-15-16-28z" fill={colors.bloom} />
                <path d="M80 28c-12 1-18 10-16 28 13-5 19-15 16-28z" fill={colors.bloom} />
                <path d="M64 24c12 12 13 24 0 36-13-12-12-24 0-36z" fill={colors.accent} />
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}
