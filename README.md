# 自动变祖器 · dsh-auto-lwf-sr

一个住在 **DeepSeek Harness（DSH）** 右下角的实时挂件：持续读取 DeepSeek 服务状态、模型评分和 token 价格，
算出一个 0–100 的「变祖指数」，滑片停在 **小难梁 → 牢梁 → 梁子 → 梁神 → 梁圣 → 梁祖** 六档之一。

服务一打喷嚏，它就会当场掉档；恢复后再自己弹回来。纯梗，但分是真的。

| 指数 | 档位 | 台词 |
| --- | --- | --- |
| 0–18 | 小难梁 | 勉强能跑，别问好不好用 |
| 18–34 | 牢梁 | 能用，但也只限于能用 |
| 34–50 | 梁子 | 稳中有升，值得处 |
| 50–66 | 梁神 | 发挥稳定，封神在望 |
| 66–82 | 梁圣 | 业界标杆，圣光普照 |
| 82–100 | 梁祖 | 万祖归一，祖上显灵 |

## 特性

- **实时状态分**：每 20 秒读一次 DeepSeek 状态页的官方 JSON，按当前各组件状态分级（S/A/C/D/E）；事故/恢复大约 20 秒内反映到分数。
- **状态分级硬上限**：服务异常最多梁子、部分中断最多牢梁、全面中断直接小难梁——不会出现「服务挂了还是梁祖」。
- **多维度评分**：稳定度 50% + 模型实力 30% + 综合价格 20%，算法见下。
- **右下角悬浮挂件**：胶囊 / 头像两种展示形式，可拖动换位、可调立绘大小（56–160px），位置和设置存在本机。
- **二级面板**：大立绘、档位进度、可拖动滑片试滑、因子拆解、评分/价格对照表、最近走势、数据源链接。
- **无模型调用**：只读公开网页/JSON 数据，不花 token。

## 安装

需要 **DeepSeek Harness Desktop**（desktop profile，带 Web UI）。

```bash
git clone https://github.com/wxyz520/dsh-auto-lwf-sr.git
```

然后在 DSH 里安装插件包（`plugin/` 是插件本体）：

```text
plugin_manager install_bundle target=/absolute/path/to/dsh-auto-lwf-sr/plugin
```

安装成功后右下角出现挂件。卸载：

```text
plugin_manager remove_bundle target=dsh-plugin-auto-lwf-sr
```

> Host 代码（`plugin/lib/index.js`、`status.js` 等）改动后需要完全退出 DSH 再打开；
> 纯客户端（`plugin/lib/client.js`）改动会被 HMR 热替换，刷新页面即可。

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

当前示例：综合价 $0.50/M（Pro $1.19、Flash $0.21）÷ 同行中位 $4.00/M ≈ 便宜 8 倍 → 18/20 分。

## 数据源与刷新

| 来源 | 用途 | 方式 |
| --- | --- | --- |
| `status.deepseek.com` | 当前状态、活跃事故、近 24h 可用率 | 同源 JSON API（`summary/active` + `summary/structure`），HTML 解析兜底 |
| `artificialanalysis.ai` | 模型评分与百分位 | 解析服务端渲染的排行榜 HTML（其 API 需要 key） |
| `openrouter.ai/api/v1/models` | 百万 token 价格 | 公开 JSON |

- 状态：Host 每 **20 秒**采样一次（两个小 JSON，约 0.5 秒），每次采样都会用缓存的评分/价格重算总分；
- 评分/价格：每 **10 分钟**刷新一次；
- UI：每 **5 秒**轮询本机快照接口 `/api/auto-lwf-sr/snapshot`（浏览器会话 cookie 鉴权，仅 owner 可读），
  点「↻ / 再滑一次」立即重采状态（目录过期时后台补采）。
- 任一来源失败时沿用上次成功值，并在面板标注「部分数据源降级」。

## 界面

- 位置：右下角（默认在小鲸鱼上方），可拖动；拖到屏幕上半区时二级面板自动向下展开。
- 胶囊：立绘 + 档名 + 分数 + 涨跌箭头 + 实时状态小圆点（绿/黄/红）；悬停冒出吐槽气泡。
- 头像：只显示立绘（原创 SVG），点击打开二级面板。
- ⚙ 设置：显示形式、立绘大小（56–160px）、位置重置；设置存 `localStorage`。
- 二级面板：档位进度、可拖滑片试滑（松手 1.9 秒回位）、因子/评分/价格/走势四个 tab、数据源与时间戳。
- 中英文随 DSH 语言切换。

## 立绘与版权

仓库自带的六档立绘是**原创 SVG**（[`art/tiers.js`](art/tiers.js)，MIT），插件图标也是原创。

想在本地换成六格梗图版（仅供个人使用）：准备一张横向六格图（例如 1080×180，六格各 180×180），执行：

```bash
node scripts/embed-meme.mjs path/to/six-panels.png
```

它会把图片内嵌进 `plugin/lib/client.js`。**不要提交这次改动**：梗图的版权和肖像权由使用者自行承担，
公开仓库不包含任何网络梗图素材；`git checkout -- plugin/lib/client.js` 可还原。

## 开发

```bash
npm install
npm run check     # 语法检查
npm test          # 评分/分级/上限单元测试
npm run test:ui   # jsdom 渲染 + 交互冒烟测试
```

目录：

```
plugin/             DSH 插件包（package.json + lib/ + locale/ + icon.svg + cordis.patch.yml）
  lib/index.js      Host：采样、算分、快照接口
  lib/status.js     DeepSeek 状态读取与分级
  lib/benchmarks.js Artificial Analysis 评分
  lib/pricing.js    OpenRouter 价格与综合价
  lib/score.js      评分模型与六档映射
  lib/client.js     右下角挂件 UI
art/tiers.js        原创六档立绘
scripts/embed-meme.mjs  本地内嵌梗图
test/               单元测试 + jsdom 冒烟测试
```

## 免责声明

本项目是粉丝向玩梗作品，与 DeepSeek 官方无关；「梁」相关称号来自中文互联网梗图。
评分依赖第三方公开页面/接口，对方改版或限流时可能失效（会自动沿用上次数据并在面板提示）。
使用第三方数据时请遵守其条款。

## License

[MIT](LICENSE)
