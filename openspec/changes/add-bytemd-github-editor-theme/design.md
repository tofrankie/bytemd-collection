## Context

当前仓库的 `packages/bytemd/src/index.scss` 仍使用 `@primer/css` 的 Sass 变量组织编辑器默认样式，而不是基于 CSS 自定义属性消费主题 token。与此同时，仓库已经在 `bytemd-theme-github` 和 `bytemd-plugin-highlight-github` 中验证过两类与本次设计直接相关的模式：

- 纯规则产物与主题变量产物可以拆开发布
- 基于 `@primer/primitives` 生成主题产物时，应保留一份可提交的 artifacts 快照用于升级比对

本次变更不改造 `@tofrankie/bytemd` 本体，而是单独提供一个新的编辑器主题包，让宿主在不替换编辑器源码的前提下，获得一套 GitHub/Primer 风格的 bytemd 编辑器主题产物与 SCSS 组合能力。

## Goals / Non-Goals

**Goals:**

- 提供 `bytemd-theme-editor-github` 样式包，并将其定位为“规则 + token”的资产包，而不是运行时插件。
- 生成 `pure.css`、`light.css`、`dark.css`、`auto.css` 四类首版产物。
- 暴露 SCSS mixin，使宿主可以为多个 target selector 分别挂载 light/dark/auto 主题 token。
- 通过“变量依赖闭包”只提取当前规则真正需要的 Primer token，并保留 artifacts 快照便于后续 diff。

**Non-Goals:**

- 不修改 `@tofrankie/bytemd` 的默认样式源码、组件结构或运行时主题切换逻辑。
- 不在首版验证中发布全部 Primer 主题变体的独立 CSS 入口。
- 不把主题注入做成 JS API、Bytemd 插件工厂或运行时 DOM 探测逻辑。

## Decisions

### 以独立主题包而不是改造 `@tofrankie/bytemd`

`bytemd-theme-editor-github` 将作为新子包存在，负责发布编辑器主题规则与 token 产物，不反向修改 `packages/bytemd`。这样可以把“主题系统实验”和“编辑器内核维护”解耦，避免把当前仍基于 Sass 变量的默认样式改造风险混入本次工作。

备选方案是直接重写 `@tofrankie/bytemd` 的 `index.scss`，把默认样式迁移为 CSS 变量消费模式。这个方向最终也许有价值，但会扩大实现范围和验证成本，与当前已确认边界冲突，因此不采用。

### 将规则输出与主题 token 输出拆为两个 mixin

SCSS 入口将参考 `github-markdown-css` 的思路，拆成两类职责：

- `render-rules()`：只输出 `src/index.scss` 及其 import 链路编译后的选择器和 `var(--token)` 引用
- `render-theme-tokens()`：只输出 token 定义，并负责不同 target 的 selector / mode 组合

这样 `pure.css` 可以视为 `render-rules()` 的发布产物，而 `light.css`、`dark.css`、`auto.css` 则是“token 定义 + pure 规则”的组合产物。

备选方案是让构建脚本直接生成一套写死容器的成品 CSS，而不暴露 SCSS mixin。该方案对简单消费友好，但会失去“不同规则可挂到不同容器”的能力，因此不采用。

### target 采用多容器声明，而不是单一 container

由于同一套编辑器规则中可能同时出现 `.bytemd`、`.tippy-box` 以及其他宿主 selector，`render-theme-tokens()` 不能只接受单个 `container`。更合适的输入结构是支持 `targets` 数组，每个 target 独立声明：

- `container`
- `modes`
- 每个 mode 对应的 `selectors`
- 所使用的 `tokens`

这样宿主既可以给 `.bytemd` 和 `.tippy-box` 复用同一套 light/dark token，也可以在将来为不同 selector 分别指定不同的主题挂载方案。

备选方案是沿用单 `container` 结构，要求所有变量都挂到统一宿主节点。这会让 Tippy 这类脱离编辑器根节点的浮层难以稳定继承变量，因此不采用。

### 首版只发布 `pure`、`light`、`dark`、`auto`

虽然构建阶段会遍历 `@primer/primitives` 的主题目录以支持 token 选择与未来扩展，但首版对外验证产物只发布：

- `pure.css`
- `light.css`
- `dark.css`
- `auto.css`

其中 `light`、`dark` 是单色模式产物，`auto` 仅负责在 light/dark 两组 token 之间自动切换，不额外引入 `dark-dimmed` 或高对比变体。

备选方案是首版直接把所有 Primer 主题都生成成独立入口。该方案会放大校验面和文档面，不利于先验证整体模型，因此不采用。

### token 只按规则依赖闭包提取

构建脚本不会把 Primer 静态 token 文件和主题文件全量拼进产物，而是采用和高亮主题类似但更通用的流程：

1. 编译规则源文件，收集所有 `var(--token)` 引用
2. 从主题文件与 Primer functional 静态文件中查找这些 token 的定义
3. 递归收集定义值里继续引用的 token
4. 只把最终闭包中的 token 写入目标产物

这里的 token 来源会分成两层：

- 主题相关 token：来自 `dist/css/functional/themes/*.css`
- 非主题基础 token：来自 spacing、typography、radius、border 等 functional 静态文件

备选方案是把整个 Primer theme file 或全部 functional 文件直接包进每个主题产物。该方案实现简单，但产物膨胀严重、artifacts diff 噪声高，因此不采用。

### artifacts 目录作为主题快照基准

和 `bytemd-plugin-highlight-github` 一样，新包会把发布样式写入 `dist/`，同时把同源生成的快照写入 `artifacts/` 并纳入版本控制。这样升级 `@primer/primitives` 或调整规则后，维护者可以直接对比快照变化，而不是只依赖临时构建目录。

备选方案是只保留 `dist/` 构建结果。该方案不利于审查上游升级带来的主题变化，因此不采用。

## Risks / Trade-offs

- [规则源文件需要先迁移为 `var(--token)` 消费模式，初版会有一定手工映射成本] → 先限定首版产物和主题范围，只覆盖当前编辑器主题所需规则。
- [不同 target 的 selector 组合可能导致 SCSS API 过于复杂] → 保持 `targets -> modes -> selectors/tokens` 这一层级固定，不额外引入隐式简写。
- [Primer token 依赖来源跨 theme 文件与静态 functional 文件，提取逻辑容易漏边界] → 用闭包校验和 artifacts diff 双重验证，并把缺失 token 视为构建失败。
- [首版只发布 light/dark/auto，意味着其他 Primer 主题暂时不能直接消费] → 在 README 中明确这是首版验证范围，后续再按同一模型扩展。

## Migration Plan

1. 新建 `packages/theme-github-editor`，建立基础包元数据、README、SCSS 源目录与构建脚本骨架。
2. 抽取编辑器主题规则源，形成 `render-rules()` 与 `pure.css` 输出链路。
3. 实现 Primer token 收集和多 target 主题 mixin，生成 `light.css`、`dark.css`、`auto.css`。
4. 为包补齐 artifacts 快照、对外导出和说明文档，并通过构建校验验证首版产物。
