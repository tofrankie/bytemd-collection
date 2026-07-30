## Purpose

定义 `bytemd-theme-github` 的主题来源、导出方式、样式补丁和 README 约定，确保该包为 bytemd 提供可直接消费的 GitHub 风格主题样式。

## Requirements

### Requirement: 可发布的 GitHub 主题包

系统 SHALL 提供名为 `bytemd-theme-github` 的工作区包，用于发布适配 bytemd 的 GitHub 风格主题样式。该包 MUST 复用 `@tofrankie/github-markdown-css` 的顶层主题产物，MUST NOT 暴露 `primer/*` 主题入口，并 MUST 提供与当前维护子包一致的发布元数据、README、`LICENSE` 与 `CHANGELOG.md`。

#### Scenario: 查看主题包元数据

- **WHEN** 维护者检查 `packages/theme-github/package.json`
- **THEN** 该文件 MUST 声明 `name: 'bytemd-theme-github'`，并提供指向当前项目的 `author`、`homepage`、`repository`、`bugs`、`license`、`files` 与 `funding` 信息

#### Scenario: 发布主题包内容

- **WHEN** 使用者安装并消费 `bytemd-theme-github`
- **THEN** npm 包 MUST 包含 README 中承诺的主题样式文件、`LICENSE` 与 `CHANGELOG.md`，且 MUST NOT 发布 `primer/*` 主题入口

### Requirement: 默认主题与短路径导出

`bytemd-theme-github` SHALL 以条件导出提供默认浅色主题入口，并 SHALL 支持 `bytemd-theme-github/<theme>.css` 形式的短路径导入。系统 MUST NOT 要求消费者通过 `styles/*` 或其他内部目录层级导入主题文件。

#### Scenario: 默认导入主题包

- **WHEN** 使用者执行 `import 'bytemd-theme-github'`
- **THEN** 系统 MUST 加载默认的 `light` 主题样式

#### Scenario: 显式导入某个主题

- **WHEN** 使用者执行 `import 'bytemd-theme-github/dark.css'`
- **THEN** 系统 MUST 解析到该主题对应的最终样式文件，而不要求再包含 `styles/` 等额外路径段

### Requirement: 每个主题包含 bytemd 适配补丁

每个由 `bytemd-theme-github` 对外发布的主题文件 SHALL 在上游 GitHub 主题样式基础上叠加 bytemd 所需的兼容补丁。补丁 MUST 覆盖当前仓库确认的脚注、`.bytemd-mermaid`、`pre code.hljs`、task list checkbox 与 `.math.math-display` 等渲染差异。

#### Scenario: 渲染 Mermaid、代码块与数学公式

- **WHEN** 使用者在应用中导入任一 `bytemd-theme-github` 主题并渲染包含 Mermaid、高亮代码块和块级数学公式的 Markdown
- **THEN** 系统 MUST 为 `.bytemd-mermaid` 提供额外下边距、移除 `pre code.hljs` 的内层 padding，并为 `.math.math-display` 应用一致的块级间距

#### Scenario: 渲染脚注与任务列表

- **WHEN** 使用者在应用中导入任一 `bytemd-theme-github` 主题并渲染包含脚注和 task list 的 Markdown
- **THEN** 系统 MUST 提供与 GitHub 风格一致的脚注与 task list 可视样式，而不要求使用者再额外导入补丁文件

### Requirement: 主题包以样式资产为主

`bytemd-theme-github` SHALL 以 CSS 主题入口作为主要消费方式。该包 MUST NOT 依赖运行时 JS 注入主题，也 MUST NOT 提供 `unpkg`、`jsdelivr` 或 UMD 形式的浏览器分发入口作为包契约的一部分。

#### Scenario: 检查包的公开消费模型

- **WHEN** 维护者检查 `packages/theme-github/package.json` 与 README
- **THEN** 公开用法 MUST 以 CSS 导入为主，且包元数据 MUST NOT 要求提供 `unpkg`、`jsdelivr` 或 UMD 字段

### Requirement: 主题包 README 说明推荐插件组合

`bytemd-theme-github` 的 README SHALL 明确说明该主题通常与 `bytemd-plugin-gfm` 和 `bytemd-plugin-highlight-github` 等插件组合使用，并 MUST 提供包含主题导入、GFM 插件与高亮插件的最小接入示例。

#### Scenario: 查看主题包 README 用法

- **WHEN** 使用者打开 `packages/theme-github/README.md`
- **THEN** README MUST 展示 `bytemd-theme-github` 的默认或显式主题导入方式，并说明如何与 `bytemd-plugin-gfm`、`bytemd-plugin-highlight-github` 一起接入 bytemd
