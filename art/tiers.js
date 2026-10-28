/**
 * 自动变祖器 (auto ancestor-transformer) — six-tier sticker artwork.
 *
 * Each `svg` value is the INNER markup for `<svg viewBox="0 0 120 120">`.
 * One original cartoon everyman (not a likeness of any real person):
 *   head cx=60 cy=44 r=19, short black hair, thin rectangular glasses,
 *   shoulders at y=61, robe/torso hem at y=110 — identical geometry in all
 *   six tiers, so the progression reads as one person levelling up and only
 *   the costume, aura and tiny expression accents change.
 *
 * Style rules honored here: flat vector, no <defs>, no ids (nothing to
 * collide with when all six are inlined), no <text>, no filters, no external
 * URLs. Each tier keeps to ~3-5 palette colors.
 */

const SKIN = '#F7C9A5';
const INK = '#2B2B35';
const GLASS = '#3B3B47';
const MOUTH = '#8A4D45';

const G = (...parts) => parts.join('');

/** Shared body: neck/shoulders at y=61, flared hem at y=110. */
const TORSO = (fill) =>
  `<path d="M46 61 L46 69 C46 72 39 74 36 79 C34 83 33 95 33 110 L87 110 C87 95 86 83 84 79 C81 74 74 72 74 69 L74 61 Z" fill="${fill}"/>`;

/** Shared short black hair with a wavy fringe. */
const HAIR = `<path d="M41 46 C41 30.5 49 22 60 22 C71 22 79 30.5 79 46 C77 38 74 34.5 68 34.5 C63.5 37 60.5 37 56 35 C52 33 47 33.5 44.5 37.5 C42.5 40.5 41.5 43 41 46 Z" fill="${INK}"/>`;

/** Shared head + ears + hair. */
const HEAD = G(
  `<circle cx="42" cy="49.5" r="4.5" fill="${SKIN}"/>`,
  `<circle cx="78" cy="49.5" r="4.5" fill="${SKIN}"/>`,
  `<circle cx="60" cy="44" r="19" fill="${SKIN}"/>`,
  HAIR,
);

/** Shared thin rectangular glasses (rect lenses + bridge + temples). */
const GLASSES = G(
  `<rect x="43.5" y="42" width="14.5" height="12" rx="5" fill="none" stroke="${GLASS}" stroke-width="2.2"/>`,
  `<rect x="61.5" y="42" width="14.5" height="12" rx="5" fill="none" stroke="${GLASS}" stroke-width="2.2"/>`,
  `<path d="M58 48 L61.5 48" stroke="${GLASS}" stroke-width="2.2"/>`,
  `<path d="M43.5 46.5 L41.2 47.8" stroke="${GLASS}" stroke-width="2" stroke-linecap="round"/>`,
  `<path d="M76 46.5 L78.8 47.8" stroke="${GLASS}" stroke-width="2" stroke-linecap="round"/>`,
);

const BROWS = {
  flat: `<path d="M46 40.5 Q50.5 38.5 55 40 M65 40 Q69.5 38.5 74 40.5" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  worried: `<path d="M46 41 Q50.5 40.2 55 38.8 M65 38.8 Q69.5 40.2 74 41" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  smirk: `<path d="M46 40.5 Q50.5 38.5 55 40 M65 39 Q69.5 36.8 74 39.2" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  stern: `<path d="M46 38.8 Q50.5 40.2 55 40.2 M65 40.2 Q69.5 40.2 74 38.8" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
};

const EYES = {
  open: `<circle cx="50.75" cy="48.5" r="3.2" fill="${INK}"/><circle cx="68.75" cy="48.5" r="3.2" fill="${INK}"/>`,
  closed: `<path d="M47 48.5 Q50.75 45.8 54.5 48.5 M65 48.5 Q68.75 45.8 72.5 48.5" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
};

const MOUTHS = {
  flat: `<path d="M56 57.3 L64 57.3" stroke="${MOUTH}" stroke-width="2" stroke-linecap="round"/>`,
  frown: `<path d="M55.5 58.2 Q60 55.6 64.5 58.2" stroke="${MOUTH}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  smirk: `<path d="M55.5 57 Q59.5 59.6 65 56.2" stroke="${MOUTH}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  smile: `<path d="M56.5 56.8 Q60 59.2 63.5 56.8" stroke="${MOUTH}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
};

const FACE = ({ brows = 'flat', eyes = 'open', mouth = 'flat' } = {}) =>
  G(BROWS[brows], EYES[eyes], GLASSES, MOUTHS[mouth]);

const TIERS = [
  {
    id: 'xiaonanliang',
    name: '小难梁',
    // Tier 1 — struggling student: crumpled blue hoodie, wild hair, eye bags,
    // cheek plaster, worried brows and a small frown.
    svg: G(
      `<circle cx="60" cy="62" r="44" fill="#8C96C8" opacity=".12"/>`,
      TORSO('#7C86C0'),
      `<path d="M45 60 C45 73 37 76 34.5 87 C47 81 73 81 85.5 87 C83 76 75 73 75 60 C69 67 51 67 45 60 Z" fill="#9AA4D8"/>`,
      `<path d="M48 91 L72 91 L68.5 103 L51.5 103 Z" fill="#9AA4D8"/>`,
      `<path d="M54 66 L52.5 79" stroke="#E7EAF7" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M66 66 L67.5 79" stroke="#E7EAF7" stroke-width="2" stroke-linecap="round"/>`,
      `<circle cx="52" cy="80" r="1.9" fill="#E7EAF7"/>`,
      `<circle cx="68" cy="80" r="1.9" fill="#E7EAF7"/>`,
      `<path d="M37.5 92 L41.5 96" stroke="#6C77AF" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M82.5 92 L78.5 96" stroke="#6C77AF" stroke-width="2" stroke-linecap="round"/>`,
      HEAD,
      `<path d="M46 30 L42 21 M52 26 L49.5 17 M68 26 L70.5 17 M74 30 L78 21" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
      FACE({ brows: 'worried', mouth: 'frown' }),
      `<path d="M47 55.2 Q50.75 57.2 54.5 55.2" stroke="#8C96C8" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      `<path d="M65 55.2 Q68.75 57.2 72.5 55.2" stroke="#8C96C8" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      `<g transform="rotate(-10 69.5 56.5)"><rect x="66.2" y="54.6" width="6.6" height="3.8" rx="1.9" fill="#FBE3C4"/><rect x="68.1" y="54.6" width="2.4" height="3.8" fill="#E8A87C"/></g>`,
    ),
  },
  {
    id: 'laoliang',
    name: '牢梁',
    // Tier 2 — junior worker: light checked shirt, orange lanyard with ID
    // badge, upright posture, tired flat mouth.
    svg: G(
      `<circle cx="60" cy="62" r="44" fill="#4E79B8" opacity=".08"/>`,
      TORSO('#E4EEFA'),
      `<rect x="44" y="73" width="5" height="35" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<rect x="57" y="73" width="5" height="35" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<rect x="70" y="73" width="5" height="35" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<rect x="38" y="77" width="44" height="5" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<rect x="36" y="89" width="48" height="5" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<rect x="34" y="101" width="52" height="5" rx="1" fill="#5E86C4" opacity=".5"/>`,
      `<path d="M51.5 63 L57 84" stroke="#E4572E" stroke-width="3.2" stroke-linecap="round"/>`,
      `<path d="M68.5 63 L63 84" stroke="#E4572E" stroke-width="3.2" stroke-linecap="round"/>`,
      `<rect x="52.5" y="83" width="15" height="18" rx="3" fill="#F7FAFF"/>`,
      `<rect x="52.5" y="83" width="15" height="5" rx="2" fill="#3E6FA8"/>`,
      `<path d="M55.5 92 L64.5 92 M55.5 96 L61.5 96" stroke="#9FB3CE" stroke-width="1.6" stroke-linecap="round"/>`,
      HEAD,
      FACE({ brows: 'flat', mouth: 'flat' }),
    ),
  },
  {
    id: 'liangzi',
    name: '梁子',
    // Tier 3 — middle manager: navy suit, lighter lapels, white shirt V,
    // red tie, pocket square, confident raised brow + smirk.
    svg: G(
      TORSO('#2F3B57'),
      `<path d="M60 63 L52.5 69 L58 84 L62 84 L67.5 69 Z" fill="#F4F7FC"/>`,
      `<path d="M47 61.5 L60 63 L52.5 82 L46 71 Z" fill="#3D4C6F"/>`,
      `<path d="M73 61.5 L60 63 L67.5 82 L74 71 Z" fill="#3D4C6F"/>`,
      `<path d="M60 67.5 L56 71.5 L60 86 L64 71.5 Z" fill="#D64545"/>`,
      `<path d="M56.8 64 L63.2 64 L64 68 L56 68 Z" fill="#B93A3A"/>`,
      `<path d="M66.5 88 L76 88 L76 92 L66.5 92 Z" fill="#F4F7FC"/>`,
      HEAD,
      FACE({ brows: 'smirk', mouth: 'smirk' }),
    ),
  },
  {
    id: 'liangsheng',
    name: '梁圣',
    // Tier 5 — saint: white robe with wide sleeves and gold trim, golden
    // halo with rays, closed serene eyes, gentle smile.
    svg: G(
      `<circle cx="60" cy="54" r="47" fill="#F5D06A" opacity=".15"/>`,
      `<path d="M60 10 L60 4.5 M71.3 14.7 L75.2 10.8 M76 26 L81.5 26 M48.7 14.7 L44.8 10.8 M44 26 L38.5 26 M60 42 L60 47.5 M71.3 37.3 L75.2 41.2 M48.7 37.3 L44.8 41.2" stroke="#F2C94C" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="60" cy="26" r="13" fill="none" stroke="#F2C94C" stroke-width="3"/>`,
      TORSO('#FFFFFF'),
      `<path d="M37 80 C28 83 25 96 25 108 L33 108 L33 90 Z" fill="#FFFFFF"/>`,
      `<path d="M83 80 C92 83 95 96 95 108 L87 108 L87 90 Z" fill="#FFFFFF"/>`,
      `<path d="M37 80 C28 83 25 96 25 108" stroke="#E8C86A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
      `<path d="M83 80 C92 83 95 96 95 108" stroke="#E8C86A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
      `<path d="M47 62 L60 74 L73 62" stroke="#E8C86A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M36 94 L84 94" stroke="#E8C86A" stroke-width="3.5"/>`,
      `<path d="M25.5 104 L32.5 104" stroke="#E8C86A" stroke-width="3"/>`,
      `<path d="M94.5 104 L87.5 104" stroke="#E8C86A" stroke-width="3"/>`,
      HEAD,
      FACE({ eyes: 'closed', mouth: 'smile' }),
    ),
  },
  {
    id: 'liangshen',
    name: '梁神',
    // Tier 4 — tech sage: black high-neck sweater, faint cyan halo ring and
    // sparkles, glowing chest diamond, calm smile.
    svg: G(
      `<circle cx="60" cy="58" r="46" fill="#5AD7E0" opacity=".09"/>`,
      `<circle cx="60" cy="26" r="12" fill="none" stroke="#7FE3E8" stroke-width="2.5" opacity=".7"/>`,
      TORSO('#1E2027'),
      `<path d="M50.5 68 C50.5 55 69.5 55 69.5 68 L69.5 70 L50.5 70 Z" fill="#2A2D38"/>`,
      `<path d="M34 105 L86 105" stroke="#2A2D38" stroke-width="3"/>`,
      `<path d="M60 80 L65 87 L60 94 L55 87 Z" fill="#7FE3E8" opacity=".9"/>`,
      HEAD,
      `<path d="M85 35 L86.3 38.2 L89.5 39.5 L86.3 40.8 L85 44 L83.7 40.8 L80.5 39.5 L83.7 38.2 Z" fill="#BFF6F8" opacity=".9"/>`,
      `<path d="M34 38 L34.9 40.1 L37 41 L34.9 41.9 L34 44 L33.1 41.9 L31 41 L33.1 40.1 Z" fill="#BFF6F8" opacity=".7"/>`,
      FACE({ mouth: 'smile' }),
    ),
  },
  {
    id: 'liangzu',
    name: '梁祖',
    // Tier 6 — ancestor emperor: red-gold ornate robe with darker sleeves,
    // radiant glow, long white beard, stern brows and a 冕旒 board crown with
    // hanging bead strings.
    svg: G(
      `<circle cx="60" cy="56" r="52" fill="#F6C453" opacity=".12"/>`,
      `<circle cx="60" cy="56" r="40" fill="#F6C453" opacity=".12"/>`,
      TORSO('#A52B2B'),
      `<path d="M37 80 C26 82 22 96 22 108 L33 108 L33 90 Z" fill="#8C2323"/>`,
      `<path d="M83 80 C94 82 98 96 98 108 L87 108 L87 90 Z" fill="#8C2323"/>`,
      `<path d="M47 62 L60 74 L73 62" stroke="#EFC55C" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M36 92 L84 92" stroke="#EFC55C" stroke-width="3"/>`,
      `<path d="M33.4 105 C33.6 108 33.8 109 34.2 110 L85.8 110 C86.2 109 86.4 108 86.6 105 Z" fill="#EFC55C"/>`,
      `<circle cx="43" cy="98" r="2.4" fill="#EFC55C"/>`,
      `<circle cx="60" cy="101" r="2.4" fill="#EFC55C"/>`,
      `<circle cx="77" cy="98" r="2.4" fill="#EFC55C"/>`,
      `<path d="M22.5 104 L32.5 104" stroke="#EFC55C" stroke-width="3"/>`,
      `<path d="M97.5 104 L87.5 104" stroke="#EFC55C" stroke-width="3"/>`,
      HEAD,
      FACE({ brows: 'stern', mouth: 'flat' }),
      `<path d="M50 54.5 C50 68 53 78 60 86 C67 78 70 68 70 54.5 C66 56 54 56 50 54.5 Z" fill="#F4F4F7"/>`,
      `<path d="M54.5 65 C56 72 58 78 60 82" stroke="#DFDFE6" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      `<path d="M65.5 65 C64 72 62 78 60 82" stroke="#DFDFE6" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      `<rect x="39" y="9" width="42" height="6.5" rx="3" fill="#2A2A34"/>`,
      `<rect x="39" y="12.5" width="42" height="3" rx="1.5" fill="#EFC55C"/>`,
      `<path d="M46 15.5 L46 23 C46 24.5 47 25 48 25 L72 25 C73 25 74 24.5 74 23 L74 15.5 Z" fill="#2A2A34"/>`,
      `<rect x="46" y="16.5" width="28" height="4" fill="#EFC55C"/>`,
      `<circle cx="60" cy="18.5" r="2.6" fill="#F6E3A1"/>`,
      `<path d="M42.5 15.5 L42.5 31" stroke="#EFC55C" stroke-width="1.6"/>`,
      `<circle cx="42.5" cy="18" r="2.3" fill="#F2D27A"/>`,
      `<circle cx="42.5" cy="23" r="2.3" fill="#F2D27A"/>`,
      `<circle cx="42.5" cy="28" r="2.3" fill="#F2D27A"/>`,
      `<path d="M77.5 15.5 L77.5 31" stroke="#EFC55C" stroke-width="1.6"/>`,
      `<circle cx="77.5" cy="18" r="2.3" fill="#F2D27A"/>`,
      `<circle cx="77.5" cy="23" r="2.3" fill="#F2D27A"/>`,
      `<circle cx="77.5" cy="28" r="2.3" fill="#F2D27A"/>`,
    ),
  },
];

/** Exported artwork. `svg` is inner markup for `<svg viewBox="0 0 120 120">`. */
export const TIER_ART = TIERS.map(({ id, name, svg }) => ({
  id,
  name,
  svg: `<g>${svg}</g>`,
}));
