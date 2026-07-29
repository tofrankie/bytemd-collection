## Why

当前 `packages/bytemd` 仍停留在上游 `bytemd@1.22.0` 的旧技术栈上，依赖 `codemirror-ssr`、CodeMirror 5、旧版 Svelte 组件产物和 UMD 分发模型，已经不符合本仓库后续维护与发布方向。现在需要在尽量不改变原有编辑/预览业务语义的前提下，把核心包升级为以 `@tofrankie/bytemd` 名义发布、基于现代编辑器与构建链的可维护版本。

## What Changes

- 将 `packages/bytemd` 的对外包身份升级为 `@tofrankie/bytemd`，同步更新包元数据、README 与发布清单。
- **BREAKING** 将编辑器底座从 `codemirror-ssr` + CodeMirror 5 迁移到官方 CodeMirror 6 生态，不再继续依赖 `codemirror-ssr` 包装层。
- **BREAKING** 取消 UMD、`unpkg`、`jsdelivr` 等旧分发入口，收敛为以 `tsdown` 产出的 ESM 与 CJS 为主的发布模型。
- 升级 Svelte 到兼容迁移模式，保留现有组件业务逻辑和旧式组件写法，不在本次变更中引入 runes 化重构。
- 为核心编辑器补齐内置深色模式能力，包括 `tippy.js` 浮层主题在深色场景下的同步适配，并更新 `rehype`、`tippy.js`、`@primer/css` 等相关依赖到与新栈兼容的版本。
- 在迁移过程中尽量保持现有 Markdown 编辑、预览、工具栏、滚动同步和插件生命周期语义不变，仅在 CodeMirror 6 所要求的接口边界上引入必要的兼容调整。

## Capabilities

### New Capabilities

- `bytemd-core-package`: 定义 `@tofrankie/bytemd` 的发布身份、编辑器栈、Svelte 兼容升级边界、分发模型和内置主题能力。

### Modified Capabilities

<!-- 无 -->

## Impact

- 受影响代码：`packages/bytemd` 下的组件、编辑器适配层、样式与测试文件，以及根工作区的构建/类型检查关联配置。
- 受影响对外接口：`packages/bytemd/package.json` 包名与导出字段、编辑器上下文与配置类型、发布产物目录，以及消费者对旧 UMD 入口的依赖方式。
- 受影响依赖：官方 CodeMirror 6 相关包、Svelte、`rehype-*`、`remark-rehype`、`tippy.js`、`@primer/css` 等编辑器和样式链路依赖。
- 受影响验证方式：需要重新验证构建、类型、测试和最小消费入口，确保兼容升级没有改变既有编辑/预览业务行为。
