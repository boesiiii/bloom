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

const scaleByStage = {
  seed: 0.2,
  sprout: 0.42,
  growing: 0.64,
  budding: 0.82,
  blooming: 0.96,
  fully_bloomed: 1.08
};

export default function PlantVisual({ plantType = "tulip", health = "needs_attention", plant, className = "" }) {
  const colors = plantColors[plantType] || plantColors.tulip;
  const stage = plant?.growth_stage || (health === "dormant" ? "seed" : "growing");
  const disconnectionStreak = plant?.disconnection_streak || 0;
  const needsRestart = Boolean(plant?.needs_restart);
  const scale = plant ? scaleByStage[stage] || 0.64 : scaleByHealth[health] || 0.76;
  const muted = needsRestart || disconnectionStreak > 0 || health === "dormant" || health === "at_risk";
  const opacity = needsRestart ? 0.5 : disconnectionStreak ? Math.max(0.42, 1 - disconnectionStreak * 0.07) : health === "dormant" ? 0.48 : health === "at_risk" ? 0.72 : 1;
  const droop = disconnectionStreak || health === "at_risk" || health === "dormant" ? `rotate(${-4 - Math.min(disconnectionStreak, 8)} 64 72)` : "";
  const showBloom = ["budding", "blooming", "fully_bloomed"].includes(stage) && !needsRestart;
  const showFullBloom = stage === "fully_bloomed" && !disconnectionStreak;
  const showLeaves = stage !== "seed";

  return (
    <svg className={className} viewBox="0 0 128 128" role="img" aria-label={`${plantType} ${stage}`}>
      <rect x="34" y="94" width="60" height="18" rx="5" fill="#c87951" opacity="0.92" />
      <path d="M40 110h48l-7 12H47z" fill="#a76242" />
      {stage === "seed" ? (
        <g opacity={opacity}>
          <ellipse cx="64" cy="91" rx="18" ry="5" fill="#7d5b3f" opacity="0.28" />
          <ellipse cx="64" cy="86" rx="8" ry="5" fill={needsRestart ? "#8c8173" : "#8b5d2c"} />
        </g>
      ) : null}
      <g transform={`translate(64 96) scale(${scale}) translate(-64 -96)`} opacity={opacity}>
        {stage !== "seed" && plantType === "cactus" ? (
          <g transform={droop}>
            <path d="M64 96V38" stroke={colors.leaf} strokeWidth="13" strokeLinecap="round" />
            {showLeaves ? <path d="M55 65c-20-2-23-16-23-27" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" /> : null}
            {["growing", "budding", "blooming", "fully_bloomed"].includes(stage) ? (
              <path d="M73 74c18-2 23-17 23-32" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" />
            ) : null}
            {showBloom ? <circle cx="80" cy="34" r={showFullBloom ? "9" : "6"} fill={colors.accent} /> : null}
          </g>
        ) : stage !== "seed" ? (
          <g transform={droop}>
            <path d="M64 98V42" stroke={colors.leaf} strokeWidth="7" strokeLinecap="round" />
            {showLeaves ? <path d="M61 78C43 75 33 65 29 51c18-2 31 7 37 22" fill={muted ? "#8aa078" : colors.leaf} /> : null}
            {["growing", "budding", "blooming", "fully_bloomed"].includes(stage) ? (
              <path d="M67 83c19-4 29-15 32-31-18-2-31 8-37 25" fill={muted ? "#81998e" : colors.leaf} />
            ) : null}
            {showBloom && plantType === "sunflower" ? (
              <g>
                <circle cx="64" cy="32" r={showFullBloom ? "23" : stage === "budding" ? "10" : "18"} fill={colors.bloom} />
                <circle cx="64" cy="32" r="8" fill={colors.accent} />
              </g>
            ) : showBloom && plantType === "orchid" ? (
              <g fill={colors.bloom}>
                <ellipse cx="64" cy="31" rx={showFullBloom ? "16" : "13"} ry={showFullBloom ? "21" : "18"} />
                {stage !== "budding" ? <ellipse cx="50" cy="39" rx="13" ry="10" transform="rotate(-28 50 39)" /> : null}
                {stage !== "budding" ? <ellipse cx="78" cy="39" rx="13" ry="10" transform="rotate(28 78 39)" /> : null}
                <circle cx="64" cy="40" r="6" fill={colors.accent} />
              </g>
            ) : showBloom ? (
              <g>
                {stage !== "budding" ? <path d="M48 28c12 1 18 10 16 28-13-5-19-15-16-28z" fill={colors.bloom} /> : null}
                {stage !== "budding" ? <path d="M80 28c-12 1-18 10-16 28 13-5 19-15 16-28z" fill={colors.bloom} /> : null}
                <path d="M64 24c12 12 13 24 0 36-13-12-12-24 0-36z" fill={colors.accent} />
              </g>
            ) : null}
            {showFullBloom ? (
              <g fill={colors.bloom} opacity="0.72">
                <circle cx="42" cy="24" r="3" />
                <circle cx="86" cy="24" r="3" />
                <circle cx="92" cy="47" r="2.5" />
              </g>
            ) : null}
          </g>
        ) : null}
      </g>
    </svg>
  );
}
