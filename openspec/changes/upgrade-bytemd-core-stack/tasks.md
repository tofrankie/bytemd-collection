## 1. 核心包元数据与构建骨架

- [x] 1.1 盘点 `packages/bytemd` 当前公开入口、发布字段、README 与测试覆盖，明确迁移后需要保留的行为语义和对外入口
- [x] 1.2 将 `packages/bytemd/package.json` 调整为 `@tofrankie/bytemd`，同步更新 `description`、`homepage`、`repository`、`bugs`、`files`、README、`LICENSE`、`CHANGELOG.md` 等发布元数据
- [x] 1.3 为核心包引入 `tsdown` 构建配置，生成 ESM、CJS 与类型产物，并移除 UMD、`unpkg`、`jsdelivr` 等旧分发字段
- [x] 1.4 确认核心包最终 `exports`、类型入口与样式入口设计，明确是否保留受控的 Svelte 组件公开入口

## 2. CodeMirror 6 编辑器迁移

- [x] 2.1 用官方 CodeMirror 6 相关包替换 `codemirror-ssr` 与 CodeMirror 5 运行时依赖，建立新的编辑器状态、视图和扩展组合
- [x] 2.2 迁移内建编辑行为与工具函数，使加粗、斜体、链接、标题、引用、代码块、列表、图片上传等操作在 CodeMirror 6 下继续按原语义工作
- [x] 2.3 重建快捷键、占位符、列表续行、选择与插入块等编辑器能力，并移除对旧 addon/mode 注入机制的依赖
- [x] 2.4 重新定义 `BytemdEditorContext` 与相关类型，保留高层编辑语义，明确因 CodeMirror 6 迁移而产生的必要 breaking 边界

## 3. Svelte 兼容升级

- [x] 3.1 将 `packages/bytemd` 升级到与 Svelte 5 兼容的运行时与编译配置，保持现有组件源码采用 legacy 兼容写法
- [x] 3.2 处理组件公开 API、事件分发、测试环境和可能的组件实例化兼容问题，避免为升级而改写原业务逻辑
- [x] 3.3 复查 `Editor`、`Viewer`、`Toolbar`、`Toc`、`Status` 等组件的值传入、变更事件和交互语义，确保与迁移前一致

## 4. 预览链路、样式与深色模式

- [x] 4.1 升级 `rehype-*`、`remark-rehype`、`tippy.js`、`@primer/css` 等相关依赖到与新栈兼容的版本
- [x] 4.2 在不改变预览职责划分的前提下，验证 `remark`、`rehype`、`editorEffect`、`viewerEffect` 等插件挂接语义继续可用
- [x] 4.3 为核心包补齐内置深色模式样式与主题配置，覆盖编辑区、预览区、工具栏、浮层和状态区域，并让 `tippy.js` tooltip / dropdown 在深色场景下切换到匹配主题
- [x] 4.4 复查滚动同步、工具栏弹层和 Markdown 预览细节，确保升级后没有引入明显的交互回退

## 5. 验证与收尾

- [x] 5.1 运行核心包相关的类型检查、单元测试和构建验证，确认 `exports`、类型产物与样式入口可正常消费
- [x] 5.2 以最小消费方式验证 `@tofrankie/bytemd` 的编辑器和预览器组件，确认默认与深色模式下的基本可用性
- [x] 5.3 更新迁移说明或 README 中的 breaking change 提示，明确 UMD 下线、Svelte 兼容约束和编辑器上下文边界
- [x] 5.4 回顾 OpenSpec proposal/design/specs/tasks 与实现范围是否一致，确认无额外跑偏后再进入归档或实现阶段
