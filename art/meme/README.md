# Bundled meme artwork

`liang-six-stickers.png` is the six-panel "ancestor ascension" meme used by the
widget sprite (6 × 156 px, rounded transparent stickers, 192-color quantized).

- The 「滑动变祖器」 concept comes from [@Lichtspektrum](https://x.com/lichtspektrum)'s
  [liang-intensity-calibrator](https://github.com/Lichtspektrum/liang-intensity-calibrator).
  Its README states that the portrait media is **not shared under MIT** and that
  reuse requires confirming likeness/material rights.
- This six-panel image is a re-cropped/quantized version of the version circulating
  online (published with the 36kr article
  *“DeepSeek 的「官方外挂」，被一张梁文锋的表情包难倒了”*, 2026-09; retrieved 2026-10-28).
- The artwork depicts a real person and is widely circulated as an internet meme.
  **It is not covered by this repository's MIT license.** Copyright and likeness
  rights belong to their respective owners.
- It is included here for parody / commentary / joke purposes only. If you are a
  rights holder and want it removed, please open an issue and it will be removed
  promptly.
- The raw source JPEG is intentionally not committed. To embed your own six-panel
  image locally instead:

```bash
node scripts/embed-meme.mjs path/to/your-six-panels.png
node scripts/embed-meme.mjs --reset   # back to the original SVG artwork
```
