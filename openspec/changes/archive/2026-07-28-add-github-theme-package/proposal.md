## Why

当前仓库缺少一个官方维护的 GitHub 风格 bytemd 主题包，`playground` 里的 GFM 示例也仍直接依赖上游样式，无法验证“本仓库最终对外发布的主题入口”本身。现在需要把 GitHub Markdown 主题、bytemd 适配补丁和完整插件组合示例收敛到仓库自己的可发布包与测试页面中，避免后续新增样式或插件联动时继续分散维护。

## What Changes

- 新增 `bytemd-theme-github` 子包，基于 `@tofrankie/github-markdown-css` 的顶层主题产物提供 bytemd 可直接消费的 GitHub 风格主题样式。
- 主题包默认导出浅色主题，并支持 `import 'bytemd-theme-github/<theme>.css'` 形式的短路径导入，不暴露 `styles/*` 或 `primer/*` 这类额外层级。
- 在主题包中叠加 bytemd 适配样式，覆盖脚注、Mermaid 块、代码高亮块、task list 和数学公式块等当前仓库已知的渲染差异。
- 在主题包 README 中说明它通常与 GFM、Highlight 等插件组合使用，并给出最小接入示例。
- 为 playground 新增一个完整的 bytemd 测试示例页面，参考 `github-blogger` 编辑器所使用的插件组合，优先接入本仓库 workspace 包，并补齐其余官方插件。
- 让现有 GFM playground 页面改为消费新主题包，从仓库内部直接验证最终发布的主题入口与样式效果。

## Capabilities

### New Capabilities

- `github-theme-package`: 定义 `bytemd-theme-github` 的主题来源、默认与子路径导出、bytemd 适配补丁、发布元数据和 README 用法约定。

### Modified Capabilities

- `playground-plugin-routes`: playground 新增完整 bytemd 组合示例页，并允许现有示例页直接消费仓库内发布的主题包入口来验证真实集成效果。

## Impact

- 受影响代码：`packages/theme-github` 新子包、根 `package.json`/工作区配置、`playground` 路由与示例页面、相关 README 与示例 Markdown。
- 受影响依赖：继续复用 `@tofrankie/github-markdown-css`，并为完整示例页补齐需要的官方 bytemd 插件依赖。
- 受影响对外接口：新增 `bytemd-theme-github` 包名、默认 `light` 主题入口、`<theme>.css` 短路径导入方式，以及完整组合 playground 示例路由。
