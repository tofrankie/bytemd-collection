## Context

当前仓库的 `packages/bytemd/src/index.scss` 仍使用 `@primer/css` 的 Sass 变量组织编辑器默认样式，而不是基于 CSS 自定义属性消费主题 token。与此同时，仓库已经在 `bytemd-theme-github` 和 `bytemd-plugin-highlight-github` 中验证过两类与本次设计直接相关的模式：

- 纯规则产物与主题变量产物可以拆开发布
- 基于 `@primer/primitives` 生成主题产物时，应保留一份可提交的 artifacts 快照用于升级比对

本次变更不改造 `@tofrankie/bytemd` 本体，而是单独提供一个新的编辑器主题包，让宿主在不替换编辑器源码的前提下，获得一套 GitHub/Primer 风格的 bytemd 编辑器主题产物与 SCSS 组合能力。

## Goals / Non-Goals

**Goals:**

- 提供 `bytemd-theme-editor-github` 样式包，并将其定位为“规则 + token”的资产包，而不是运行时插件。
- 生成 `pure.css`、全部 Primer concrete theme 与 8 组 `auto-*.css` 自动主题产物。
- 暴露 SCSS mixin，使宿主可以为多个 target 分别声明基础 token 容器、主题 token selector 与可选 `media` 分支。
- 将规则拆分为可发布的 `src/patchs/*.scss` 文件，方便增减和按需组合。
- 通过“变量依赖闭包”按每个 patch 只提取其真正需要的 Primer token，并保留 artifacts 快照便于后续 diff。

**Non-Goals:**

- 不修改 `@tofrankie/bytemd` 的默认样式源码、组件结构或运行时主题切换逻辑。
- 不把主题注入做成 JS API、Bytemd 插件工厂或运行时 DOM 探测逻辑。
- 不发布用于转发默认主题的 JS 包入口；包根直接作为 `light.css` 样式入口。

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

### 发布全部 concrete theme 与自动配对主题

构建阶段遍历 `@primer/primitives` 的 functional theme 目录，并为每个 concrete theme 发布一个同名 CSS 入口。当前具体包括：

- light 系列：`light`、`light-colorblind`、`light-colorblind-high-contrast`、`light-high-contrast`、`light-tritanopia`、`light-tritanopia-high-contrast`
- dark 系列：`dark`、`dark-colorblind`、`dark-colorblind-high-contrast`、`dark-dimmed`、`dark-dimmed-high-contrast`、`dark-high-contrast`、`dark-tritanopia`、`dark-tritanopia-high-contrast`

同时发布 `auto.css` 及 7 个 `auto-*.css` 配对入口。每个自动主题都按照显式的 light、light-auto、dark、dark-auto 分支，在 `data-color-mode` / `data-*-theme` selector 与 `prefers-color-scheme` media query 下切换对应 token。这样使用方可以直接复用 Primer 可用主题，也可以选择常用的自动配对。

备选方案是继续限制在 `pure/light/dark/auto`。该方案会使构建阶段已经可用的 Primer theme 与 README、发布接口不一致，因此不采用。

### token 按 patch 规则依赖闭包提取

构建脚本扫描 `src/patchs/` 中除聚合入口外的每个 SCSS patch，分别编译其 `render-<name>()` mixin，并从对应规则输出中收集 `var(--token)` 引用。每个 patch 再独立采用和高亮主题类似但更通用的流程：

1. 编译 patch 规则源文件，收集所有 `var(--token)` 引用
2. 从主题文件与 Primer functional 静态文件中查找这些 token 的定义
3. 递归收集定义值里继续引用的 token
4. 只把最终闭包中的 token 写入该 patch 对应的目标 container

这里的 token 来源会分成两层：

- 主题相关 token：来自 `dist/css/functional/themes/*.css`
- 非主题基础 token：来自 spacing、typography、radius、border 等 functional 静态文件

该设计保证 `.tippy-box` 等 patch 不会携带只被 `.bytemd` 使用的 token；后续新增 patch 也会自动纳入同一套收集链路。备选方案是把整个 Primer theme file 或全部 functional 文件直接包进每个主题产物。该方案实现简单，但产物膨胀严重、artifacts diff 噪声高，因此不采用。

### patch 源文件作为可发布的扩展点

规则源文件保留在 `src/patchs/`，其中 `index.scss` 是唯一的聚合入口。包通过 `patchs/*.scss` 公开单个 patch，供高级使用方按需 `@use` 对应的 `render-<name>()` mixin。

新增 patch 的固定流程为：

1. 新建 `src/patchs/<name>.scss`，并暴露 `render-<name>()` mixin。
2. 在 `src/patchs/index.scss` 中导入并聚合该 mixin。
3. 执行包构建，使规则、token、dist 与 artifacts 快照同步更新。

### artifacts 目录作为主题快照基准

和 `bytemd-plugin-highlight-github` 一样，新包会把发布样式写入 `dist/`，同时把同源生成的快照写入 `artifacts/` 并纳入版本控制。这样升级 `@primer/primitives` 或调整规则后，维护者可以直接对比快照变化，而不是只依赖临时构建目录。

备选方案是只保留 `dist/` 构建结果。该方案不利于审查上游升级带来的主题变化，因此不采用。

## Risks / Trade-offs

- [规则源文件需要先迁移为 `var(--token)` 消费模式，初版会有一定手工映射成本] → 只覆盖当前编辑器主题所需规则，并按 patch 单独校验 token 闭包。
- [不同 target 的 selector 组合可能导致 SCSS API 过于复杂] → 保持 `targets -> modes -> selectors/tokens/media` 这一层级固定，不额外引入隐式简写。
- [Primer token 依赖来源跨 theme 文件与静态 functional 文件，提取逻辑容易漏边界] → 用闭包校验和 artifacts diff 双重验证，并把缺失 token 视为构建失败。
- [全部 Primer theme 与自动配对主题会扩大发布及快照的校验面] → 由构建脚本统一枚举 concrete theme、集中维护自动配对表，并提交 artifacts 快照用于 diff。

## Migration Plan

1. 新建 `packages/theme-editor-github`，建立基础包元数据、README、SCSS 源目录与构建脚本骨架。
2. 将编辑器规则拆分到 `src/patchs/`，形成 `render-rules()` 与 `pure.css` 输出链路。
3. 实现按 patch 的 Primer token 收集和多 target 主题 mixin，生成所有 concrete theme 与 `auto-*.css` 产物。
4. 为包补齐 artifacts 快照、CSS、SCSS、patch 对外导出和说明文档，并通过构建校验验证全部发布入口。
