# 自动变祖器 · dsh-auto-lwf-sr

[![CI](https://github.com/wxyz520/dsh-auto-lwf-sr/actions/workflows/ci.yml/badge.svg)](https://github.com/wxyz520/dsh-auto-lwf-sr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933.svg)](package.json)
[![DSH](https://img.shields.io/badge/DeepSeek%20Harness-desktop-4D6BFE.svg)](https://github.com/deepseek-ai/deepseek-harness)

一个住在 **DeepSeek Harness（DSH）** 右下角的实时挂件：持续读取 DeepSeek 服务状态、模型评分和 token 价格，
算出一个 0–100 的「变祖指数」，滑片停在 **小难梁 → 牢梁 → 梁子 → 梁神 → 梁圣 → 梁祖** 六档之一。

服务一打喷嚏，它就会当场掉档；恢复后再自己弹回来。纯梗，但分是真的。

> **English**: a live score widget for the DeepSeek Harness desktop UI. It reads the public DeepSeek status API,
> the Artificial Analysis leaderboard and OpenRouter prices, turns them into a 0–100 "ancestor index", and maps it
> onto six meme tiers. No model calls, no telemetry; the snapshot route is owner-only on the local web server.
> The bundled six-panel meme is included for parody purposes only; its rights belong to the original owners.

## 这梗是什么

初中物理器材「**滑动变阻器**」被谐音成「**滑动变祖器**」——滑片一动，辈分就涨。配上中文互联网那张
梁文锋「六格升格」梗图（小难梁 → 牢梁 → 梁子 → 梁神 → 梁圣 → 梁祖），就成了这个挂件：**指数越高，封号越祖**。

> 仓库随附的六格梗图仅作玩梗/评论引用，版权与肖像权归原权利人（见「立绘与版权」）；
> 也可以用一条命令切回原创六格 SVG 立绘。

## 六档

| 指数 | 档位 | 台词 |
| --- | --- | --- |
| 0–18 | 小难梁 | 勉强能跑，别问好不好用 |
| 18–34 | 牢梁 | 能用，但也只限于能用 |
| 34–50 | 梁子 | 稳中有升，值得处 |
| 50–66 | 梁神 | 发挥稳定，封神在望 |
| 66–82 | 梁圣 | 业界标杆，圣光普照 |
| 82–100 | 梁祖 | 万祖归一，祖上显灵 |

## 特性

- **实时状态分**：每 20 秒读一次 DeepSeek 状态页的官方 JSON，按当前各组件状态分级（S/A/C/D/E），事故/恢复约 20 秒内落到分数上。
- **分级硬上限**：服务异常最多梁子、部分中断最多牢梁、全面中断直接小难梁——不会出现「服务挂了还是梁祖」。
- **多维度评分**：稳定度 50% + 模型实力 30% + 综合价格 20%，公式见下。
- **右下角悬浮挂件**：胶囊 / 头像两种展示，可拖动换位、可调立绘大小（56–160px），位置与设置存在本机。
- **二级面板**：大立绘、档位进度、可拖滑片试滑、因子拆解、评分/价格对照表、最近走势、数据源与时间戳。
- **无模型调用、无遥测**：只读公开网页/JSON，不花 token、不上传本机数据。

## 安装

### 前置条件

- **DeepSeek Harness Desktop**（desktop profile，带 Web UI）。
- 不需要单独装 Node —— 运行在 DSH 自带运行时里。

### 安装插件

```bash
git clone https://github.com/wxyz520/dsh-auto-lwf-sr.git
```

`plugin/` 是插件包本体，二选一安装：

```text
# 方式 A：让 DSH 里的 agent 执行
plugin_manager install_bundle target=/absolute/path/to/dsh-auto-lwf-sr/plugin

# 方式 B：DSH 设置 → 插件（Plugin Manager）→ 安装本地包
#          选择上面的 plugin/ 目录
```

安装成功后右下角出现挂件（默认留出底部的一段空间，避免和右下角已有的挂件挤在一起；被挡住就直接拖开）。

```text
# 卸载
plugin_manager remove_bundle target=dsh-plugin-auto-lwf-sr
```

### 更新

`git pull` 后重新执行一次安装（`target` 指向同一个 `plugin/` 目录）即可。
**Host 代码**（`plugin/lib/index.js`、`status.js` 等）改动后需要完全退出 DSH 再打开；
**纯客户端**（`plugin/lib/client.js`）改动会被 HMR 热替换，刷新页面即可。

## 使用

- **胶囊**：立绘 + 档名 + 分数 + 涨跌箭头 + 实时状态小圆点（绿/黄/红）；悬停冒出吐槽气泡。
- **头像**：只显示立绘（原创 SVG），点击打开面板。
- **拖动**：按住立绘/胶囊拖动换位置（≤5px 视为点击），松手记住；拖到屏幕上半区时面板自动向下展开。
- **⚙ 设置**：显示形式、立绘大小、位置重置；存在 `localStorage`（`dsh.auto-lwf-sr.display / .size / .position`）。
- **二级面板**：档位进度、可拖滑片「试滑」（松手 1.9 秒回位）、因子 / 评分 / 价格 / 走势四个 tab。
- 中英文随 DSH 语言切换。

## 评分算法

```
总分 = 100 × (0.50 × 稳定度 + 0.30 × 实力 + 0.20 × 价格)
最后取 min(总分, 当前服务状态分级上限)
```

### 稳定度（50 分）＝当前服务状态分级

读取 `status.deepseek.com` 同源 API 的 `active_changes`，取受影响组件里最差的状态：

| 状态 | 分级 | 系数 | 总分上限 |
| --- | --- | --- | --- |
| operational | S | 1.0 | 无 |
| maintenance | A | 0.8 | 81.9（梁圣） |
| degraded | C | 0.25 | 49.9（梁子） |
| partial_outage | D | 0.05 | 33.9（牢梁） |
| full_outage | E | 0 | 8（小难梁） |

```
稳定度归一化 = 0.8 × 分级系数 + 0.2 × clamp((近24h可用率 − 98.5) / 1.5, 0, 1)
```

所以事故即使已经恢复，24 小时滚动可用率还会把分数多拽一会儿。

### 实力（30 分）＝Artificial Analysis 百分位

取 DeepSeek 各变体中 AA Intelligence Index 最高分（当前为 `DeepSeek V4.1 Flash 1017 (max)`，32 分），
算它在全榜 76 个模型里的百分位（当前约 50%）。

### 价格（20 分）＝综合主流价的对数优势

1. 每个型号取 OpenRouter 混合价：`(输入 × 3 + 输出) ÷ 4`，$/1M tokens；
2. **DeepSeek 综合价** = 主流在售型号（V4 Pro、V4.1 Flash）的**几何平均**，避免贵的 Pro 一家独大；
   带日期的快照变体（如 V4.1 Flash 1017）只进表格、不进指数，防止同一家族重复计数；
3. 同行基准 = 8 家主流旗舰混合价的**中位数**；
4. 得分 = `clamp(log10(同行中位价 ÷ DeepSeek 综合价), 0, 1) × 20`：与同行打平得 0 分，便宜 10 倍得满分。

**2026-10-28 实测**：稳定 50.0（S + 近24h 100%） + 实力 15.0（P50） + 价格 18.0（综合 $0.50/M vs 中位 $4.00/M）
= **83.0 → 梁祖**。数字会随状态/榜单/价格浮动。

## 数据源与刷新

| 来源 | 用途 | 方式 |
| --- | --- | --- |
| `status.deepseek.com` | 当前状态、活跃事故、近 24h 可用率 | 同源 JSON API（`summary/active` + `summary/structure`），HTML 解析兜底 |
| `artificialanalysis.ai` | 模型评分与百分位 | 解析服务端渲染的排行榜 HTML（其 API 需要 key） |
| `openrouter.ai/api/v1/models` | 百万 token 价格 | 公开 JSON |

- 状态：Host 每 **20 秒**采样一次（两个小 JSON，约 0.5 秒），每次采样都会用缓存的评分/价格重算总分；
- 评分/价格：每 **10 分钟**刷新一次；
- UI：每 **5 秒**轮询本机快照接口 `/api/auto-lwf-sr/snapshot`（浏览器会话 cookie 鉴权，仅 owner 可读），
  点「↻ / 再滑一次」立即重采状态（目录过期时后台补采）；
- 任一来源失败时沿用上次成功值，并在面板标注「部分数据源降级」。

## 隐私与安全

- **不调用模型**，不消耗 token，不含遥测/埋点。
- **不上传本机数据**：只向上面三个公开站点发起 GET 请求。
- 快照接口走 DSH 的浏览器会话鉴权（`/api` + 签名 cookie），仅 owner 可读；不监听公网端口。
- 所有设置只存在本机 `localStorage`。

## 常见问题

**装完右下角没东西？**
先完全退出 DSH 再打开（Host 需要重启加载）；确认当前是 desktop profile，并在插件管理里确认 `dsh-plugin-auto-lwf-sr` 已启用。

**分数长时间不动？**
面板页脚有时间戳（精确到秒）。若显示「部分数据源降级」，说明状态/榜单/价格接口暂时不可用，会沿用上次成功值；点「↻」可强制重采。

**为什么一有事故就掉这么狠？**
这是故意的：状态分级直接给总分设上限，服务异常/中断时不允许停在梁神/梁祖。分级与上限见 `plugin/lib/score.js`。

**为什么平时总是梁祖/梁圣？**
当前 DeepSeek 状态稳定（S）、价格综合起来比同行便宜约 8 倍，所以正常状态本来就高；想看它掉档，等一次事故或自己改权重。

**右下角有别的挂件（比如小鲸鱼）挡住怎么办？**
默认位置已经留出了底部空间；两个挂件都可以拖动，摆哪都行。

**数据源改版了怎么办？**
会降级并提示，或在面板里看到旧数据；提 issue 或改 `plugin/lib/status.js` / `benchmarks.js` 的解析即可（都做了兜底）。

## 调参

想改成自己的口味，主要动这几个常量：

| 想改什么 | 位置 |
| --- | --- |
| 三项权重（50/30/20） | `plugin/lib/score.js` → `DEFAULT_WEIGHTS` |
| 状态分级系数 S/A/C/D/E | `plugin/lib/status.js` → `STATUS_GRADES` |
| 状态分级对总分的上限 | `plugin/lib/score.js` → `STATUS_CAPS` |
| 采样/刷新间隔、超时 | `plugin/lib/index.js` → `DEFAULTS` |
| 价格公式与同行集合 | `plugin/lib/score.js` → `priceFactor`，`plugin/lib/pricing.js` → `DEFAULT_PEERS` |
| 档位阈值、文案、立绘 | `plugin/lib/score.js` → `TIERS`，`plugin/lib/client.js` → `TEXT` / `art/tiers.js` |

改完跑 `npm test` / `npm run test:ui` 验证。

## 兼容性与测试

- 运行环境：DeepSeek Harness Desktop（desktop profile，2026-10 版本实测）；Node ≥ 22（仅开发需要）。
- 插件依赖 DSH 的 `connection.fetch` 与 Client Slot 机制，DSH 大版本升级可能改变接口，请以实际版本为准。
- CI 会跑：所有模块语法检查、评分/分级/上限单元测试、jsdom 渲染 + 交互冒烟测试。

## 已知限制 / Roadmap

- 事故历史只保留内存中的最近 120 个采样点，DSH 重启后走势清空；
- 「任一组件异常即按最差档封顶」比较粗——搜索/抓取服务的小异常也会拖累总分，后续可加组件权重（API/对话服务权重更高）；
- 暂未做事故持续时长衰减（挂得越久扣得越狠）；
- 随仓库的梗图属于引用素材（非 MIT），如权利人要求会移除；
- 只支持 DSH desktop 的 Web UI；暂无 npm 包。

## 开发

```bash
npm install
npm run check     # 语法检查
npm test          # 评分/分级/上限单元测试
npm run test:ui   # jsdom 渲染 + 交互冒烟测试
```

目录：

```
plugin/                  DSH 插件包（package.json + lib/ + locale/ + icon.svg + cordis.patch.yml）
  lib/index.js           Host：采样、算分、快照接口
  lib/status.js          DeepSeek 状态读取与分级
  lib/benchmarks.js      Artificial Analysis 评分
  lib/pricing.js         OpenRouter 价格与综合价
  lib/score.js           评分模型与六档映射
  lib/client.js          右下角挂件 UI
  README.md              插件级详细文档
art/tiers.js             原创六档 SVG 立绘
art/meme/                随仓库的六格梗图（非 MIT，仅玩梗引用）
scripts/embed-meme.mjs   本地内嵌梗图
test/                    单元测试 + jsdom 冒烟测试
```

## 立绘与版权

- **代码、UI、图标、原创六格 SVG 立绘**（[`art/tiers.js`](art/tiers.js)）均为 MIT。
- **随仓库的六格梗图**（`art/meme/liang-six-stickers.png`，渲染成 156px 透明贴纸雪碧图内嵌在 `lib/client.js`）：
  源自 36kr 报道的配图，画面中的人物与图片版权/肖像权归原权利人，**不在 MIT 许可范围内**，
  此处仅作玩梗/评论用途；如权利人要求，会立即移除（见 [art/meme/README.md](art/meme/README.md)）。
- 想切回原创 SVG 立绘（或换成自己的图）：

```bash
node scripts/embed-meme.mjs --reset                  # 回到原创 SVG 立绘
node scripts/embed-meme.mjs path/to/own-six.png      # 换自己的六格图
```

> 提交前请确认你对所用素材拥有权利；公开仓库里的梗图随时可以被移除，但代码不受影响。

## 致谢 / Credits

- 「滑动变祖器」的概念与「小难梁 → … → 梁祖」六格升格梗，灵感来自 X 上的
  [@Lichtspektrum](https://x.com/lichtspektrum) 的原项目
  [Lichtspektrum/liang-intensity-calibrator](https://github.com/Lichtspektrum/liang-intensity-calibrator)
  （31 级梁系强度校准器，代码 MIT；其 README 明确说明人像素材不随 MIT 共享、复用前需确认肖像与素材使用权）。
- 本仓库是一个独立的 DSH 实现：把滑杆接到 DeepSeek 的实时状态、模型评分与价格上；
  未复用原项目代码。六档 SVG 立绘为本仓库原创，随仓库的梗图贴纸为网络流传版本（非 MIT，见「立绘与版权」）。
- 数据来源：[DeepSeek Status](https://status.deepseek.com/)、
  [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models)、
  [OpenRouter](https://openrouter.ai/api/v1/models)。
- 也感谢 [Awesome Sliders](https://github.com/Lichtspektrum/liang-intensity-calibrator#awesome-sliders)
  里各位二创作者带来的灵感。

## 贡献

欢迎 issue / PR：数据源解析修补、组件权重、时长衰减、英文文案、截图都欢迎。
提交前请跑 `npm run check && npm test && npm run test:ui`；更换/新增图片素材前请确认你有权使用。

## 免责声明

本项目是粉丝向玩梗作品，与 DeepSeek 官方无关；「梁」相关称号来自中文互联网梗图。
评分依赖第三方公开页面/接口，对方改版或限流时可能失效（会自动沿用上次数据并在面板提示）。
使用第三方数据时请遵守其条款。

## License

[MIT](LICENSE)
