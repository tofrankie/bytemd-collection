## Context

见 [proposal.md](./proposal.md) 的 Why。当前 `@tofrankie/bytemd-plugin-highlight` 已经提供运行时高亮插件与样式导出，但样式层仍依赖透传上游 `highlight.js` 主题文件，无法表达仓库自己的 Primer 风格主题契约。仓库内已经安装 `@primer/primitives`，并且 `packages/plugin-highlight/src/base.scss` 已承载高亮规则，因此这次设计的重点是把“主题变量提取 + Sass 编译 + 包导出”串成稳定的构建流水线。

约束有三点：

- 只调整样式相关产物，现有 JS/TS 入口与运行时高亮行为保持不变
- 主题源来自 `packages/plugin-highlight/node_modules/@primer/primitives/dist/css/functional/themes`
- 输出既要覆盖全部可用 Primer 功能主题，也要提供不带变量定义的 `pure.css`
- 对外样式契约只保留 CSS 入口，不再维护 `scss/<theme>` 导出
- 仓库内需要保留一份便于 diff 的构建基准样式副本

## Goals / Non-Goals

**Goals:**

- 生成并发布映射到 `dist/styles/<theme>.css` 的 `styles/<theme>.css` 主题产物，覆盖 `@primer/primitives` 功能主题目录下的全部主题文件
- 生成映射到 `dist/styles/pure.css` 的 `styles/pure.css`，只保留 `rules.scss` 编译结果与变量引用
- 让生成主题中的变量定义局限在 `.hljs {}` 作用域，避免向页面全局泄漏 `--prettylights-*`
- 在构建产物和 README 中表达清楚新的导出契约，替换旧的 `highlight.js/styles/*` 透传方式
- 在包目录内保留一份可提交的主题基准产物，方便维护者比较上游升级前后的输出差异

**Non-Goals:**

- 不改动插件运行时代码、插件工厂 API、类型声明或 `highlight.js` 的加载逻辑
- 不把 Primer 主题变量抽成新的运行时切换 API
- 不在这次变更中扩展 Playground 功能，除非现有示例需要最小文档同步
- 不再继续维护 SCSS 子路径作为公开样式接口

## Decisions

### 使用构建脚本遍历 Primer 主题目录生成静态 CSS

样式产物将通过包内脚本在构建阶段一次性生成，而不是运行时读取 Primer 主题文件。脚本遍历 `@primer/primitives/dist/css/functional/themes` 目录，按文件名生成对应的 `styles/<theme>.css`。

这样做的原因是：

- 发布包需要稳定、可直接消费的静态产物
- 构建阶段更适合附加版本注释、过滤变量和整理导出字段
- 不把 Primer 主题目录结构暴露给消费者

备选方案是继续透传第三方 CSS 或在安装后脚本里复制文件，但这两种方式都无法把变量作用域收敛到 `.hljs`，也无法稳定表达 `pure.css` 与版本注释，因此不采用。

### 提取 `--prettylights-` 变量、`base.scss` 引用变量及其传递依赖

生成主题时，脚本会先收集两类根变量：一类是以 `--prettylights-` 开头的变量定义，另一类是 `src/base.scss` 编译结果里通过 `var(...)` 引用到的主题变量。随后再递归补齐这些定义所依赖的其他变量，最后把变量声明整体包裹进 `.hljs {}`。这样能保证高亮配色和基础代码块样式所需变量都完整可用，同时避免把 Primer 主题里的全部变量泄漏到代码块外部。

备选方案是把整个主题文件原样包到 `.hljs {}` 下，或只保留直接匹配 `--prettylights-` 的声明。前者会带入大量与高亮无关的变量，后者会遗漏 `base.scss` 直接依赖的主题变量，并且在存在链式变量引用时产生缺失，因此都不采用。

### `pure.css` 与主题 CSS 共享同一份规则编译结果

`src/base.scss` 通过 `sass` 编译成基础规则 CSS，作为所有主题产物的公共尾部。`pure.css` 只写出这份规则结果；`styles/<theme>.css` 则在其前面拼接 `.hljs` 作用域下的变量定义块。

这样可以确保：

- 规则选择器只维护一处
- `pure.css` 与主题 CSS 在规则层没有漂移
- 后续新增主题时不需要重复参与 Sass 逻辑

备选方案是为每个主题单独编译一遍 SCSS 或维护两套规则文件，但这会增加构建成本和维护面，因此不采用。

### 仓库内额外保留一份基准样式产物

正式发布样式将写入 `dist/styles/`，同时构建流程还会同步写出一份仅供仓库维护使用的基准产物 `artifacts/styles/`。这份目录与发布 CSS 使用完全相同的生成结果，但不写入包 `exports` 或发布文件清单。

这样做的原因是：

- 维护者升级 `@primer/primitives` 后可以直接通过 Git diff 判断主题产物是否变化
- 不把“用于对比的留档产物”和“对外发布入口”混在同一个目录语义里，也不让公开样式目录进入仓库版本管理
- 后续如果还要补充主题清单或生成报告，可以继续放在 `artifacts/` 下扩展

备选方案是只保留发布目录 `styles/` 作为比较基线，或使用 `snapshots/` 命名。前者会把公开 API 和仓库留档混为一谈，后者更像测试快照语义，因此不采用。

### 包导出显式列出样式子路径

包的 `exports`、`files` 与构建脚本会同步更新，确保消费者只能通过 `@tofrankie/bytemd-plugin-highlight/styles/<theme>.css` 与 `.../styles/pure.css` 访问产物，而这些入口实际映射到 `dist/styles/` 下的发布文件。README 示例也以这些稳定子路径为准，同时移除 `scss/<theme>` 的任何说明。

备选方案是继续暴露宽泛的 `./styles/*` 并依赖目录复制结果自然生效。虽然实现上更省事，但这次变更需要明确从“第三方样式镜像”切换到“本包自有主题产物”，因此仍要同步审视导出清单与文档。

## Risks / Trade-offs

- [Primer 主题文件命名或目录结构未来发生变化] → 构建脚本基于实际目录遍历，并在缺少目录或无主题文件时显式失败
- [变量依赖提取不完整导致主题颜色失效] → 用递归依赖收集并在任务中加入产物抽样校验
- [`.hljs` 作用域过窄或过宽影响现有高亮选择器] → 保持变量只在 `.hljs` 上定义，规则仍沿用现有 `rules.scss` 的选择器结构
- [README 与真实导出不一致] → 文档更新与导出字段变更放在同一任务中验证
- [仓库内基准产物与发布产物漂移] → 让两者来自同一生成流程，并在验证任务中抽样比对

## Migration Plan

1. 调整 `packages/plugin-highlight` 的构建依赖与脚本，接入 Sass 编译和 Primer 主题遍历逻辑
2. 更新包导出与发布文件清单，生成 `styles/<theme>.css` 和 `styles/pure.css`
3. 同步写出仓库内基准产物目录，供后续升级上游依赖时比较差异
4. 删除或停止生成旧的 `highlight.js` 样式透传产物与 `scss` 导出
5. 更新 README 使用说明，并通过构建与导出检查确认新入口可用

## Open Questions

- 如果 `@primer/primitives` 主题目录中同时存在不适合代码高亮使用的文件，是否需要在实现阶段引入显式忽略名单；这可以在读取实际目录后再决定，不影响当前任务拆分
