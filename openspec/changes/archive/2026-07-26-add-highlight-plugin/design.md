## Context

仓库已有 `packages/highlight-example`，其中实现了对 `pre > code` 元素的按需高亮，但该包沿用上游的包名、旧构建方式和旧依赖版本，不能作为本仓库的正式发布包。现有 `packages/mermaid` 已建立 TypeScript、`tsdown`、README 与发布入口的子包约定。

本次新增的运行时依赖为 npm 当前稳定版 `highlight.js@11.11.1`。插件仅在 Viewer 已渲染代码块时加载该依赖，并将主题样式的选择留给应用使用者。

## Goals / Non-Goals

**Goals:**

- 提供名称为 `@tofrankie/bytemd-plugin-highlight` 的独立、可发布 ByteMD 插件。
- 对 Viewer 中的代码块按需加载 `highlight.js` 并调用其元素高亮 API。
- 允许使用者通过异步或同步 `init` 回调注册语言、配置实例或执行其他初始化。
- 对齐 Mermaid 子包的构建产物、peer dependency、元数据和 README 结构。

**Non-Goals:**

- 不内置或自动注入任何 `highlight.js` 主题 CSS。
- 不改变 ByteMD 编辑器或 Viewer 的 Markdown 渲染逻辑。
- 不提供语言自动下载、服务端渲染或主题选择 API。
- 不修改现有 `highlight-example` 包。

## Decisions

### 使用工厂函数与 Viewer effect 集成

插件导出默认工厂函数 `highlight(options?)`，返回 `BytemdPlugin`，并在 `viewerEffect` 中选择 `pre > code` 元素。每个工厂实例私有保存已加载的 `highlight.js` 模块，使同一插件实例只加载和初始化一次。

备选方案是在模块顶层静态导入 `highlight.js`。该方案会让未包含代码块的 Viewer 也支付库的加载成本，因此不采用。

### 仅在存在代码块时动态导入并等待初始化

effect 首先查询代码块；没有匹配元素时直接返回。首次命中代码块时动态导入 `highlight.js`，再等待可选的 `init(hljs)` 回调完成，最后遍历元素并调用 `hljs.highlightElement`。这样可确保自定义语言注册在任何高亮之前完成。

备选方案是并行执行初始化和高亮。该方案会使首次渲染的代码块可能错过使用者注册的语言，因此不采用。

### 将主题样式保留为应用职责

README 将展示从 `highlight.js/styles/*` 导入样式的用法，但插件代码不导入 CSS。主题属于应用的视觉设计决策，且由插件注入会限制主题替换并影响非打包环境。

### 复用 Mermaid 子包的发布边界

新包采用 `tsdown`，输出 ESM、CJS、UMD 和类型声明，保留 `bytemd` 为 peer dependency 和 external 依赖；`highlight.js` 为运行时 dependency。包入口、`files`、脚本、关键词、仓库元数据及 README 与 Mermaid 子包保持一致。

### 在 Playground 提供独立的高亮示例页

Playground 沿用现有的 `ROUTES` 描述和页面映射，新增 `/highlight` 路由。页面使用可编辑的 JavaScript、TypeScript、CSS 和无语言标记代码块，接入高亮插件并显式导入 `highlight.js` 的 GitHub 主题 CSS。这样可以在一个页面中观察语言类名识别、默认回退及编辑后的重新渲染。

## Risks / Trade-offs

- [动态导入在 effect 生命周期结束后才完成] → 高亮操作以已获取的 `markdownBody` 为目标；实现保持无状态 DOM 变更，不持久化节点引用。
- [重复触发 Viewer effect] → 由 `highlight.js` 对已处理元素的行为保证幂等；每个插件实例仅初始化一次。
- [未来 `highlight.js` 更新可能引入行为或体积变化] → 使用明确的稳定版本范围并在升级时执行类型检查、构建与人工高亮验证。
- [未导入主题样式时显示不符合预期] → README 明确要求应用按需导入一个 `highlight.js` 样式文件。
- [Playground 直接导入主题样式会增加示例构建体积] → 主题导入仅存在于 Playground，不进入插件运行时代码或发布产物。

## Migration Plan

1. 在 `packages/highlight` 新增包清单、TypeScript 配置、`tsdown` 配置、源代码和 README。
2. 将高亮插件和 `highlight.js` 接入 Playground 的依赖、路由和示例页面。
3. 安装并锁定 `highlight.js@11.11.1`，生成工作区锁文件变更。
4. 执行子包类型检查、构建、`publint` 以及根工作区检查。
5. 若需回退，移除新工作区包、Playground 路由、主题导入和锁文件中新增依赖；不影响现有发布包或运行时入口。
