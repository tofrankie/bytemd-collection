## ADDED Requirements

### Requirement: 核心包以 `@tofrankie/bytemd` 发布

`packages/bytemd` SHALL 以 `@tofrankie/bytemd` 作为对外 npm 包名发布，并 MUST 同步提供与该包身份一致的 `description`、README、仓库元数据和发布文件清单。

#### Scenario: 检查核心包元数据

- **WHEN** 维护者查看 `packages/bytemd/package.json`
- **THEN** 包名 MUST 为 `@tofrankie/bytemd`
- **THEN** `description`、`homepage`、`repository`、`bugs`、`license`、`files` 等发布元数据 MUST 与仓库约定和核心包定位一致

#### Scenario: 检查核心包文档

- **WHEN** 使用者查看 `packages/bytemd/README.md`
- **THEN** 文档 MUST 以 `@tofrankie/bytemd` 作为对外包名介绍该核心包
- **THEN** 文档 MUST 描述新的安装与消费方式，而不是继续强调旧的 UMD/CDN 分发方式

### Requirement: 核心编辑器基于官方 CodeMirror 6

核心编辑器 SHALL 使用官方 CodeMirror 6 生态实现编辑能力，并 MUST 不再依赖 `codemirror-ssr` 或 CodeMirror 5 运行时对象来驱动编辑器实例。

#### Scenario: 检查编辑器运行时依赖

- **WHEN** 维护者检查 `packages/bytemd` 的运行时依赖与编辑器实现
- **THEN** 实现 MUST 基于官方 CodeMirror 6 相关包创建编辑器状态与视图
- **THEN** 运行时依赖中 MUST 不再要求 `codemirror-ssr`

#### Scenario: 使用内建编辑动作

- **WHEN** 使用者在编辑器中触发内建工具栏动作或快捷键
- **THEN** 编辑器 MUST 继续支持加粗、斜体、链接、标题、引用、代码块、列表和图片等既有 Markdown 编辑语义
- **THEN** 这些编辑行为 MUST 通过新的 CodeMirror 6 编辑模型完成，而不是依赖旧的 CM5 addon 机制

### Requirement: Svelte 升级保持组件业务语义稳定

核心包 SHALL 升级到与现代 Svelte 运行时兼容的版本，并 MUST 在不重写原有业务逻辑的前提下保留现有组件的编辑、预览、工具栏、目录、状态栏和事件语义。

#### Scenario: 检查组件源码迁移边界

- **WHEN** 维护者检查 `packages/bytemd/src/*.svelte`
- **THEN** 组件升级 MUST 以兼容迁移为目标，而不是要求全面改写为新的组件范式
- **THEN** 现有编辑器与预览业务逻辑 MUST 继续由现有组件结构承载

#### Scenario: 检查组件消费兼容性

- **WHEN** 使用者通过包的公开组件入口消费编辑器或预览器组件
- **THEN** 组件的基本创建、值传入和变更事件语义 MUST 与迁移前保持一致
- **THEN** 若存在组件 API 兼容开关或约束，文档 MUST 明确说明

### Requirement: 发布模型收敛到 ESM 和 CJS

核心包 SHALL 使用现代构建链产出以 ESM 和 CJS 为主的发布结果，并 MUST 移除对 UMD、`unpkg`、`jsdelivr` 等历史分发入口的依赖承诺。

#### Scenario: 检查发布入口

- **WHEN** 维护者查看 `packages/bytemd/package.json` 的导出字段与发布清单
- **THEN** 包 MUST 提供明确的 ESM、CJS 和类型入口
- **THEN** 包 MUST 不再要求 UMD 产物作为标准发布物

#### Scenario: 检查构建方式

- **WHEN** 维护者执行核心包构建
- **THEN** 构建流程 MUST 使用 `tsdown` 或与其等价的现代工作区构建链生成发布产物
- **THEN** 生成结果 MUST 与 `exports` 中声明的入口保持一致

### Requirement: 核心包内置深色模式支持

核心包 SHALL 内置深色模式支持，使编辑区、预览区、工具栏、浮层和状态区域在深色场景下具有一致且可用的表现，而不是要求使用者自行补齐一套内部主题样式。

#### Scenario: 检查默认与深色显示

- **WHEN** 使用者分别以默认主题和深色主题查看编辑器
- **THEN** 编辑区、预览区、工具栏和状态区域 MUST 在两种模式下都可正确显示主要内容与交互状态

#### Scenario: 检查内置主题边界

- **WHEN** 维护者检查核心样式和主题配置
- **THEN** 深色模式能力 MUST 由核心包自带的样式或主题配置提供
- **THEN** 使用者 MUST 不需要额外导入第二套内部补丁样式才能获得基本深色体验

#### Scenario: 检查 `tippy.js` 浮层主题切换

- **WHEN** 使用者在深色模式下打开工具栏 tooltip、dropdown 或其子菜单浮层
- **THEN** `tippy.js` 浮层 MUST 使用与深色界面匹配的主题样式
- **THEN** 浮层文字、背景、边框和悬停态 MUST 保持可读且与浅色模式区分明确

### Requirement: Markdown 预览与插件生命周期语义保持兼容

核心包在升级相关 Markdown、浮层和样式依赖后 SHALL 保持现有 Markdown 预览链路和插件生命周期语义兼容，确保编辑、预览和 effect 型插件的基本工作方式不因迁移而改变。

#### Scenario: 渲染现有 Markdown 预览

- **WHEN** 使用者输入包含 HTML、代码块、列表、脚注或插件增强内容的 Markdown
- **THEN** 预览器 MUST 继续通过现有处理链语义渲染内容
- **THEN** 迁移后的依赖升级 MUST 不改变既有的基本预览职责划分

#### Scenario: 运行插件 effect

- **WHEN** 编辑器或预览器接收现有 `BytemdPlugin` 插件列表
- **THEN** `editorEffect`、`viewerEffect`、`remark` 和 `rehype` 这类插件挂接语义 MUST 继续可用
- **THEN** 若个别低层上下文字段因 CodeMirror 6 迁移而调整，变更边界 MUST 在类型定义或文档中明确体现
