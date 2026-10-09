# Part II · 三任务评估计划

这是测试计划与空白记录模板，**尚未进行真实用户测试**。不要把自动化测试结果写成用户表现。

## 参与者与设置

邀请至少三位组外的典型大学生。每位约 10–15 分钟；使用手机，在能安全停留的模拟垃圾桶旁测试，准备空塑料瓶、外带咖啡杯和薯片包装。垃圾桶贴示例标签以对应原型；测试物品和全部分类答案都是 study fixtures，不建议在未经确认的真实桶投放。

告知参与者这是界面研究，不是对参与者能力的考试；AI 和分类规则是模拟数据，没有上传照片。录音/录像只在取得同意后使用，参与者可退出。用 P1/P2/P3 记录，不需要姓名、学号或账号。

主持人在每个任务开始前选择对应场景或打开带 scenario 的入口。桌面场景栏和手机底部折叠控件由主持人操作。Figma 中设置三条独立 Flow starting point。不要在正式计时前透露正确类别。

## 参与者看到的任务（恰好三个）

1. **An empty bottle.** You are at the Demo Library bin station with an empty plastic drink bottle. Use the prototype to find where it belongs and what you should do before disposing of it. Tell the facilitator when you are ready.
2. **A confusing coffee cup.** You have a takeaway coffee cup made of paper with a plastic lining. The scanner may show similar items. Use the prototype to work out which bin to use and any preparation needed. Tell the facilitator when you are ready.
3. **A packet the scanner cannot identify.** You have an empty chip packet. Use the prototype to find what to do if the scan cannot identify it. Tell the facilitator the recommended bin and any instruction you find.

参与者版也在 `deliverables/user-tasks.pdf`。不要给他们看下一节答案。

## 主持人设定和成功条件

| 任务 | 设定                                    | 成功标准（示例规则）                                                                           |
| ---- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| T1   | `scenario=confident` / Figma 瓶子起点   | 主动扫描；读到 Plastic drink bottle → Recycling；提及 Empty any liquid first                   |
| T2   | `scenario=ambiguous` / Figma 咖啡杯起点 | 从候选选择 Takeaway coffee cup；读到 General waste；提及 Empty leftover coffee first           |
| T3   | `scenario=unknown` / Figma 包装起点     | 能从未识别状态转入搜索；找到 Chip packet；读到 General waste，Keep it out of the recycling bin |

所有任务的默认站点为 `library-03`。网页搜索可输入 chips、packet 或 wrapper。Figma 输入用预设 chips 状态，明确记录工具差异。若参与者从扫描页直接使用搜索且达到正确结果，记录为“后备路径完成”，不要误判为识别流程完成。

## 测量

- **完成情况：** unaided / assisted / failed / fallback completed。助手提示前已找到答案的情况不能标为 assisted。
- **完成时间：** 页面就绪且主持人说开始时计时，到参与者正确说出类别和处理提示时结束。固定 750 ms 模拟识别等待计入；不宣称这是实际 AI 耗时。120 秒仍未完成可结束并记录 failed，不把耗时当作成功。
- **错误与犹豫：** 误选候选、错误分类、遗漏处理提示、死路、返回次数、寻找按钮、看错站点。
- **求助：** 提示次数和具体提示原文。
- **任务后难度：** 每任务 SEQ（1 very difficult–7 very easy），问“Overall, how difficult or easy was this task?”
- **定性反馈：** “What made you hesitate?” “What would you change?” “Would this help when your hands are full?”

可将“至少 8/9 个任务无帮助完成、完成时间中位数 ≤ 20 秒、无错误类别”作为内部迭代目标，**不是课程指定标准，也不是已有结果**。样本很小，以发现问题为主，不作统计推广。

## 记录模板

| Participant | Task | Outcome | Time (s) | Wrong taps | Help / exact prompt | Bin correct? | Note noticed? | SEQ (1–7) | Observations |
| ----------- | ---- | ------- | -------- | ---------- | ------------------- | ------------ | ------------- | --------- | ------------ |
| P1          | T1   |         |          |            |                     |              |               |           |              |
| P1          | T2   |         |          |            |                     |              |               |           |              |
| P1          | T3   |         |          |            |                     |              |               |           |              |
| P2          | T1   |         |          |            |                     |              |               |           |              |
| P2          | T2   |         |          |            |                     |              |               |           |              |
| P2          | T3   |         |          |            |                     |              |               |           |              |
| P3          | T1   |         |          |            |                     |              |               |           |              |
| P3          | T2   |         |          |            |                     |              |               |           |              |
| P3          | T3   |         |          |            |                     |              |               |           |              |

固定顺序便于主持人操作，但可能有学习效应；若能熟练切换起点，使用 P1=T1/T2/T3、P2=T2/T3/T1、P3=T3/T1/T2。记录采用哪种顺序。

## 迭代记录

| Issue ID | Evidence / participants | Severity | Proposed change | Version applied | Retest observation |
| -------- | ----------------------- | -------- | --------------- | --------------- | ------------------ |
|          |                         |          |                 |                 |                    |

按 blocker（无法完成）/ major（错误决定或需要帮助）/ minor（额外操作或阅读）/ cosmetic 排优先级。基于观察改界面，保存修改前后素材；来不及修复的问题记录具体修法。当前没有预填问题或编造迭代证据。
