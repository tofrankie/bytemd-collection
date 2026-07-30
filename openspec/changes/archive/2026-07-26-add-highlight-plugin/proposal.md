## Why

当前仓库缺少官方维护的代码语法高亮插件，使用者需要自行集成 `highlight.js`。已有的 `highlight-example` 包实现陈旧且不符合本仓库的包名、构建和文档约定，因此需要将其演进为可发布、可维护的插件。

## What Changes

- 新增 `bytemd-plugin-highlight-github` 子包，为 ByteMD Viewer 中的代码块提供基于最新版 `highlight.js` 的语法高亮。
- 复用示例中的按需加载与可选初始化回调行为，避免在未渲染代码块时加载高亮库。
- 按现有 Mermaid 子包的约定提供 ESM、CJS、UMD 和 TypeScript 声明产物，并将 `bytemd` 保持为 peer dependency。
- 提供与现有子包一致的 README、发布元数据和安装使用示例。

## Capabilities

### New Capabilities

- `highlight-plugin`: 提供可配置、按需加载的 ByteMD 代码语法高亮插件及其可发布的包入口。

### Modified Capabilities

- `playground-plugin-routes`: 新增高亮插件的独立 Playground 路由与可编辑示例。

## Impact

- 新增 `packages/highlight` 工作区包、源代码、构建配置和文档。
- 新增对最新版 `highlight.js` 的运行时依赖。
- 用户可通过 `bytemd-plugin-highlight-github` 导入插件，并自行导入所需的 `highlight.js` 主题样式。
- Playground 新增高亮插件依赖、路由和示例页面。
