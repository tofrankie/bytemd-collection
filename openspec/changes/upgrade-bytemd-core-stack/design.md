## Context

当前 `packages/bytemd` 基本保持上游 `bytemd@1.22.0` 结构：Svelte 组件负责编辑器、预览区、工具栏、目录和状态栏，编辑能力由 `codemirror-ssr` 注入 CodeMirror 5 模式与 addon，预览能力由 `remark-parse`、`remark-rehype`、`rehype-raw`、`rehype-sanitize`、`rehype-stringify` 等链路构成，样式中同时耦合了 CodeMirror、Tippy 和 Primer 变量。包的发布模型仍保留 `svelte` 入口、`main/module`、`jsdelivr`、`unpkg` 和 UMD 产物假设，但当前仓库其它子包已经迁移到 `tsdown` 主导的现代发布链路。

这次变更同时有三类约束：

- 用户希望升级到官方 CodeMirror 体系，明确不再使用 `codemirror-ssr`
- 用户希望 Svelte 一并升级，但“不修改原业务逻辑，最多只做兼容升级”
- 仓库后续维护希望统一到现代 ESM/CJS 与工作区构建方式，不再维护历史 UMD 分发形态

因此，这不是一次纯依赖升级，而是一次围绕核心包的受控迁移：内部编辑器实现需要现代化，对外编辑/预览语义尽量保持稳定，组件层只做兼容迁移而不做范式重写。

## Goals / Non-Goals

**Goals:**

- 将 `packages/bytemd` 升级为以 `@tofrankie/bytemd` 名义发布的核心包。
- 用官方 CodeMirror 6 生态替换 `codemirror-ssr` 与 CodeMirror 5。
- 以 `tsdown` 统一构建 ESM/CJS 产物，并移除 UMD、`unpkg`、`jsdelivr` 等旧分发出口。
- 将 Svelte 升级到兼容迁移模式，保留现有组件结构、响应式写法和业务交互语义。
- 为编辑器补齐内置深色模式支持，并同步升级相关 Markdown、浮层和样式依赖。
- 尽量保持 Markdown 编辑、预览、滚动同步、工具栏动作和插件生命周期行为一致。

**Non-Goals:**

- 不把组件重写为 Svelte runes、snippet 或 callback props 风格。
- 不在本次变更中重做 ByteMD 的产品交互、工具栏信息架构或插件机制设计。
- 不承诺完全保留 CodeMirror 5 的所有类型与运行时对象形状；仅保留行为语义与必要兼容层。
- 不继续维护浏览器直连脚本场景所需的 UMD 产物。
- 不扩展 playground、主题包或其他插件包的能力范围，除非验证迁移所需。

## Decisions

### 使用官方 CodeMirror 6 生态替代 `codemirror-ssr`

编辑器实现将从 `codemirror-ssr` 工厂模式迁移到官方 CodeMirror 6 的 `EditorState`、`EditorView`、`Extension` 与命令体系。Markdown、GFM、快捷键、占位符、列表续行、选择与插入逻辑都应通过官方扩展和命令方式重建，而不是继续通过 CM5 addon 注入。

这样做的原因是用户已经明确要求放弃 `codemirror-ssr`，并且 CodeMirror 6 才是后续维护、主题与扩展能力的稳定基础。继续回退到旧 `codemirror` CM5 包虽然能降低表面迁移量，但会与“升级到 v6”的目标直接冲突，因此不采用。

### 对外暴露“语义兼容层”，而不是生搬硬套 CM5 API

现有 `BytemdEditorContext` 直接暴露 `codemirror` 构造器和 CM5 `editor` 实例，`wrapText`、`replaceLines`、`appendBlock` 等工具函数也建立在 `Pos`、`replaceRange`、`setSelection` 这些接口之上。迁移到 CodeMirror 6 后，内部会改用 `EditorView` 和 transaction 模型，但对外优先保留“完成同类编辑动作”的语义能力，例如保留包装文本、替换行、插入块、选择文件等高层工具。

这意味着兼容策略是：

- 保留对插件和工具栏真正有价值的编辑语义
- 仅在必要时调整低层对象类型和上下文字段
- 不为了伪装成 CM5 而引入一整套脆弱的假 API

备选方案是构建完整的 CM5 兼容 facade，让旧插件继续拿到近似的 `editor` / `codemirror.Pos` 体验。该方案短期看似平滑，但会让后续维护长期受限于旧模型，因此不采用。

### Svelte 升级仅采用 legacy 兼容模式

组件源码继续保留 `export let`、`$:`、`createEventDispatcher`、`onMount` / `onDestroy` 等既有写法，通过 Svelte 5 的 legacy 兼容模式编译，而不是把组件整体迁移为 runes 风格。必要时应启用旧组件 API 兼容选项，以降低现有消费端和测试场景的破坏面。

这样做是因为用户已明确说明自己不熟悉 Svelte，希望“不修改原业务逻辑，最多只做兼容升级”。因此本次设计把 Svelte 视为“运行时与编译层升级”，而非“组件范式升级”。

备选方案是借机全面改写为 Svelte 5 runes。该方案会扩大 review 与回归成本，也会让问题边界从“核心编辑器迁移”扩散到“整个组件模型重写”，因此不采用。

### 构建和发布模型收敛到 `tsdown` 驱动的 ESM/CJS

`packages/bytemd` 的构建将参考仓库其他子包，使用 `tsdown` 产出 `dist` 下的类型、ESM 与 CJS 文件；`package.json` 通过 `exports` 明确对外入口。若仍需保留 Svelte 组件源码消费入口，应把它视为受控公开入口，而不是继续同时维护 UMD CDN 产物矩阵。

备选方案是延续旧的 `main/module/svelte/unpkg/jsdelivr` 全矩阵输出。该方案与本仓库现有发布方向不一致，而且会让迁移验证面过大，因此不采用。

### 深色模式以内建主题能力落在核心包样式层

深色模式能力应直接体现在核心样式与编辑器主题配置中，使编辑区、预览区、工具栏、浮层和状态区域在深色场景下具备一致表现，而不是要求外部消费者额外拼装第二套内部样式逻辑。实现上可以通过 CSS 变量、主题 class 或颜色模式属性驱动，但外部语义需要收敛成“核心包自带 dark mode 支持”。其中 `tippy.js` 相关 tooltip、dropdown 和子菜单浮层也必须跟随深色模式切换到匹配的主题，而不是继续沿用浅色默认皮肤。

备选方案是把深色模式交给使用者自行覆盖。该方案会削弱核心包升级目标中的内建主题承诺，因此不采用。

### Markdown 预览链路只做兼容升级，不主动重写插件协议

`rehype-*`、`remark-rehype`、`unified` 等预览链路依赖可以升级到与新运行时兼容的版本，但不主动改变 `BytemdPlugin` 的 `remark`、`rehype`、`editorEffect`、`viewerEffect` 语义。这样可以把本次风险集中在编辑器与构建迁移上，而不是同时引入另一轮插件协议重构。

备选方案是借升级统一重做插件协议或处理器拼装方式。该方案收益不足以覆盖迁移风险，因此不采用。

## Risks / Trade-offs

- [CodeMirror 6 与 CM5 编程模型差异很大，旧上下文字段可能无法一一映射] → 优先保留高层编辑语义，明确哪些低层字段属于 breaking change，并为工具栏与内建动作先落一层内部适配。
- [Svelte 5 兼容编译可能暴露旧组件 API 或测试环境问题] → 保持 legacy 写法不变，必要时启用兼容组件 API，并在测试与最小消费入口中优先验证组件实例化路径。
- [深色模式改造容易波及现有浅色样式与第三方样式变量] → 将主题改造限定在核心样式入口和必要变量映射，先确保默认浅色行为不回退，再叠加深色能力，并单独校验 `tippy.js` 浮层主题在两种模式下的可读性与层级关系。
- [移除 UMD 后，历史 CDN 使用方式会失效] → 在 proposal、README 与发布字段中明确这是 breaking change，并把对外模型收敛为 npm ESM/CJS 消费。
- [依赖整体升级后，预览、浮层和滚动同步细节可能出现行为偏差] → 迁移任务按编辑器、组件、样式、测试拆阶段推进，最后通过编辑、预览、工具栏、滚动同步和插件 effect 场景统一回归。

## Migration Plan

1. 梳理 `packages/bytemd` 当前公开接口、样式入口、测试覆盖和发布字段，锁定需要保留的行为语义。
2. 搭建新的构建与发布骨架：更新包元数据、引入 `tsdown`、清理 UMD/CDN 字段，并确定 Svelte 源码入口是否保留及其导出方式。
3. 用官方 CodeMirror 6 重建编辑器实例、主题与基础编辑工具函数，让工具栏与内建动作先在新上下文上跑通。
4. 在不改业务语义的前提下升级 Svelte 运行时与组件编译配置，修复组件 API、事件和测试兼容问题。
5. 同步升级预览链路、浮层和样式依赖，补齐深色模式样式与必要的主题变量映射。
6. 通过类型检查、单测、构建和最小消费验证确认迁移完成；若出现不可接受的兼容问题，可回退到第 2 步前的旧发布模型并保留前置调研结果。

## Open Questions

- 对外是否仍需要保留 `svelte` 条件导出，还是完全收敛为标准 JS/CSS 入口并把 Svelte 组件源码视为内部实现细节。
- `BytemdEditorContext` 在迁移到 CodeMirror 6 后，哪些低层字段需要继续公开为半稳定接口，哪些应明确降级为内部细节。
