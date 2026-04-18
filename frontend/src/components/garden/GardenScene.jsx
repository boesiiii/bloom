import { useNavigate } from "react-router-dom";

const tileWidth = 104;
const tileHeight = 58;
const plotWidth = 66;
const plotHeight = 37;
const grassWidth = 82;
const grassHeight = 46;

const stageScale = {
  seed: 0.27,
  sprout: 0.34,
  growing: 0.41,
  budding: 0.48,
  blooming: 0.55,
  fully_bloomed: 0.62
};

const plantColors = {
  sunflower: { flower: "#e4a72c", accent: "#8b5d2c", leaf: "#4f803f" },
  tulip: { flower: "#d86671", accent: "#b33f4c", leaf: "#4f803f" },
  orchid: { flower: "#a66bb8", accent: "#744982", leaf: "#4c8fa3" },
  cactus: { flower: "#68a676", accent: "#d86671", leaf: "#4f803f" }
};

export default function GardenScene({ people = [] }) {
  const navigate = useNavigate();
  const columns = columnsForCount(people.length);
  const rows = Math.max(1, Math.ceil(Math.max(people.length, 1) / columns));
  const originX = 190;
  const originY = people.length <= 2 ? 170 : 134;
  const sceneHeight = Math.max(300, originY + (columns + rows) * (tileHeight / 2) + 104);
  const plots = people.map((person, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return {
      x: originX + (col - row) * (tileWidth / 2),
      y: originY + (col + row) * (tileHeight / 2),
      person,
      delay: (index % 6) * 0.18
    };
  });

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-[#eef5df] shadow-soft">
      <svg viewBox={`0 0 380 ${sceneHeight}`} className="h-auto w-full" role="img" aria-label="Friendship garden">
        <rect width="380" height={sceneHeight} fill="#eef5df" />
        {plots
          .slice()
          .sort((a, b) => a.y - b.y)
          .map((plot) => (
            <Plot
              key={plot.person.id}
              x={plot.x}
              y={plot.y}
              person={plot.person}
              delay={plot.delay}
              onOpen={() => navigate(`/people/${plot.person.id}`)}
            />
          ))}
      </svg>
    </section>
  );
}

function columnsForCount(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

function Plot({ x, y, person, delay = 0, onOpen }) {
  return (
    <g
      role="link"
      tabIndex="0"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen();
      }}
      className="garden-plot cursor-pointer outline-none"
    >
      <title>{`${person.name}, ${person.plant?.growth ?? person.plant_growth ?? 0} growth`}</title>
      <IsoTile x={x} y={y} muted={Boolean(person.disconnection_streak)} />
      <PlantSprite x={x} y={y} person={person} delay={delay} />
    </g>
  );
}

function IsoTile({ x, y, muted }) {
  const grassLeft = x - grassWidth / 2;
  const grassRight = x + grassWidth / 2;
  const grassTop = y - grassHeight / 2;
  const grassBottom = y + grassHeight / 2;
  const left = x - plotWidth / 2;
  const right = x + plotWidth / 2;
  const top = y - plotHeight / 2;
  const bottom = y + plotHeight / 2;

  return (
    <g>
      <ellipse cx={x + 3} cy={y + 13} rx="36" ry="14" fill="#4f6d3f" opacity="0.1" />
      <path
        d={`M ${x} ${grassTop} L ${grassRight} ${y} L ${x} ${grassBottom} L ${grassLeft} ${y} Z`}
        fill={muted ? "#9cb86f" : "#afd07b"}
        stroke="#7eaa58"
        strokeWidth="1.4"
      />
      <path d={`M ${grassRight} ${y} L ${grassRight} ${y + 5} L ${x} ${grassBottom + 5} L ${x} ${grassBottom} Z`} fill="#7fa95e" opacity="0.8" />
      <path d={`M ${grassLeft} ${y} L ${x} ${grassBottom} L ${x} ${grassBottom + 5} L ${grassLeft} ${y + 5} Z`} fill="#8eb867" opacity="0.82" />
      <GrassTufts x={x} y={y} muted={muted} />
      <path
        d={`M ${x} ${top} L ${right} ${y} L ${x} ${bottom} L ${left} ${y} Z`}
        fill={muted ? "#a47455" : "#b87955"}
        stroke="#8f5c3f"
        strokeWidth="1.8"
      />
      <path d={`M ${right} ${y} L ${right} ${y + 6} L ${x} ${bottom + 6} L ${x} ${bottom} Z`} fill="#8f5c3f" opacity="0.75" />
      <path d={`M ${left} ${y} L ${x} ${bottom} L ${x} ${bottom + 6} L ${left} ${y + 6} Z`} fill="#9f6847" opacity="0.75" />
      <g stroke="#7e5239" strokeWidth="1.4" opacity={muted ? "0.34" : "0.46"}>
        <path d={`M ${x - 18} ${y - 1} l 31 -16`} />
        <path d={`M ${x - 9} ${y + 5} l 33 -17`} />
        <path d={`M ${x} ${y + 10} l 28 -15`} />
      </g>
    </g>
  );
}

function GrassTufts({ x, y, muted }) {
  const opacity = muted ? 0.42 : 0.72;
  const stroke = muted ? "#6f8f53" : "#4f883c";
  const tufts = [
    { dx: -25, dy: -5, flip: -1 },
    { dx: 24, dy: -6, flip: 1 },
    { dx: -17, dy: 14, flip: -1 },
    { dx: 19, dy: 13, flip: 1 }
  ];

  return (
    <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity={opacity}>
      {tufts.map((tuft) => (
        <g key={`${tuft.dx}-${tuft.dy}`} transform={`translate(${x + tuft.dx} ${y + tuft.dy}) scale(${tuft.flip} 1)`}>
          <path d="M 0 3 C 1 0 3 -2 5 -4" />
          <path d="M 0 3 C -1 0 -2 -2 -3 -5" />
          <path d="M 0 3 C 2 1 4 1 7 0" />
        </g>
      ))}
    </g>
  );
}

function PlantSprite({ x, y, person, delay = 0 }) {
  const plantType = person.plant_type;
  const colors = plantColors[plantType] || plantColors.tulip;
  const stage = person.plant?.growth_stage || "seed";
  const disconnection = person.disconnection_streak || person.plant?.disconnection_streak || 0;
  const needsRestart = Boolean(person.plant?.needs_restart);
  const scale = needsRestart ? 0.28 : stageScale[stage] || 0.42;
  const opacity = needsRestart ? 0.58 : disconnection ? Math.max(0.5, 1 - disconnection * 0.05) : 1;
  const tilt = disconnection ? -Math.min(9, 3 + disconnection) : 0;

  return (
    <g className="garden-plant-bounce" style={{ "--plant-bounce-delay": `${delay}s` }}>
      <g transform={`translate(${x - 2} ${y - 10}) scale(${scale}) rotate(${tilt})`} opacity={opacity}>
        {stage === "seed" || needsRestart ? <Seed colors={colors} /> : plantType === "cactus" ? <Cactus colors={colors} stage={stage} /> : <Flower colors={colors} stage={stage} plantType={plantType} />}
        {disconnection ? <path d="M -15 7 q 15 -6 30 0" stroke="#8b7b68" strokeWidth="3" fill="none" opacity="0.5" /> : null}
      </g>
    </g>
  );
}

function Seed({ colors }) {
  return (
    <g>
      <ellipse cx="0" cy="15" rx="18" ry="5" fill="#7d5b3f" opacity="0.25" />
      <ellipse cx="0" cy="8" rx="8" ry="5" fill={colors.accent} />
    </g>
  );
}

function Flower({ colors, stage, plantType }) {
  const hasSecondLeaf = ["growing", "budding", "blooming", "fully_bloomed"].includes(stage);
  const hasBloom = ["budding", "blooming", "fully_bloomed"].includes(stage);
  const full = stage === "fully_bloomed";
  const bloomSize = full ? 1.12 : stage === "budding" ? 0.66 : 0.94;

  return (
    <g>
      <path d="M 0 20 V -24" stroke={colors.leaf} strokeWidth="5" strokeLinecap="round" />
      <path d="M -1 -1 C -18 -2 -24 -11 -27 -21 C -11 -22 -2 -15 3 -5" fill={colors.leaf} />
      {hasSecondLeaf ? <path d="M 3 5 C 20 1 27 -8 29 -19 C 12 -20 3 -11 -3 2" fill={colors.leaf} /> : null}
      {hasBloom ? (
        <g transform={`translate(0 -31) scale(${bloomSize})`}>
          {plantType === "sunflower" ? (
            <g>
              {Array.from({ length: full ? 12 : 8 }, (_, index) => (
                <ellipse key={index} cx="0" cy="-13" rx="4.5" ry="9.5" fill={colors.flower} transform={`rotate(${index * (full ? 30 : 45)})`} />
              ))}
              <circle r="10" fill={colors.flower} />
              <circle r="5.5" fill={colors.accent} />
            </g>
          ) : plantType === "orchid" ? (
            <g>
              <ellipse cx="0" cy="-4" rx="10" ry="15" fill={colors.flower} />
              <ellipse cx="-12" cy="5" rx="10" ry="7" fill={colors.flower} transform="rotate(-28 -12 5)" />
              <ellipse cx="12" cy="5" rx="10" ry="7" fill={colors.flower} transform="rotate(28 12 5)" />
              <circle cy="5" r="5" fill={colors.accent} />
            </g>
          ) : (
            <g>
              <path d="M -12 -5 C -15 -19 0 -23 0 4 C -7 0 -10 -2 -12 -5 Z" fill={colors.flower} />
              <path d="M 12 -5 C 15 -19 0 -23 0 4 C 7 0 10 -2 12 -5 Z" fill={colors.flower} />
              <path d="M 0 -18 C 12 -5 9 8 0 15 C -9 8 -12 -5 0 -18 Z" fill={colors.accent} />
            </g>
          )}
        </g>
      ) : null}
    </g>
  );
}

function Cactus({ colors, stage }) {
  const hasArms = ["growing", "budding", "blooming", "fully_bloomed"].includes(stage);
  const hasBloom = ["budding", "blooming", "fully_bloomed"].includes(stage);
  const full = stage === "fully_bloomed";

  return (
    <g>
      <path d="M 0 20 V -28" stroke={colors.leaf} strokeWidth="11" strokeLinecap="round" />
      {hasArms ? <path d="M -5 -1 C -24 -2 -25 -18 -23 -28" stroke={colors.leaf} strokeWidth="7" strokeLinecap="round" fill="none" /> : null}
      {hasArms ? <path d="M 6 8 C 24 5 25 -13 24 -24" stroke={colors.leaf} strokeWidth="7" strokeLinecap="round" fill="none" /> : null}
      {hasBloom ? <circle cx="12" cy="-32" r={full ? "7" : "5"} fill={colors.accent} /> : null}
    </g>
  );
}
