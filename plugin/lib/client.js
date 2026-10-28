window.__ModuleLoader__.load({
  id: 'dsh-plugin-auto-lwf-sr',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React

    /* Six-panel meme sprite (180px per panel, identical square crops). */
    const MEME_SPRITE = ''

    /* Original six-tier artwork (MIT). Used when no meme sprite is embedded. */

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

const ART_TIERS = [
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
const TIER_ART = ART_TIERS.map(({ id, name, svg }) => ({
  id,
  name,
  svg: `<g>${svg}</g>`,
}));

    const ROUTE = '/api/auto-lwf-sr/snapshot'

    const TIERS = [
      { id: 'xiaonanliang', name: '小难梁', tagline: '勉强能跑，别问好不好用', enTagline: 'barely running', accent: '#8A93A8' },
      { id: 'laoliang', name: '牢梁', tagline: '能用，但也只限于能用', enTagline: 'it works, that is all', accent: '#5C7CA8' },
      { id: 'liangzi', name: '梁子', tagline: '稳中有升，值得处', enTagline: 'steady and rising', accent: '#3F5F8C' },
      { id: 'liangshen', name: '梁神', tagline: '发挥稳定，封神在望', enTagline: 'on the way to godhood', accent: '#2FB6C6' },
      { id: 'liangsheng', name: '梁圣', tagline: '业界标杆，圣光普照', enTagline: 'the industry standard', accent: '#D9A441' },
      { id: 'liangzu', name: '梁祖', tagline: '万祖归一，祖上显灵', enTagline: 'all ancestors, one throne', accent: '#C0392B' },
    ]
    const VARIANT_HINTS = {
      'DeepSeek V4 Pro': 'DeepSeek V4 Pro 0813 (max)',
      'DeepSeek V4.1 Flash': 'DeepSeek V4.1 Flash 1017 (max)',
    }

    const STATUS_LABELS = {
      operational: ['运行正常', 'operational'],
      maintenance: ['计划维护', 'maintenance'],
      degraded: ['性能下降', 'degraded'],
      partial_outage: ['部分中断', 'partial outage'],
      full_outage: ['全面中断', 'full outage'],
    }

    function statusLabel(level, locale) {
      const entry = STATUS_LABELS[level] || STATUS_LABELS.operational
      return locale === 'zh' ? entry[0] : entry[1]
    }

    function statusColor(level) {
      if (level === 'operational') return 'var(--dsw-alias-state-success-primary)'
      if (level === 'maintenance' || level === 'degraded') return 'var(--dsw-alias-state-warn-primary)'
      return 'var(--dsw-alias-state-error-primary)'
    }

    const TIER_STARTS = [0, 18, 34, 50, 66, 82]
    const TIER_SPANS = [18, 16, 16, 16, 16, 18]

    const T = {
      bg: 'var(--dsw-alias-bg-layer-1)',
      bg2: 'var(--dsw-alias-bg-layer-2)',
      overlay: 'var(--dsw-alias-bg-overlay)',
      border: 'var(--dsw-alias-border-l1)',
      border2: 'var(--dsw-alias-border-l2)',
      text: 'var(--dsw-alias-label-primary)',
      dim: 'var(--dsw-alias-label-secondary)',
      brand: 'var(--dsw-alias-brand-primary)',
      ok: 'var(--dsw-alias-state-success-primary)',
      warn: 'var(--dsw-alias-state-warn-primary)',
      err: 'var(--dsw-alias-state-error-primary)',
      idle: 'var(--dsw-alias-state-idle-primary)',
    }

    const FONT = 'inherit'
    const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

    const TEXT = {
      zh: {
        title: '自动变祖器',
        score: '变祖指数',
        open: '查看变祖器',
        close: '收起',
        refresh: '刷新',
        refreshing: '刷新中',
        warmup: '预热中',
        warmupHint: '正在读取 status.deepseek.com、Artificial Analysis 与 OpenRouter',
        failed: '拉取失败',
        retry: '重试',
        updated: '更新于',
        nextPrefix: '距「',
        nextSuffix: '」还差',
        maxed: '已到顶：梁祖',
        dragHint: '拖动滑片试滑，松手自动回位',
        preview: '试滑',
        tabs: ['因子', '评分', '价格', '走势'],
        stability: '稳定度',
        quality: '实力',
        price: '价格',
        uptime: '可用率',
        statusGrade: '分级',
        composite: '综合',
        cheaper: '便宜',
        last24h: '近24h',
        incidents: '活跃事故',
        frontier: '前沿',
        percentile: '百分位',
        peerMedian: '同行中位',
        cheaper: '更便宜',
        scoreBoard: '评分对照',
        priceBoard: '百万 token 价格',
        trend: '最近走势',
        min: '最低',
        max: '最高',
        now: '当前',
        sources: '数据源',
        settings: '设置',
        back: '返回',
        settingMode: '显示形式',
        settingSize: '立绘大小',
        settingSizeHint: '仅「头像」模式生效，拖动滑杆实时预览',
        settingSizePillHint: '切到「头像」模式后可调整立绘大小',
        settingPosition: '位置',
        resetPosition: '重置位置',
        dragHintWidget: '直接拖动右下角立绘/胶囊即可移动，位置会记住',
        settingsNote: '设置保存在本机 localStorage，不会同步到其他设备。',
        modePill: '胶囊',
        modeSticker: '头像',
        modePillHint: '胶囊：立绘＋档名＋分数',
        modeStickerHint: '头像：只显示 PNG 立绘（透明背景）',
        degraded: '部分数据源降级，沿用上次成功值',
        perMillion: '/M',
        pts: '分',
        tabEmpty: '暂无数据',
      },
      en: {
        title: 'Auto Ancestor Slider',
        score: 'ancestor index',
        open: 'open the slider',
        close: 'collapse',
        refresh: 'refresh',
        refreshing: 'refreshing',
        warmup: 'warming up',
        warmupHint: 'reading status.deepseek.com, Artificial Analysis and OpenRouter',
        failed: 'fetch failed',
        retry: 'retry',
        updated: 'updated',
        nextPrefix: '',
        nextSuffix: 'to',
        maxed: 'maxed out: 梁祖',
        dragHint: 'drag the slider to preview, it snaps back on release',
        preview: 'preview',
        tabs: ['factors', 'scores', 'prices', 'trend'],
        stability: 'stability',
        quality: 'quality',
        price: 'price',
        uptime: 'uptime',
        statusGrade: 'grade',
        composite: 'blended',
        cheaper: 'cheaper',
        last24h: '24h',
        incidents: 'live incidents',
        frontier: 'frontier',
        percentile: 'percentile',
        peerMedian: 'peer median',
        cheaper: 'cheaper',
        scoreBoard: 'Intelligence',
        priceBoard: 'Price / 1M tokens',
        trend: 'recent trend',
        min: 'min',
        max: 'max',
        now: 'now',
        sources: 'sources',
        settings: 'settings',
        back: 'back',
        settingMode: 'display',
        settingSize: 'artwork size',
        settingSizeHint: 'only applies to avatar mode; drag the slider to preview',
        settingSizePillHint: 'switch to avatar mode to resize the artwork',
        settingPosition: 'position',
        resetPosition: 'reset',
        dragHintWidget: 'drag the artwork or pill to move it; the position is remembered',
        settingsNote: 'Saved in this device\'s localStorage; not synced.',
        modePill: 'pill',
        modeSticker: 'avatar',
        modePillHint: 'pill: art + tier + score',
        modeStickerHint: 'avatar: PNG art only, transparent background',
        degraded: 'a source is degraded; last good value kept',
        perMillion: '/M',
        pts: 'pts',
        tabEmpty: 'no data',
      },
    }

    const STYLE = [
      '@keyframes lwf-pop{0%{transform:scale(.86);opacity:.35}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}',
      '@keyframes lwf-breathe{0%,100%{opacity:.45}50%{opacity:1}}',
      '@keyframes lwf-rise{0%{transform:translateY(3px);opacity:0}100%{transform:translateY(0);opacity:1}}',
      '.lwf-pop{animation:lwf-pop .36s cubic-bezier(.2,.8,.2,1)}',
      '.lwf-breathe{animation:lwf-breathe 1.5s ease-in-out infinite}',
      '.lwf-rise{animation:lwf-rise .22s ease-out}',
      '@media (prefers-reduced-motion: reduce){.lwf-motion,.lwf-motion *{animation:none!important;transition:none!important}}',
    ].join('\n')

    const clamp01 = value => Math.min(1, Math.max(0, value))
    const fmtScore = value => (Number.isFinite(value) ? value.toFixed(1) : '—')
    const fmtUsd = value => (Number.isFinite(value) ? '$' + value.toFixed(2) : '—')
    const fmtPct = value => (Number.isFinite(value) ? Math.round(value * 100) + '%' : '—')

    function formatClock(timestamp, locale) {
      if (!Number.isFinite(timestamp)) return '—'
      try {
        return new Date(timestamp).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } catch {
        return '—'
      }
    }

    function tierOf(score) {
      let index = 0
      for (let i = 0; i < TIER_STARTS.length; i++) if (score >= TIER_STARTS[i]) index = i
      return index
    }

    /** Re-render on the host's locale preference without registering a namespace. */
    function useLocaleId(ctx) {
      const [id, setId] = useState(() => {
        try {
          return ctx.locale.getLocale().active
        } catch {
          return 'en'
        }
      })
      useEffect(() => {
        let dispose = () => {}
        try {
          dispose = ctx.locale.subscribe(() => {
            try {
              setId(ctx.locale.getLocale().active)
            } catch {
              /* keep previous */
            }
          })
        } catch {
          /* locale service absent */
        }
        return () => {
          try {
            dispose()
          } catch {
            /* ignore */
          }
        }
      }, [ctx])
      return /^zh/i.test(String(id)) ? 'zh' : 'en'
    }

    /** Poll the Host snapshot route; POST asks the Host to resample every source. */
    function useSnapshot() {
      const [snap, setSnap] = useState(null)
      const [pending, setPending] = useState(true)
      const [error, setError] = useState(null)
      const [busy, setBusy] = useState(false)
      const alive = useRef(true)

      const load = useCallback(async method => {
        if (method === 'POST') setBusy(true)
        try {
          const response = await fetch(ROUTE, { method, cache: 'no-store' })
          const body = await response.json().catch(() => null)
          if (!alive.current) return
          if (body && body.pending === true) {
            setPending(true)
            return
          }
          if (!response.ok || !body || body.ok !== true || !body.snapshot) {
            setError((body && body.error) || 'HTTP ' + response.status)
            return
          }
          setSnap(body.snapshot)
          setPending(false)
          setError(null)
        } catch (cause) {
          if (alive.current) setError(String((cause && cause.message) || cause))
        } finally {
          if (alive.current && method === 'POST') setBusy(false)
        }
      }, [])

      useEffect(() => {
        alive.current = true
        void load('GET')
        const timer = setInterval(() => {
          if (alive.current) void load('GET')
        }, 5_000)
        return () => {
          alive.current = false
          clearInterval(timer)
        }
      }, [load])

      return { snap, pending, error, busy, refresh: () => void load('POST') }
    }

    /** Smoothly count a number towards its target (score changes feel deliberate). */
    function useAnimatedNumber(target, duration = 620) {
      const [shown, setShown] = useState(Number.isFinite(target) ? target : 0)
      const fromRef = useRef(Number.isFinite(target) ? target : 0)
      const frameRef = useRef(0)
      useEffect(() => {
        if (!Number.isFinite(target)) return
        const from = Number.isFinite(fromRef.current) ? fromRef.current : target
        const clock = typeof performance !== 'undefined' && performance.now ? performance : Date
        const started = clock.now()
        cancelAnimationFrame(frameRef.current)
        const step = () => {
          const progress = Math.min(1, (clock.now() - started) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          setShown(from + (target - from) * eased)
          if (progress < 1) frameRef.current = requestAnimationFrame(step)
          else fromRef.current = target
        }
        frameRef.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frameRef.current)
      }, [target, duration])
      return shown
    }

    /** Close the popover on outside mousedown or Escape. */
    function useDismiss(ref, active, onClose) {
      useEffect(() => {
        if (!active) return undefined
        const onPointer = event => {
          const node = ref.current
          if (node && event.target instanceof Node && node.contains(event.target)) return
          onClose()
        }
        const onKey = event => {
          if (event.key === 'Escape') onClose()
        }
        document.addEventListener('mousedown', onPointer, true)
        document.addEventListener('keydown', onKey, true)
        return () => {
          document.removeEventListener('mousedown', onPointer, true)
          document.removeEventListener('keydown', onKey, true)
        }
      }, [ref, active, onClose])
    }

    function TierImage({ index, size, radius, ringColor, className, style }) {
      const safe = Math.max(0, Math.min(TIERS.length - 1, index))
      const rounded = radius === undefined ? Math.round(size * 0.24) : radius
      if (MEME_SPRITE) {
        return h('div', {
          className,
          'aria-hidden': true,
          style: {
            width: size,
            height: size,
            flex: '0 0 auto',
            borderRadius: rounded,
            backgroundImage: 'url(' + MEME_SPRITE + ')',
            backgroundSize: size * TIERS.length + 'px ' + size + 'px',
            backgroundPosition: -safe * size + 'px 0px',
            backgroundRepeat: 'no-repeat',
            boxShadow: ringColor ? '0 0 0 2px ' + ringColor + ', 0 2px 6px rgba(0,0,0,.25)' : '0 2px 6px rgba(0,0,0,.18)',
            ...style,
          },
        })
      }
      return h('svg', {
        viewBox: '0 0 120 120',
        width: size,
        height: size,
        className,
        'aria-hidden': true,
        focusable: 'false',
        style: { display: 'block', flex: '0 0 auto', borderRadius: rounded, ...(style || {}) },
        dangerouslySetInnerHTML: { __html: TIER_ART[safe] ? TIER_ART[safe].svg : '' },
      })
    }

    function Chip({ label, value, color }) {
      return h('span', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10.5,
          lineHeight: 1.2,
          padding: '2px 6px',
          borderRadius: 7,
          background: T.bg2,
          color: T.dim,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        },
      }, [
        h('span', { key: 'l', style: { color: color || T.dim, fontWeight: 700 } }, label),
        h('span', { key: 'v' }, value),
      ])
    }

    function Sparkline({ points, color, height = 64 }) {
      const data = Array.isArray(points) ? points : []
      const width = 300
      const x = index => (data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width)
      const y = value => height - 3 - (Math.max(0, Math.min(100, value)) / 100) * (height - 6)
      const path = data.map((point, index) => (index === 0 ? 'M' : 'L') + x(index).toFixed(1) + ' ' + y(point.score).toFixed(1)).join(' ')
      const last = data.length > 0 ? data[data.length - 1] : null
      return h('svg', {
        viewBox: '0 0 ' + width + ' ' + height,
        preserveAspectRatio: 'none',
        style: { display: 'block', width: '100%', height: height, background: T.bg2, borderRadius: 9 },
      }, [
        h('path', { key: 'line', d: path, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' }),
        last ? h('circle', { key: 'dot', cx: x(data.length - 1), cy: y(last.score), r: 3, fill: color }) : null,
      ])
    }

    function FactorRow({ label, color, ratio, points, maximum, detail }) {
      return h('div', { style: { padding: '7px 0', borderTop: '1px solid ' + T.border } }, [
        h('div', { key: 'head', style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 } }, [
          h('span', { key: 'l', style: { fontSize: 11.5, fontWeight: 700 } }, label),
          h('span', { key: 'v', style: { marginLeft: 'auto', fontSize: 11, color: T.dim, fontVariantNumeric: 'tabular-nums' } },
            fmtScore(points) + ' / ' + maximum),
        ]),
        h('div', { key: 'bar', style: { height: 5, borderRadius: 3, background: T.bg2, overflow: 'hidden' } },
          h('div', {
            style: {
              width: (clamp01(ratio) * 100).toFixed(1) + '%',
              height: '100%',
              borderRadius: 3,
              background: color,
              transition: 'width .6s cubic-bezier(.22,1,.36,1)',
            },
          })),
        h('div', { key: 'd', style: { marginTop: 4, fontSize: 10.5, color: T.dim } }, detail),
      ])
    }

    function DataRow({ label, value, highlight, color, meta, title }) {
      return h('div', {
        title: title,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 6px',
          borderRadius: 7,
          fontSize: 11,
          background: highlight ? 'rgba(255,255,255,0.055)' : 'transparent',
        },
      }, [
        h('span', { key: 'd', style: { width: 5, height: 5, borderRadius: '50%', background: highlight ? color : T.idle, flex: '0 0 auto' } }),
        h('span', {
          key: 'n',
          style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: highlight ? T.text : T.dim, fontWeight: highlight ? 650 : 400 },
        }, label),
        meta ? h('span', { key: 'm', style: { fontSize: 9.5, color: T.dim, whiteSpace: 'nowrap' } }, meta) : null,
        h('span', { key: 'v', style: { fontVariantNumeric: 'tabular-nums', color: highlight ? T.text : T.dim, fontWeight: highlight ? 650 : 400 } }, value),
      ])
    }

    const SIZE_MIN = 56
    const SIZE_MAX = 160
    const DEFAULT_POS = { right: 20, bottom: 184 }
    const STORAGE = {
      mode: 'dsh.auto-lwf-sr.display',
      size: 'dsh.auto-lwf-sr.size',
      pos: 'dsh.auto-lwf-sr.position',
    }
    function readStore(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key)
        if (raw === null) return fallback
        try {
          return JSON.parse(raw)
        } catch {
          return raw
        }
      } catch {
        return fallback
      }
    }
    function writeStore(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* storage is optional */
      }
    }
    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function FloatingWidget({ ctx }) {
      const locale = useLocaleId(ctx)
      const t = TEXT[locale]
      const { snap, pending, error, busy, refresh } = useSnapshot()

      const [open, setOpen] = useState(false)
      const [shown, setShown] = useState(false)
      const [hovered, setHovered] = useState(false)
      const [mode, setMode] = useState(() => (readStore(STORAGE.mode, 'pill') === 'sticker' ? 'sticker' : 'pill'))
      const [avatarSize, setAvatarSize] = useState(() => clamp(Number(readStore(STORAGE.size, 88)) || 88, SIZE_MIN, SIZE_MAX))
      const [pos, setPos] = useState(() => {
        const saved = readStore(STORAGE.pos, null)
        if (saved && Number.isFinite(saved.right) && Number.isFinite(saved.bottom)) {
          return { right: saved.right, bottom: saved.bottom }
        }
        return { ...DEFAULT_POS }
      })
      const [showSettings, setShowSettings] = useState(false)
      const [widgetDragging, setWidgetDragging] = useState(false)
      const [tab, setTab] = useState(0)
      const [preview, setPreview] = useState(null)
      const [dragging, setDragging] = useState(false)
      const rootRef = useRef(null)
      const chipRef = useRef(null)
      const chipDragRef = useRef(null)
      const suppressClickRef = useRef(false)
      const trackRef = useRef(null)
      const dragRef = useRef(false)
      const resetTimer = useRef(null)
      const closeTimer = useRef(null)
      const bubbleTimer = useRef(null)
      const prevTier = useRef(null)

      const tierIndex = snap ? snap.tierIndex : 0
      const shownIndex = preview ? preview.tier : tierIndex
      const amber = TIERS[shownIndex].accent
      const score = snap ? snap.score : 0
      const animatedScore = useAnimatedNumber(snap ? snap.score : 0)
      const trackPct = preview ? preview.pct : score
      const next = snap ? snap.nextTier : null
      const stability = snap ? snap.factors.stability : null
      const statusLevel = stability ? String(stability.level || stability.overall || 'operational') : 'operational'
      const statusTone = statusColor(statusLevel)

      const close = useCallback(() => {
        setShown(false)
        if (closeTimer.current) clearTimeout(closeTimer.current)
        closeTimer.current = setTimeout(() => setOpen(false), 170)
      }, [])

      const toggle = useCallback(() => {
        if (open) close()
        else {
          setOpen(true)
          requestAnimationFrame(() => setShown(true))
        }
      }, [open, close])

      useDismiss(rootRef, open, close)

      useEffect(() => { writeStore(STORAGE.mode, mode) }, [mode])
      useEffect(() => { writeStore(STORAGE.size, avatarSize) }, [avatarSize])
      useEffect(() => {
        const timer = setTimeout(() => writeStore(STORAGE.pos, pos), 150)
        return () => clearTimeout(timer)
      }, [pos])

      useEffect(() => {
        const onResize = () => {
          const rect = chipRef.current ? chipRef.current.getBoundingClientRect() : { width: 120, height: 64 }
          const width = rect.width || 120
          const height = rect.height || 64
          setPos(current => {
            const nextRight = clamp(current.right, 8, Math.max(8, window.innerWidth - width - 8))
            const nextBottom = clamp(current.bottom, 8, Math.max(8, window.innerHeight - height - 8))
            return nextRight === current.right && nextBottom === current.bottom ? current : { right: nextRight, bottom: nextBottom }
          })
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [])

      const chipDragStart = event => {
        if (event.button !== undefined && event.button !== 0) return
        chipDragRef.current = { x: event.clientX, y: event.clientY, right: pos.right, bottom: pos.bottom, moved: false }
        suppressClickRef.current = false
        setWidgetDragging(true)
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          /* pointer capture is optional */
        }
      }
      const chipDragMove = event => {
        const drag = chipDragRef.current
        if (!drag) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 5) return
        if (!drag.moved) {
          drag.moved = true
          if (open) close()
        }
        const rect = chipRef.current ? chipRef.current.getBoundingClientRect() : { width: 0, height: 0 }
        const maxRight = Math.max(8, window.innerWidth - rect.width - 8)
        const maxBottom = Math.max(8, window.innerHeight - rect.height - 8)
        setPos({
          right: clamp(drag.right - dx, 8, maxRight),
          bottom: clamp(drag.bottom - dy, 8, maxBottom),
        })
      }
      const chipDragEnd = () => {
        const drag = chipDragRef.current
        chipDragRef.current = null
        setWidgetDragging(false)
        if (!drag || !drag.moved) return
        suppressClickRef.current = true
        setTimeout(() => { suppressClickRef.current = false }, 0)
      }

      const panelBelow = typeof window !== 'undefined' && window.innerHeight - pos.bottom < 470

      useEffect(() => () => {
        if (resetTimer.current) clearTimeout(resetTimer.current)
        if (closeTimer.current) clearTimeout(closeTimer.current)
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      }, [])

      // Auto-show the tagline bubble briefly whenever the tier changes.
      useEffect(() => {
        if (!snap) return undefined
        if (prevTier.current === null) {
          prevTier.current = tierIndex
          return undefined
        }
        if (prevTier.current === tierIndex) return undefined
        prevTier.current = tierIndex
        setHovered(true)
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
        bubbleTimer.current = setTimeout(() => setHovered(false), 3600)
        return () => {
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
        }
      }, [snap, tierIndex])

      const scheduleReset = (delay = 1800) => {
        if (resetTimer.current) clearTimeout(resetTimer.current)
        resetTimer.current = setTimeout(() => setPreview(null), delay)
      }

      const updateFromX = useCallback(clientX => {
        const element = trackRef.current
        if (!element) return
        const rect = element.getBoundingClientRect()
        if (!rect || rect.width <= 0) return
        const ratio = clamp01((clientX - rect.left) / rect.width)
        setPreview({ tier: tierOf(ratio * 100), pct: ratio * 100 })
        if (resetTimer.current) clearTimeout(resetTimer.current)
      }, [])

      const onTrackDown = event => {
        dragRef.current = true
        setDragging(true)
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          /* pointer capture is optional */
        }
        updateFromX(event.clientX)
      }
      const onTrackMove = event => {
        if (dragRef.current) updateFromX(event.clientX)
      }
      const onTrackUp = () => {
        if (!dragRef.current) return
        dragRef.current = false
        setDragging(false)
        scheduleReset(1900)
      }
      const onLabelClick = index => {
        setPreview({ tier: index, pct: TIER_STARTS[index] + TIER_SPANS[index] / 2 })
        scheduleReset(1900)
      }

      const trend = (() => {
        const history = snap && Array.isArray(snap.history) ? snap.history : []
        if (history.length < 2) return 0
        return snap.score - history[history.length - 2].score
      })()

      const factorRows = snap ? [
        {
          label: t.stability,
          color: statusTone,
          ratio: snap.factors.stability.value,
          points: snap.points.stability,
          maximum: 50,
          detail: statusLabel(statusLevel, locale) + ' · ' + t.statusGrade + ' ' + (stability.letter || '—') + ' · ' + t.last24h + ' ' + (Number.isFinite(stability.uptime) ? stability.uptime.toFixed(2) + '%' : '—') + ' · ' + t.incidents + ' ' + (stability.incidents ?? 0),
        },
        {
          label: t.quality,
          color: T.brand,
          ratio: snap.factors.quality.value,
          points: snap.points.quality,
          maximum: 30,
          detail: (snap.factors.quality.model || '—') + ' · ' + (Number.isFinite(snap.factors.quality.score) ? snap.factors.quality.score + t.pts : '—') + ' · ' + t.percentile + ' ' + fmtPct(snap.factors.quality.percentile),
        },
        {
          label: t.price,
          color: T.warn,
          ratio: snap.factors.price.value,
          points: snap.points.price,
          maximum: 20,
          detail: t.composite + ' ' + fmtUsd(snap.factors.price.compositeUsd) + t.perMillion
            + ' · ' + t.peerMedian + ' ' + fmtUsd(snap.factors.price.peerMedianUsd) + t.perMillion
            + (Number.isFinite(snap.factors.price.ratio) ? ' · ' + t.cheaper + ' ' + snap.factors.price.ratio + '×' : ''),
        },
      ] : []

      const modelRows = snap
        ? (snap.modelTable || []).slice().sort((a, b) => b.score - a.score).map(row => ({
            label: row.label,
            value: String(row.score),
            highlight: Boolean(row.deepseek),
            title: row.matchedName || row.label,
          }))
        : []
      const priceRows = snap
        ? (snap.priceTable || []).slice().sort((a, b) => a.blendedPerMillion - b.blendedPerMillion).map(row => ({
            label: row.label,
            value: fmtUsd(row.blendedPerMillion) + t.perMillion,
            highlight: Boolean(row.deepseek),
            title: row.openrouterId || row.label,
          }))
        : []
      const history = snap && Array.isArray(snap.history) ? snap.history : []
      const scores = history.map(point => point.score)

      const renderTab = () => {
        if (!snap) return h('div', { key: 'empty', style: { fontSize: 11, color: T.dim, padding: '14px 2px' } }, pending ? t.warmupHint : (error || t.tabEmpty))
        if (tab === 0) {
          return h('div', { key: 'factors', style: { paddingTop: 2 } }, [
            ...factorRows.map((row, index) => h(FactorRow, { key: 'f' + index, ...row })),
            Number.isFinite(snap.cap) && snap.cap < 100 && Number.isFinite(snap.rawScore) && snap.rawScore > snap.cap
              ? h('div', { key: 'cap', style: { marginTop: 8, fontSize: 10.5, color: T.warn } },
                  locale === 'zh'
                    ? '当前状态分级 ' + (stability.letter || '?') + ' 限制总分上限 ' + snap.cap + '（原始 ' + snap.rawScore + '）'
                    : 'status grade ' + (stability.letter || '?') + ' caps the score at ' + snap.cap + ' (raw ' + snap.rawScore + ')')
              : null,
            snap.degraded ? h('div', { key: 'deg', style: { marginTop: 8, fontSize: 10.5, color: T.warn } }, t.degraded) : null,
          ])
        }
        if (tab === 1) {
          const deepseekRows = (snap.modelTable || []).filter(row => row.deepseek)
          const deepseekRow = deepseekRows.length > 0 ? deepseekRows.reduce((a, b) => (b.score > a.score ? b : a)) : undefined
          const variant = deepseekRow ? (deepseekRow.matchedName || VARIANT_HINTS[deepseekRow.label] || '') : ''
          return h('div', { key: 'models', style: { paddingTop: 4 } }, [
            h('div', { key: 'caption', style: { fontSize: 9.5, color: T.dim, margin: '0 2px 4px' } },
              variant
                ? (locale === 'zh' ? 'DeepSeek 计入最高分变体：' + variant : 'DeepSeek best variant: ' + variant)
                : (locale === 'zh' ? 'DeepSeek 取各变体最高分' : 'DeepSeek: best variant counts')),
            modelRows.length > 0
              ? modelRows.map((row, index) => h(DataRow, { key: 'm' + index, ...row, color: amber, meta: row.highlight ? 'DeepSeek' : '' }))
              : h('div', { style: { fontSize: 11, color: T.dim } }, t.tabEmpty),
          ])
        }
        if (tab === 2) {
          const priceCaption = locale === 'zh' ? 'DeepSeek 行取主力型号的 OpenRouter 基础报价' : 'DeepSeek rows use the flagship OpenRouter base price'
          return h('div', { key: 'prices', style: { paddingTop: 4 } },
            priceRows.length > 0
              ? [
                  h('div', { key: 'caption', style: { fontSize: 9.5, color: T.dim, margin: '0 2px 4px' } }, priceCaption),
                  ...priceRows.map((row, index) => h(DataRow, { key: 'p' + index, ...row, color: amber })),
                ]
              : h('div', { style: { fontSize: 11, color: T.dim } }, t.tabEmpty))
        }
        return h('div', { key: 'trend', style: { paddingTop: 6 } }, [
          h(Sparkline, { key: 'chart', points: history, color: amber, height: 72 }),
          h('div', { key: 'stats', style: { display: 'flex', gap: 12, marginTop: 8, fontSize: 10.5, color: T.dim, fontVariantNumeric: 'tabular-nums' } }, [
            h('span', { key: 'min' }, t.min + ' ' + (scores.length ? Math.min(...scores).toFixed(1) : '—')),
            h('span', { key: 'now', style: { color: T.text } }, t.now + ' ' + fmtScore(snap.score)),
            h('span', { key: 'max' }, t.max + ' ' + (scores.length ? Math.max(...scores).toFixed(1) : '—')),
          ]),
        ])
      }

      const sourceLink = (label, url) => h('a', {
        key: label,
        href: url,
        target: '_blank',
        rel: 'noreferrer',
        style: { color: T.dim, textDecoration: 'none', borderBottom: '1px dotted ' + T.border2 },
      }, label)

      const chipContent = [
        h(TierImage, { key: 'img', index: shownIndex, size: 36, className: 'lwf-pop', ringColor: amber + '66' }),
        h('div', { key: 'text', style: { display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 } }, [
          h('span', {
            key: 'live',
            title: statusLabel(statusLevel, locale),
            style: { width: 6, height: 6, borderRadius: '50%', background: statusTone, flex: '0 0 auto', boxShadow: statusLevel === 'operational' ? 'none' : '0 0 0 3px rgba(255, 176, 32, 0.18)' },
          }),
          h('span', { key: 'name', style: { fontSize: 14, fontWeight: 750, color: amber, whiteSpace: 'nowrap' } }, TIERS[shownIndex].name),
          snap
            ? h('span', { key: 'score', style: { fontSize: 12, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 600 } }, fmtScore(animatedScore))
            : h('span', { key: 'status', style: { fontSize: 10.5, color: error ? T.err : T.dim, whiteSpace: 'nowrap' } }, pending ? t.warmup : t.failed),
          snap && trend !== 0
            ? h('span', { key: 'trend', style: { fontSize: 10, color: trend > 0 ? T.ok : T.err, fontVariantNumeric: 'tabular-nums' } }, (trend > 0 ? '▲' : '▼') + Math.abs(trend).toFixed(1))
            : null,
        ]),
      ]

      const chipProps = {
        key: 'chip',
        type: 'button',
        'data-lwf-chip': 'true',
        'data-lwf-mode': mode,
        'aria-expanded': open,
        'aria-label': t.title + ' ' + (snap ? TIERS[tierIndex].name + ' ' + fmtScore(snap.score) : t.warmup),
        title: snap ? TIERS[tierIndex].name + ' · ' + fmtScore(snap.score) : t.warmup,
        onClick: () => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            return
          }
          toggle()
        },
        ref: chipRef,
        onPointerDown: chipDragStart,
        onPointerMove: chipDragMove,
        onPointerUp: chipDragEnd,
        onPointerCancel: chipDragEnd,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => {
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
          setHovered(false)
        },
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      }
      const chip = mode === 'sticker'
        ? h('button', {
            ...chipProps,
            style: {
              pointerEvents: 'auto',
              display: 'block',
              padding: 0,
              margin: 0,
              border: 'none',
              background: 'transparent',
              font: 'inherit',
              cursor: widgetDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none',
              filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.34))',
              transition: 'transform .18s cubic-bezier(.22,1,.36,1)',
              transform: hovered && !open ? 'translateY(-3px) scale(1.035)' : 'none',
              WebkitTapHighlightColor: 'transparent',
            },
          }, h(TierImage, { index: shownIndex, size: avatarSize, radius: Math.round(avatarSize * 0.25), style: { borderRadius: Math.round(avatarSize * 0.25) } }))
        : h('button', {
            ...chipProps,
            style: {
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              font: 'inherit',
              background: T.bg,
              color: T.text,
              border: '1px solid ' + T.border,
              borderRadius: 16,
              padding: '6px 12px 6px 7px',
              cursor: widgetDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              transition: 'transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s, background .18s',
              transform: hovered && !open ? 'translateY(-2px)' : 'none',
              backdropFilter: 'blur(10px)',
            },
          }, chipContent)

      const bubble = h('div', {
        key: 'bubble',
        'aria-hidden': !hovered || open,
        style: {
          position: 'absolute',
          right: 8,
          bottom: 'calc(100% + 10px)',
          maxWidth: 260,
          padding: '9px 12px',
          borderRadius: 14,
          background: T.overlay,
          border: '1px solid ' + T.border2,
          boxShadow: '0 10px 26px rgba(0,0,0,.2)',
          color: T.text,
          fontSize: 11.5,
          lineHeight: 1.45,
          opacity: hovered && !open ? 1 : 0,
          transform: hovered && !open ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity .18s ease, transform .18s ease',
          pointerEvents: 'none',
          whiteSpace: 'normal',
          textAlign: 'right',
        },
      }, [
        h('div', { key: 'tier', style: { fontWeight: 700, color: amber } }, TIERS[shownIndex].name + ' · ' + (locale === 'zh' ? TIERS[shownIndex].tagline : TIERS[shownIndex].enTagline)),
        h('div', { key: 'hint', style: { color: T.dim } },
          snap ? (locale === 'zh' ? '点开看因子 / 评分 / 价格 / 走势' : 'open for factors, scores, prices and trend') : t.warmupHint),
      ])

      const progress = next && snap
        ? Math.max(0, Math.min(100, ((snap.score - snap.tier.min) / Math.max(1, (snap.score + next.gap) - snap.tier.min)) * 100))
        : 100

      const settingsBody = [
        h('div', { key: 'set-mode', style: { padding: '4px 0 10px' } }, [
          h('div', { key: 'label', style: { fontSize: 11, fontWeight: 700, marginBottom: 6 } }, t.settingMode),
          h('div', { key: 'seg', style: { display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: T.bg2, border: '1px solid ' + T.border } },
            [['pill', t.modePill], ['sticker', t.modeSticker]].map(([value, label]) => h('button', {
              key: 'set-mode-' + value,
              type: 'button',
              'data-lwf-mode-switch': value,
              onClick: () => setMode(value),
              style: {
                font: 'inherit',
                flex: 1,
                fontSize: 11,
                padding: '5px 0',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                background: mode === value ? T.bg : 'transparent',
                color: mode === value ? T.text : T.dim,
                fontWeight: mode === value ? 700 : 500,
                boxShadow: mode === value ? '0 1px 3px rgba(0,0,0,.16)' : 'none',
              },
            }, label))),
        ]),
        h('div', { key: 'set-size', style: { padding: '0 0 10px' } }, [
          h('div', { key: 'line', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11, fontWeight: 700, marginBottom: 6 } }, [
            h('span', { key: 'l' }, t.settingSize),
            h('span', { key: 'v', style: { fontSize: 10.5, color: T.dim, fontVariantNumeric: 'tabular-nums' } }, avatarSize + ' px'),
          ]),
          h('input', {
            key: 'slider',
            type: 'range',
            min: SIZE_MIN,
            max: SIZE_MAX,
            step: 4,
            value: avatarSize,
            'data-lwf-size': 'true',
            disabled: mode !== 'sticker',
            onInput: event => setAvatarSize(clamp(Number(event.target.value) || 88, SIZE_MIN, SIZE_MAX)),
            onChange: event => setAvatarSize(clamp(Number(event.target.value) || 88, SIZE_MIN, SIZE_MAX)),
            style: {
              width: '100%',
              accentColor: amber,
              cursor: mode === 'sticker' ? 'pointer' : 'not-allowed',
              opacity: mode === 'sticker' ? 1 : 0.45,
            },
          }),
          h('div', { key: 'hint', style: { marginTop: 4, fontSize: 9.5, color: T.dim } },
            mode === 'sticker' ? t.settingSizeHint : t.settingSizePillHint),
        ]),
        h('div', { key: 'set-pos', style: { padding: '0 0 10px' } }, [
          h('div', { key: 'line', style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700 } }, [
            h('span', { key: 'l' }, t.settingPosition),
            h('span', { key: 'v', style: { fontSize: 10, color: T.dim, fontWeight: 400, fontVariantNumeric: 'tabular-nums' } },
              '↘ ' + Math.round(pos.right) + ' · ' + Math.round(pos.bottom)),
            h('span', { key: 'sp', style: { flex: 1 } }),
            h('button', {
              key: 'reset',
              type: 'button',
              'data-lwf-reset-pos': 'true',
              onClick: () => setPos({ ...DEFAULT_POS }),
              style: {
                font: 'inherit', fontSize: 10, color: T.dim, background: 'transparent',
                border: '1px solid ' + T.border, borderRadius: 7, padding: '2px 7px', cursor: 'pointer',
              },
            }, t.resetPosition),
          ]),
          h('div', { key: 'hint', style: { marginTop: 4, fontSize: 9.5, color: T.dim } }, t.dragHintWidget),
        ]),
        h('div', { key: 'set-note', style: { fontSize: 9.5, color: T.dim, lineHeight: 1.5 } }, t.settingsNote),
      ]

      const settingsOverlay = h('div', {
        key: 'settings-view',
        'data-lwf-settings': 'true',
        className: 'lwf-rise',
        style: {
          position: 'absolute',
          inset: 0,
          background: T.overlay,
          backdropFilter: 'blur(18px)',
          padding: '10px 0 0',
          overflowY: 'auto',
          borderRadius: '12px 12px 16px 16px',
        },
      }, settingsBody)

      const panel = h('div', {
        key: 'panel',
        'data-lwf-panel': 'true',
        role: 'dialog',
        'aria-label': t.title,
        className: 'lwf-motion',
        style: {
          pointerEvents: 'auto',
          position: 'absolute',
          right: 0,
          ...(panelBelow ? { top: 'calc(100% + 12px)' } : { bottom: 'calc(100% + 12px)' }),
          width: 356,
          maxWidth: 'min(356px, calc(100vw - 24px))',
          maxHeight: (panelBelow
            ? 'min(560px, ' + Math.max(200, Math.round(pos.bottom - 24)) + 'px)'
            : 'min(560px, ' + Math.max(200, Math.round(window.innerHeight - pos.bottom - 96)) + 'px)'),
          display: 'flex',
          flexDirection: 'column',
          background: T.overlay,
          border: '1px solid ' + T.border2,
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,.34)',
          backdropFilter: 'blur(16px)',
          color: T.text,
          fontFamily: FONT,
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : (panelBelow ? 'translateY(-10px) scale(.985)' : 'translateY(10px) scale(.985)'),
          transition: 'opacity .18s ease, transform .24s cubic-bezier(.22,.8,.28,1)',
          transformOrigin: panelBelow ? 'top right' : 'bottom right',
          overflow: 'hidden',
        },
      }, [
        h('div', { key: 'head', style: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 8px' } }, [
          h('span', { key: 'dot', className: 'lwf-breathe', title: statusLabel(statusLevel, locale), style: { width: 6, height: 6, borderRadius: '50%', background: statusTone } }),
          h('span', { key: 'title', style: { fontSize: 12.5, fontWeight: 750, letterSpacing: '.02em' } }, showSettings ? t.settings : t.title),
          h('span', { key: 'spacer', style: { flex: 1 } }),
          h('button', {
            key: 'settings',
            type: 'button',
            title: showSettings ? t.back : t.settings,
            'aria-label': showSettings ? t.back : t.settings,
            'data-lwf-settings-toggle': 'true',
            onClick: () => setShowSettings(value => !value),
            style: {
              font: 'inherit',
              fontSize: 12,
              lineHeight: 1,
              color: showSettings ? T.text : T.dim,
              background: showSettings ? T.bg2 : 'transparent',
              border: '1px solid ' + (showSettings ? T.border2 : T.border),
              borderRadius: 8,
              width: 26,
              height: 26,
              cursor: 'pointer',
            },
          }, showSettings ? '←' : '⚙'),
          h('button', {
            key: 'refresh',
            type: 'button',
            title: t.refresh,
            'aria-label': t.refresh,
            onClick: refresh,
            disabled: busy,
            style: {
              font: 'inherit', fontSize: 11, color: T.dim, background: 'transparent',
              border: '1px solid ' + T.border, borderRadius: 8, padding: '3px 8px', cursor: 'pointer',
            },
          }, busy ? t.refreshing : '↻ ' + t.refresh),
          h('button', {
            key: 'close',
            type: 'button',
            title: t.close,
            'aria-label': t.close,
            onClick: close,
            style: {
              font: 'inherit', fontSize: 13, lineHeight: 1, color: T.dim, background: 'transparent',
              border: 'none', borderRadius: 8, width: 26, height: 26, cursor: 'pointer',
            },
          }, '✕'),
        ]),
        h('div', { key: 'body', style: { padding: '0 14px 12px', overflowY: 'auto', position: 'relative' } }, [
          h('div', { key: 'hero', style: { display: 'flex', gap: 12, alignItems: 'center' } }, [
            h(TierImage, { key: 'art', index: shownIndex, size: 74, radius: 16, ringColor: amber + '77', className: preview ? 'lwf-pop' : undefined }),
            h('div', { key: 'info', style: { minWidth: 0, flex: 1 } }, [
              h('div', { key: 'nameRow', style: { display: 'flex', alignItems: 'baseline', gap: 8 } }, [
                h('span', { key: 'n', style: { fontSize: 20, fontWeight: 800, color: amber } }, TIERS[shownIndex].name),
                preview ? h('span', { key: 'badge', style: { fontSize: 9.5, padding: '1px 6px', borderRadius: 999, background: amber + '26', color: amber, fontWeight: 700 } }, t.preview) : null,
              ]),
              h('div', { key: 'tag', style: { fontSize: 11, color: T.dim, marginTop: 1 } },
                locale === 'zh' ? TIERS[shownIndex].tagline : TIERS[shownIndex].enTagline),
              h('div', { key: 'scoreRow', style: { display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 } }, [
                h('span', { key: 's', style: { fontSize: 26, fontWeight: 750, fontVariantNumeric: 'tabular-nums', lineHeight: 1 } }, fmtScore(animatedScore)),
                h('span', { key: 'u', style: { fontSize: 10.5, color: T.dim } }, '/100 · ' + t.score),
              ]),
            ]),
          ]),
          h('div', { key: 'next', style: { marginTop: 10 } }, [
            h('div', { key: 'label', style: { display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: T.dim, marginBottom: 4 } }, [
              h('span', { key: 'l' }, next ? t.nextPrefix + TIERS[next.index].name + t.nextSuffix + ' ' + fmtScore(next.gap) : t.maxed),
              h('span', { key: 'r', style: { fontVariantNumeric: 'tabular-nums' } }, Math.round(progress) + '%'),
            ]),
            h('div', { key: 'bar', style: { height: 6, borderRadius: 4, background: T.bg2, overflow: 'hidden' } },
              h('div', {
                style: {
                  width: progress.toFixed(1) + '%',
                  height: '100%',
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, ' + TIERS[Math.max(0, tierIndex - 1)].accent + ', ' + amber + ')',
                  transition: 'width .6s cubic-bezier(.22,1,.36,1)',
                },
              })),
          ]),
          h('div', { key: 'rheostat', style: { marginTop: 12, padding: '10px 10px 8px', borderRadius: 12, background: T.bg2, border: '1px solid ' + T.border } }, [
            h('div', { key: 'labels', style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 6 } },
              TIERS.map((tier, index) => h('button', {
                key: tier.id,
                type: 'button',
                onClick: () => onLabelClick(index),
                style: {
                  font: 'inherit', fontSize: 9.5, lineHeight: 1.2, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
                  textAlign: index === 0 ? 'left' : index === 5 ? 'right' : 'center',
                  color: index === shownIndex ? amber : T.dim,
                  fontWeight: index === shownIndex ? 750 : 500,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  transition: 'color .15s',
                },
              }, tier.name))),
            h('div', {
              key: 'track',
              ref: trackRef,
              'data-lwf-track': 'true',
              onPointerDown: onTrackDown,
              onPointerMove: onTrackMove,
              onPointerUp: onTrackUp,
              onPointerCancel: onTrackUp,
              style: { position: 'relative', height: 22, display: 'flex', alignItems: 'center', cursor: 'ew-resize', touchAction: 'none' },
            }, [
              h('div', {
                key: 'rail',
                style: { position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 5, overflow: 'hidden', display: 'flex', background: T.bg },
              }, TIER_SPANS.map((span, index) => h('div', {
                key: 's' + index,
                style: { flex: span + ' 1 0', background: TIERS[index].accent, opacity: index <= shownIndex ? 0.9 : 0.16, transition: 'opacity .25s' },
              }))),
              h('div', {
                key: 'knob',
                style: {
                  position: 'absolute',
                  left: 'calc(' + trackPct + '% - 11px)',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '3px solid ' + amber,
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 3px rgba(0,0,0,.3), 0 0 0 4px ' + amber + (dragging ? '3a' : '18'),
                  transition: dragging ? 'border-color .15s, box-shadow .15s' : 'left .5s cubic-bezier(.22,1,.36,1), border-color .2s, box-shadow .2s',
                  pointerEvents: 'none',
                },
              }),
            ]),
            h('div', { key: 'hint', style: { marginTop: 3, fontSize: 9.5, color: T.dim, textAlign: 'center' } }, t.dragHint),
          ]),
          h('div', { key: 'tabs', style: { display: 'flex', gap: 4, marginTop: 10, padding: 3, borderRadius: 10, background: T.bg2, border: '1px solid ' + T.border } },
            t.tabs.map((label, index) => h('button', {
              key: 'tab' + index,
              type: 'button',
              'data-lwf-tab': label,
              onClick: () => setTab(index),
              style: {
                font: 'inherit',
                flex: 1,
                fontSize: 10.5,
                padding: '4px 0',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                background: tab === index ? T.bg : 'transparent',
                color: tab === index ? T.text : T.dim,
                fontWeight: tab === index ? 700 : 500,
                boxShadow: tab === index ? '0 1px 3px rgba(0,0,0,.16)' : 'none',
                transition: 'background .16s, color .16s',
              },
            }, label))),
          h('div', { key: 'content', className: 'lwf-rise', style: { minHeight: 168, maxHeight: 220, overflowY: 'auto', marginTop: 6 } }, renderTab()),
          h('div', { key: 'foot', style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 9.5, color: T.dim, flexWrap: 'wrap' } }, [
            h('span', { key: 'src', style: { fontWeight: 700 } }, t.sources),
            sourceLink('status.deepseek.com', (snap && snap.sourceUrls && snap.sourceUrls.status) || 'https://status.deepseek.com/'),
            sourceLink('artificialanalysis.ai', (snap && snap.sourceUrls && snap.sourceUrls.benchmarks) || 'https://artificialanalysis.ai/leaderboards/models'),
            sourceLink('openrouter.ai', (snap && snap.sourceUrls && snap.sourceUrls.pricing) || 'https://openrouter.ai/api/v1/models'),
            h('span', { key: 'spacer', style: { flex: 1 } }),
            h('span', { key: 'updated', style: { fontVariantNumeric: 'tabular-nums' } },
              snap ? t.updated + ' ' + formatClock(snap.updatedAt, locale) : ''),
          ]),
          showSettings ? settingsOverlay : null,
        ]),
      ])

      return h('div', {
        ref: rootRef,
        className: 'lwf-motion',
        style: {
          position: 'fixed',
          right: pos.right,
          bottom: pos.bottom,
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontFamily: FONT,
          pointerEvents: 'none',
        },
      }, [
        h('style', { key: 'style' }, STYLE),
        h('div', { key: 'anchor', style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' } }, [
          mode === 'pill' ? bubble : null,
          open ? panel : null,
          chip,
        ]),
      ])
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'auto-lwf-sr',
          order: 60,
        }, () => h(FloatingWidget, { ctx })))
      },
    }
  },
})
