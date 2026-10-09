# Figma 素材与连线步骤

此项目未连接 Figma，也未创建在线 Figma 文件。以下素材用于在你们自己的 Figma 文件中建立正式交互原型。页面是 SVG 矢量素材，图形与文本可编辑；不是 Figma 原生 Auto Layout 组件。字体导入时可能需要替换为 Inter 或 Arial。

## 导入

1. 新建 Figma Design 文件，创建 `01 · Prototype` 页面。
2. 将 `deliverables/figma/*.svg` 拖入画布。每个文件都是 390 px 宽的手机页面。
3. 为每张页面创建同尺寸 Frame，把导入的图层放入对应 Frame 内。SVG 本身通常导入为 Group，需手动建立 Frame。
4. 用 `deliverables/figma/*.png` 对照检查；这些 PNG 与网页一致，可作为视觉参照。矢量导出不保留浏览器 CSS 阴影、动画或实时相机。
5. 主要按钮和整张候选卡使用整块点击区域；如导入图层分散，添加透明矩形作为 hotspot。删除不必要的覆盖层以免挡住按钮。
6. 第二个 Figma 页面 `02 · Study & notes` 保存三个任务、规则边界和后续待核实项。

## 页面与 Prototype 连线

| 起点                  | 点击/触发                     | 终点                    |
| --------------------- | ----------------------------- | ----------------------- |
| `01-scan-bottle`      | Scan item                     | `02-result-recycling`   |
| `02-result-recycling` | Got it, thank you             | `03-complete`           |
| `03-complete`         | Sort another item             | `01-scan-bottle`        |
| `04-scan-cup`         | Scan item                     | `05-candidates`         |
| `05-candidates`       | Takeaway coffee cup           | `06-result-general`     |
| `05-candidates`       | Plastic food container        | `14-result-container`   |
| `05-candidates`       | Compostable cup               | `15-result-compostable` |
| `05-candidates`       | None of these?                | `09-search`             |
| `07-scan-packet`      | Scan item                     | `08-unrecognised`       |
| `08-unrecognised`     | Search for my item            | `09-search`             |
| `09-search`           | 输入框 hotspot                | `10-search-chips`       |
| `10-search-chips`     | Chip packet                   | `11-result-packet`      |
| 任一扫描页面          | Search for an item instead    | `09-search`             |
| 所有结果页面          | Not your item? Search instead | `09-search`             |
| `12-search-empty`     | Browse common items           | `09-search`             |
| `13-missing-bin`      | Look up another item          | `09-search`             |
| `16-station-error`    | Try the demo station          | `01-scan-bottle`        |

结果确认应连接到物品一致的完成页：`06-result-general` → `17-complete-cup`，`11-result-packet` → `18-complete-packet`。`14-result-container` 和 `15-result-compostable` 可直接连接回各自扫描情境，或复制完成页修改物品名。不要把非瓶子结果连接到显示瓶子名称的完成页。

为三条任务分别设定 Flow starting point：`01-scan-bottle`、`04-scan-cup`、`07-scan-packet`。使用 On tap → Navigate to → Instant，避免装饰动画增加完成时间。Back 可使用 Back action；Retake 和 Scan again 返回相应的扫描页。

Figma 基础原型的文本搜索用预设状态模拟：点击输入框进入已经填写 chips 的页面。请向测试参与者说明搜索为模拟输入，避免把文字输入的熟练程度作为网页与 Figma 的可比指标。网页版本则支持实际搜索与多词过滤。

## 分享和提交前检查

- 以 View / Present 模式完整走完三条流程，验证点击区域与返回。
- 选择原型的分享权限，使用 Figma 提供的真实 Prototype link，检查组外用户可打开；不要把编辑文件链接误当作演示入口。
- 用真实最终 Figma 文件导出单一 PDF，附上实际原型链接。仓库生成的 PDF 是参考合集，不能证明 Figma 连线完成。
- `deliverables/user-tasks.pdf` 只有三个参与者任务。测量方法与主持人操作在 `docs/USABILITY_TESTING.md`，不需要把正确答案告知参与者。
- 对未经确认的校园规则保留示例标识。真实地点和色彩确认后，同步修改 Figma、`src/data.ts` 及任务答案。

## 可复用组件建议

Header、Station context、Primary button、Search button、Candidate card、Result bin card、Handling note。将垃圾桶结果做成 Category variants（Recycling / General / Organics）；保留图标、文字与颜色三种提示，不依赖颜色单独传递信息。
