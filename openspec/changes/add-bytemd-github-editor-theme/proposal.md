## Why

当前仓库已经有面向 Markdown 预览的 `bytemd-theme-github`，但还缺少一个面向 bytemd 编辑器整体样式的官方主题包。现有编辑器样式仍以内置 Sass 变量实现，无法直接复用 Primer 主题 token，也无法为 `.bytemd`、`.tippy-box` 等不同宿主容器提供统一、可复用的主题挂载方案。

## What Changes

- 新增 `bytemd-theme-editor-github` 工作区子包，作为 bytemd 编辑器主题样式资产包发布。
- 为该包生成 `pure.css`、`light.css`、`dark.css`、`auto.css` 四类首版验证产物。
- 提供 SCSS 入口，将“规则输出”和“主题 token 输出”拆分为独立 mixin，允许宿主为多个 selector 自由声明主题挂载目标。
- 构建阶段遍历 `@primer/primitives` 主题目录，并基于规则里实际引用的 CSS 变量递归收敛所需 token，而不是全量合并所有 Primer 变量。
- 保留 artifacts 快照产物，方便后续升级 Primer 依赖时比对主题输出差异。

## Capabilities

### New Capabilities

- `github-editor-theme-package`: 定义 `bytemd-theme-editor-github` 的发布模型、主题产物、SCSS mixin 能力和 Primer token 提取约定。

### Modified Capabilities

- 无

## Impact

- 受影响代码：新增 `packages/theme-github-editor` 子包、主题构建脚本、SCSS 源文件、README 与 artifacts 快照目录。
- 受影响依赖：新增或复用 `@primer/primitives`、`sass` 以及主题构建所需的 Node 脚本依赖。
- 受影响对外接口：新增 `bytemd-theme-editor-github` 包名、`pure/light/dark/auto` CSS 入口，以及供宿主调用的 SCSS mixin。
