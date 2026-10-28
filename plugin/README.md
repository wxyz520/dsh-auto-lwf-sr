# 自动变祖器 · Auto Ancestor Slider

一个常驻 DSH 右下角的浮层挂件：每次采样都会读取三份公开数据，算出 0–100 的「变祖指数」，
落在 **小难梁 → 牢梁 → 梁子 → 梁神 → 梁圣 → 梁祖** 六档中的某一档。外层只显示档位，滑片藏在二级面板里。

纯梗，但分数是真的，会随时间上下浮动（事故、模型跑分、涨价都会让它掉档）。

## 六档

| 指数 | 档位 | 台词 |
| --- | --- | --- |
| 0–18 | 小难梁 | 勉强能跑，别问好不好用 |
| 18–34 | 牢梁 | 能用，但也只限于能用 |
| 34–50 | 梁子 | 稳中有升，值得处 |
| 50–66 | 梁神 | 发挥稳定，封神在望 |
| 66–82 | 梁圣 | 业界标杆，圣光普照 |
| 82–100 | 梁祖 | 万祖归一，祖上显灵 |

## 评分

```
总分 = 100 × (0.50 × 稳定度 + 0.30 × 实力 + 0.20 × 价格)
```

- **稳定度（40 分）＝当前服务状态分级**：读取 status API 的 `active_changes`，按受影响组件状态取最差档位分级：
  `operational → S(1.0)`、`maintenance → A(0.8)`、`degraded → C(0.25)`、`partial_outage → D(0.05)`、`full_outage → E(0)`；
  分值为 `0.8 × 分级值 + 0.2 × 近24h可用率系数`，所以事故结束后可用率还会继续拽几天分。
- **分级同时对总分设上限**（这是「分级」的硬约束，故障时档位一定掉）：
  `S 无上限`、`A ≤ 81.9（梁圣）`、`C ≤ 49.9（梁子）`、`D ≤ 33.9（牢梁）`、`E ≤ 8（小难梁）`；
  胶囊上的小圆点、面板呼吸点会按当前状态变绿/黄/红。
- **实力（35 分）**：Artificial Analysis Intelligence Index 上 DeepSeek 最强型号的**百分位**
  （对全榜所有模型排名，中位 = 0.5）。
- **价格（20 分）＝综合主流价的对数优势**：
  1. 每个型号取 OpenRouter 混合价（(输入×3 + 输出) ÷ 4，$/1M token）；
  2. **DeepSeek 综合价** = 主流在售型号（V4 Pro、V4.1 Flash）的**几何平均**，避免贵的 Pro 一家独大；带日期的快照变体（如 V4.1 Flash 1017）只进表格、不进指数，防止同一家族算两次；
  3. 同行基准 = 8 家主流旗舰混合价的**中位数**；
  4. 价格得分 = `clamp(log10(同行中位价 ÷ DeepSeek 综合价), 0, 1)`：与同行打平得 0 分，便宜 10 倍得满分。
  当前：综合价 $0.50/M（Pro $1.19、Flash $0.21）÷ 同行中位 $4.00/M ≈ 便宜 8.0 倍 → 18.0/20 分。

当前实测（2026-10-28，状态 S + 近24h 100%）：稳定 50.0 + 实力 V4.1 Flash 32 分/P50（15.0）
+ 价格 综合 $0.50/M vs 中位 $4.00/M，便宜 8.0×（18.0）= **83.0 → 梁祖**（S 级上限 100，不封顶）。

权重、刷新间隔、超时都在 `lib/index.js` 顶部的 `DEFAULTS` 里。

## 数据源与刷新

| 来源 | 用途 | 方式 |
| --- | --- | --- |
| https://status.deepseek.com/ | **当前各组件状态**（分级）、活跃事故、近 24h 可用率 | 官方同源 JSON：`/api/status-page/6410630422455/summary/active` + `…/summary/structure?start_at_…`（HTML 解析作为兜底） |
| https://artificialanalysis.ai/leaderboards/models | 模型评分与百分位 | 解析服务端渲染的排行榜表格（API 需要 key） |
| https://openrouter.ai/api/v1/models | 百万 token 价格 | 公开 JSON |

- **状态采样每 20 秒**一次（只打 status 的两个小 JSON 接口，约 0.5 秒）；评分/价格目录每 **10 分钟**一次；
- 每次状态采样都会用缓存的评分/价格重算总分，所以线上事故/恢复会在大约 20 秒内反映到滑片（配合 5 秒轮询的 UI）；
- Web 端每 **5 秒**轮询 `/api/auto-lwf-sr/snapshot`，点「↻ / 再滑一次」立即触发一次状态重采（目录过期时后台补采）；
- 任一来源失败时沿用上一次成功值，并在详情面板标注「部分数据源降级」；时间戳带秒，方便确认是不是实时。

## 界面（v2：右下角浮层 + 二级面板）

- **位置**：`shell.overlay`，固定右下角（`right: 20; bottom: 184`，正好在小鲸鱼上方；想贴死角落把 `lib/client.js` 里的 `bottom: 184` 改成 `20` 即可）。
- **两种展示形式**（面板右上角 ⚙ 设置里切换，选择存在 `localStorage`）：
  - **胶囊**（默认）：六档立绘 + 档名 + 分数 + 涨跌箭头，**不显示任何滑块**；悬停会冒出吐槽气泡；
  - **头像**：**只显示立绘**（默认原创 SVG，无任何文字；内嵌梗图后为透明 PNG 贴纸），点击立绘打开二级面板。
- **设置面板**（点 ⚙ 进入）：
  - 显示形式：胶囊 / 头像；
  - **立绘大小**：56–160 px 滑杆，头像模式下实时生效；
  - **位置**：显示当前「右下偏移」，可一键「重置位置」；
  - 设置都写在 `localStorage`（`dsh.auto-lwf-sr.display / .size / .position`），只在本机生效。
- **拖动**：直接按住右下角的立绘/胶囊拖动即可换位置（≤5px 视为点击），松手后位置记住；拖到屏幕顶部附近时二级面板自动改为向下展开；窗口缩小时位置自动夹回可视区。
- **二级面板（点胶囊打开）**：
  - 大立绘、档名、台词、指数与「距下一档」进度条；
  - **可拖动滑片**（六段式滑轨）：拖动 / 点档位名 = 手动试滑，显示「试滑」徽标实时预览，松手 1.9 秒后平滑回落到实时档位；
  - 四个 tab：**因子**（稳定/实力/价格三条进度）、**评分**（Artificial Analysis 对照表）、**价格**（OpenRouter 百万 token 价目）、**走势**（最近 60 次采样折线）；
  - 页脚：数据源链接 + 更新时间 + 刷新按钮；点面板外或 Esc 收起。
- **动效**：面板缩放/位移进场、分数滚动计数、滑片回弹、档位切换气泡、控件 hover/按下反馈；`prefers-reduced-motion` 下自动关闭动画。
- **立绘**：公开仓库默认使用**原创六格矢量小人**（`art/tiers.js`，MIT 许可，内联 SVG 渲染）；插件管理器图标也是原创 SVG。
  想在本地换成六格梗图版：准备一张横向六格图（例如 1080×180，六格各 180×180；PNG 带透明圆角更好看），执行
  `node scripts/embed-meme.mjs <图片路径>`，它会把图片以 base64 重新内嵌进 `plugin/lib/client.js`。
  **不要提交这次改动**（梗图版权/肖像权由使用者自行承担；`git checkout -- plugin/lib/client.js` 可还原）。
- 「评分」页签顶部会写明 **DeepSeek 计入的是哪个 AA 变体**（当前为 `DeepSeek V4.1 Flash 1017 (max)`，即 V4.1 Flash 的最高分变体），「价格」页签写明取的是 OpenRouter 基础报价（`deepseek/deepseek-v4.1-flash`）。
- 数据口径与实时性见上一节；界面文字随 DSH 语言（中/英）切换。
## 安装 / 卸载

需要 DeepSeek Harness Desktop（带 Web UI 的 desktop profile）。

```text
# 1. 克隆仓库
git clone https://github.com/wxyz520/dsh-auto-lwf-sr.git
# 2. 在 DSH 里安装本目录（plugin/ 是插件包本体）
plugin_manager install_bundle target=/absolute/path/to/dsh-auto-lwf-sr/plugin
# 卸载
plugin_manager remove_bundle target=dsh-plugin-auto-lwf-sr
```

安装成功后在 DSH 右下角出现挂件，输入框下方不再有任何东西。
Host 代码（`plugin/lib/index.js`、`status.js` 等）改完后需要**完全退出 DSH 再打开**；
纯客户端（`plugin/lib/client.js`）调整会被 HMR 热替换，刷新页面即可。

## 开发自检

```bash
npm install
npm run check     # 全部 Host/Client 模块语法检查
npm test          # 评分/分级/上限单元测试
npm run test:ui   # jsdom 渲染 + 交互冒烟测试
```
