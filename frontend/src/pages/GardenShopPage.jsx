import { Check, Coins, Lock, Sparkles, Store } from "lucide-react";
import { useMemo, useState } from "react";

import Card from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";

const STORAGE_KEY = "bloom_garden_shop";
const STARTING_COINS = 360;

const decorations = [
  {
    id: "bench",
    name: "Garden bench",
    price: 80,
    description: "A quiet place for warm memories.",
    tone: "clay"
  },
  {
    id: "butterflies",
    name: "Butterflies",
    price: 65,
    description: "Small movement around blooming plots.",
    tone: "water"
  },
  {
    id: "fountain",
    name: "Stone fountain",
    price: 140,
    description: "A calm centerpiece for the garden.",
    tone: "water"
  },
  {
    id: "pumpkin",
    name: "Pumpkin patch",
    price: 55,
    description: "Seasonal color near the tiles.",
    tone: "sun"
  },
  {
    id: "scarecrow",
    name: "Scarecrow",
    price: 95,
    description: "A playful guardian for the plots.",
    tone: "leaf"
  },
  {
    id: "lights",
    name: "String lights",
    price: 120,
    description: "Soft glow for evening check-ins.",
    tone: "sun"
  }
];

export default function GardenShopPage() {
  const [shopState, setShopState] = useState(loadShopState);
  const toast = useToast();
  const owned = useMemo(() => new Set(shopState.owned), [shopState.owned]);

  function buyDecoration(decoration) {
    if (owned.has(decoration.id) || shopState.coins < decoration.price) return;

    const next = {
      coins: shopState.coins - decoration.price,
      owned: [...shopState.owned, decoration.id]
    };
    saveShopState(next);
    setShopState(next);
    toast.success(`${decoration.name} bought. Garden placement coming soon.`);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-leaf-100 bg-leaf-50 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/85 text-leaf-700">
              <Store className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-leaf-700">Garden shop</p>
              <h1 className="text-2xl font-bold leading-tight text-stone-950">Decorations</h1>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sun-100 px-3 py-2 text-sm font-bold text-stone-900">
            <Coins className="h-4 w-4 text-sun-500" aria-hidden="true" />
            {shopState.coins}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <MiniShopStat label="Owned" value={owned.size} />
          <MiniShopStat label="Available" value={decorations.length} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {decorations.map((decoration) => (
          <DecorationCard
            key={decoration.id}
            decoration={decoration}
            owned={owned.has(decoration.id)}
            canBuy={shopState.coins >= decoration.price}
            onBuy={() => buyDecoration(decoration)}
          />
        ))}
      </section>
    </div>
  );
}

function MiniShopStat({ label, value }) {
  return (
    <div className="rounded-md bg-white/70 p-2">
      <strong className="block text-lg leading-5 text-stone-950">{value}</strong>
      <span className="mt-1 block text-xs font-semibold text-stone-600">{label}</span>
    </div>
  );
}

function DecorationCard({ decoration, owned, canBuy, onBuy }) {
  const buttonClass = owned
    ? "border-leaf-100 bg-leaf-100 text-leaf-700"
    : canBuy
      ? "border-leaf-700 bg-leaf-700 text-white"
      : "border-stone-200 bg-stone-100 text-stone-500";

  return (
    <Card className="flex min-h-[250px] flex-col p-3">
      <div className={`grid h-28 place-items-center rounded-lg ${previewBackground(decoration.tone)}`}>
        <DecorationPreview id={decoration.id} />
      </div>
      <div className="mt-3 min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-stone-950">{decoration.name}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">{decoration.description}</p>
      </div>
      <button
        type="button"
        onClick={onBuy}
        disabled={owned || !canBuy}
        className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold ${buttonClass}`}
      >
        {owned ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" />
            Add soon
          </>
        ) : canBuy ? (
          <>
            <Coins className="h-4 w-4" aria-hidden="true" />
            Buy {decoration.price}
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Need coins
          </>
        )}
      </button>
    </Card>
  );
}

function previewBackground(tone) {
  const styles = {
    clay: "bg-clay-100/55",
    leaf: "bg-leaf-100/70",
    sun: "bg-sun-100/65",
    water: "bg-water-100/70"
  };
  return styles[tone] || styles.leaf;
}

function DecorationPreview({ id }) {
  if (id === "bench") return <BenchPreview />;
  if (id === "butterflies") return <ButterflyPreview />;
  if (id === "fountain") return <FountainPreview />;
  if (id === "pumpkin") return <PumpkinPreview />;
  if (id === "scarecrow") return <ScarecrowPreview />;
  return <LightsPreview />;
}

function BenchPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="Garden bench">
      <path d="M26 62 L52 49 L88 64 L61 79 Z" fill="#d8ddc5" />
      <path d="M30 49 L79 70" stroke="#c87951" strokeWidth="8" strokeLinecap="round" />
      <path d="M24 59 L72 80" stroke="#a76242" strokeWidth="8" strokeLinecap="round" />
      <path d="M35 62 V82 M78 72 V91" stroke="#7d5b3f" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function ButterflyPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="Butterflies">
      <Butterfly x="38" y="42" color="#a66bb8" />
      <Butterfly x="70" y="35" color="#e4a72c" scale="0.82" />
      <Butterfly x="63" y="62" color="#d86671" scale="0.72" />
      <path d="M22 74 C 38 65 55 78 88 66" stroke="#7eaa58" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Butterfly({ x, y, color, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-8" cy="-4" rx="9" ry="12" fill={color} opacity="0.88" transform="rotate(-28 -8 -4)" />
      <ellipse cx="8" cy="-4" rx="9" ry="12" fill={color} opacity="0.88" transform="rotate(28 8 -4)" />
      <ellipse cx="-6" cy="8" rx="6" ry="8" fill={color} opacity="0.72" transform="rotate(24 -6 8)" />
      <ellipse cx="6" cy="8" rx="6" ry="8" fill={color} opacity="0.72" transform="rotate(-24 6 8)" />
      <path d="M0 -13 V 13" stroke="#5f4b42" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function FountainPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="Stone fountain">
      <ellipse cx="56" cy="75" rx="35" ry="10" fill="#9db8bd" />
      <path d="M25 69 C 35 84 77 84 87 69 L81 84 C 70 91 42 91 31 84 Z" fill="#78969d" />
      <path d="M44 45 H68 L64 67 H48 Z" fill="#b8c9c7" />
      <ellipse cx="56" cy="45" rx="19" ry="6" fill="#d5e1de" />
      <path d="M56 18 C 47 31 45 38 56 43 C 67 38 65 31 56 18 Z" fill="#4c8fa3" opacity="0.68" />
      <path d="M45 34 C 33 37 30 47 37 54 M67 34 C 79 37 82 47 75 54" stroke="#4c8fa3" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function PumpkinPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="Pumpkin patch">
      <path d="M52 34 C 51 25 58 22 64 19" stroke="#4f803f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="45" cy="58" rx="19" ry="24" fill="#d98335" />
      <ellipse cx="67" cy="58" rx="19" ry="24" fill="#d98335" />
      <ellipse cx="56" cy="58" rx="21" ry="27" fill="#e4a72c" />
      <path d="M56 34 C 49 46 49 70 56 83 M56 34 C 64 47 64 70 56 83" stroke="#c87951" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M28 77 C 42 70 62 82 84 72" stroke="#5f8f47" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ScarecrowPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="Scarecrow">
      <path d="M56 35 V86" stroke="#7d5b3f" strokeWidth="5" strokeLinecap="round" />
      <path d="M27 49 H85" stroke="#7d5b3f" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 48 L56 37 L74 48 L66 68 H46 Z" fill="#e4a72c" />
      <circle cx="56" cy="26" r="12" fill="#d6b087" />
      <path d="M39 22 H73 L66 12 H46 Z" fill="#8b5d2c" />
      <path d="M35 24 H77" stroke="#8b5d2c" strokeWidth="5" strokeLinecap="round" />
      <path d="M51 26 H52 M60 26 H61 M51 32 C 55 35 59 35 63 32" stroke="#5f4b42" strokeWidth="2.3" strokeLinecap="round" fill="none" />
      <Sparkles className="h-4 w-4 text-sun-500" x="78" y="26" />
    </svg>
  );
}

function LightsPreview() {
  return (
    <svg viewBox="0 0 112 96" className="h-24 w-28" role="img" aria-label="String lights">
      <path d="M24 30 C 42 48 70 48 88 30" stroke="#7d5b3f" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[34, 48, 64, 78].map((x, index) => (
        <g key={x}>
          <path d={`M${x} ${40 + (index % 2) * 3} V ${52 + (index % 2) * 3}`} stroke="#7d5b3f" strokeWidth="2" />
          <circle cx={x} cy={57 + (index % 2) * 3} r="6" fill={index % 2 ? "#e4a72c" : "#fff1bc"} />
        </g>
      ))}
      <path d="M25 76 C 43 68 62 82 86 70" stroke="#5f8f47" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function loadShopState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.owned) && Number.isFinite(saved.coins)) return saved;
  } catch {
    // Use a fresh prototype wallet when local storage is unavailable.
  }
  return { coins: STARTING_COINS, owned: [] };
}

function saveShopState(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Prototype purchases can still work for the current session.
  }
}
