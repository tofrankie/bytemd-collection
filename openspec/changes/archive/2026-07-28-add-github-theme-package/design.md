## Context

当前仓库已有多个 bytemd 插件子包和按路由组织的 playground 示例页，但还没有“主题包”这一类资产包。现有 GFM 页面直接导入 `github-markdown-css/github-markdown-light.css`，导致 playground 只能验证上游样式，无法验证本仓库想对外承诺的包名、导出路径与 bytemd 适配层。

用户已经明确了几个关键边界：新包不要暴露 `primer/*`，消费方式要收敛为 `import 'bytemd-theme-github'` 与 `import 'bytemd-theme-github/<theme>.css'` 这种短路径，默认主题为 `light`，并且不需要沿用其他插件包那套 `unpkg`、`jsdelivr`、UMD 产物矩阵。同时，playground 需要新增一个更接近真实使用场景的完整编辑器示例页，参考 `github-blogger/src/components/editor/index.tsx` 的插件组合，优先使用本仓库 workspace 包来验证多插件联动和主题兼容性。

## Goals / Non-Goals

**Goals:**

- 提供名为 `bytemd-theme-github` 的可发布主题包，基于 `@tofrankie/github-markdown-css` 的顶层非 `primer/*` 主题产物构建。
- 让包支持默认浅色主题入口，以及 `bytemd-theme-github/<theme>.css` 形式的短路径主题导入。
- 在主题样式中叠加 bytemd 场景所需的兼容补丁，包括脚注、`.bytemd-mermaid`、`pre code.hljs`、task list 和 `.math.math-display`。
- 在 `bytemd-theme-github` 的 README 中建立清晰的组合使用说明。
- 让 playground 既保留单能力示例，也新增一个完整的 bytemd 组合示例页，用于验证多插件共存时的编辑、预览和主题效果。
- 让现有 GFM 示例改为消费新主题包，以仓库内部真实发布入口验证最终样式。

**Non-Goals:**

- 不暴露 `primer/*` 入口，也不对外承诺 Primer 原始分层主题资产。
- 不新增运行时主题切换 API、JS 注入逻辑或插件工厂函数。
- 不复刻 `github-blogger` 编辑器的业务逻辑，如标题输入、标签请求、图片上传或远程数据交互。
- 不在本次变更中引入 jsDelivr、unpkg 或 UMD 产物支持。

## Decisions

### 以静态主题资产包而不是运行时插件实现

`bytemd-theme-github` 将被设计为一个样式资产包，而不是新的 Bytemd 插件。它的主要职责是发布 CSS 主题入口与配套 README，用条件导出把包根入口映射到默认浅色主题，并为其他主题暴露短 CSS 子路径。

备选方案是做成一个 JS 插件，在运行时注入 CSS 或返回主题配置。该方案会增加 API 面、状态管理和构建复杂度，而且不符合用户想要的纯 CSS 导入形式，因此不采用。

### 只基于上游顶层主题产物构建，明确排除 `primer/*`

主题来源限定为 `@tofrankie/github-markdown-css` 已生成的顶层主题 CSS，保留其现有主题族，但不再向下暴露 `primer/*` 这一层。新包只承诺“bytemd 可直接消费的 GitHub 风格成品主题”，而不承诺可继续组装的 Primer 原材料。

备选方案是同时转发 `primer/*`，甚至把 Primer 视作高级扩展层。该方案会扩大包职责、文档面和维护面，也与用户刚确认的边界相冲突，因此不采用。

### 用短路径条件导出隐藏内部目录结构

包的外部消费路径固定为：

- `import 'bytemd-theme-github'`
- `import 'bytemd-theme-github/light.css'`
- `import 'bytemd-theme-github/dark.css'`
- 以及其他保留主题的 `<theme>.css`

内部可以保留 `styles/`、`scss/` 或构建中间目录来组织文件，但这些层级不会暴露给消费者。默认入口通过 `exports['.']` 指向 `light.css`，从而满足“默认 light”这一约定。

备选方案是复用 `@tofrankie/bytemd-plugin-highlight/styles/*` 那种公开 `styles/` 子路径。该方案会让导入路径更长，也不符合用户要求，因此不采用。

### 将 bytemd 适配层合并到最终主题产物

每个导出的主题文件都应建立在“上游主题 CSS + bytemd 补丁”之上，而不是要求使用者再额外导入第二份补丁文件。这样可以保证 `import 'bytemd-theme-github'` 或 `import 'bytemd-theme-github/<theme>.css'` 即拿到完整可用的样式。

已确认需要纳入的适配点包括：

- 脚注引用与脚注区域样式
- `.bytemd-mermaid` 的下边距
- `pre code.hljs` 去除内层 padding
- task list checkbox 兼容
- `.math.math-display` 的块级间距

备选方案是把这些补丁拆成额外 `patch.css`。该方案会增加使用成本，也容易被漏导入，因此不采用。

### README 在主题包内集中说明组合用法

`bytemd-theme-github` 的 README 不只展示单独导入主题，还要明确它通常和 `bytemd-plugin-gfm`、`@tofrankie/bytemd-plugin-highlight` 一起使用，并给出最小组合示例。这样主题、Markdown 扩展和代码高亮的关系都集中在主题包入口解释，避免把同一套说明散落到多个现有子包 README 中。

备选方案是同时修改 `bytemd-plugin-gfm` 和 `@tofrankie/bytemd-plugin-highlight` 的 README。该方案会扩大本次变更范围，也不符合用户刚确认的边界，因此不采用。

### 完整 playground 示例页只复用插件栈，不复制业务壳层

新的完整示例页会参考 `github-blogger` 编辑器的插件集合，但仅复用“编辑器 + 插件栈 + 测试 Markdown + 主题样式”这部分，不复制其标题栏、标签、上传、网络请求或状态仓库。插件来源优先级为：

- 优先使用本仓库 workspace 包：`bytemd-plugin-github-alerts`、`bytemd-plugin-gfm`、`@tofrankie/bytemd-plugin-highlight`、`bytemd-plugin-mermaid`、`bytemd-theme-github`
- 补齐官方插件：`@bytemd/plugin-frontmatter`、`@bytemd/plugin-breaks`、`@bytemd/plugin-gemoji`、`@bytemd/plugin-math`、`@bytemd/plugin-medium-zoom`

这样既能验证仓库内维护包之间的联动，又不会把 playground 拖成一个带业务依赖的应用壳。

备选方案是逐个增强现有单插件页，不新增完整组合页。该方案难以覆盖多插件共存与主题联动问题，因此不采用。

### 主题包发布模型保持最小化

这个包不需要像现有插件包那样提供 `main/module/unpkg/jsdelivr/umd` 的完整矩阵。更合适的模型是：

- 以 CSS 入口为主要对外接口
- 仅在 `exports` 层面声明默认入口与各主题子路径
- 如需兼容 npm 包工具链，可保留最小 ESM/CJS 模块边界，但不把它作为核心消费方式

备选方案是沿用现有插件模板生成完整 JS 分发字段。该方案会引入不必要的噪音，也弱化“这是主题资产包”的定位，因此不采用。

## Risks / Trade-offs

- [上游主题文件较多，手动维护导出清单容易漏项] → 以“上游当前顶层非 `primer/*` 主题全集”为基准生成或复制导出清单，并在 README 与 playground 中只重点展示常用主题。
- [脚注与数学公式的实际 DOM 结构可能和预期略有差异] → 以当前 bytemd 渲染结果为准设计补丁选择器，并用组合 playground 页面进行实际观察验证。
- [完整 playground 页面一次接入多插件后，问题归因会变复杂] → 保留现有单插件示例页用于单点排查，再用组合页承担真实集成验证。
- [默认入口直接映射到 CSS 可能对部分工具链的包解析更敏感] → 在 design 与 README 中明确这是样式包，并保持同时支持显式 `light.css` 子路径导入作为稳定兜底方案。
- [主题与插件的关系只写在一个 README 中，部分用户可能需要多点跳转] → 在主题包 README 中提供完整最小示例，并让 playground 组合页承担可运行参考。

## Migration Plan

1. 新建 `packages/theme-github`，确定主题复制/构建方式、导出清单、README 与发布元数据。
2. 将 bytemd 适配补丁合并进最终主题产物，并保证默认入口与各 `<theme>.css` 子路径可用。
3. 更新 playground：让现有 GFM 页面消费新主题包，并新增完整 bytemd 组合示例页。
4. 补齐新页面所需的示例 Markdown 与官方插件依赖，并同步更新主题包 README 中的组合使用说明。
5. 如需回退，可独立移除 `packages/theme-github` 和新增 playground 页面；由于不改动现有插件 API，回退不会影响现有子包对外接口。

## Open Questions

- 首个版本的 README 是否只主推 `light`、`dark`、`auto` 三个常用入口，还是完整列出所有保留的顶层主题文件。
