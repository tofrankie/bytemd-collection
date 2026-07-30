## Context

当前 `packages/plugin-math` 已经包含可工作的数学插件源码与 locales，但整体形态仍接近上游包：`package.json` 仍使用 `@bytemd/plugin-math` 名称和旧仓库元数据，README 也仍要求消费者手动导入 `katex/dist/katex.css`。相比之下，仓库内已维护的 `plugin-gfm`、`plugin-mermaid`、`plugin-highlight` 与 `theme-github` 都已经完成了统一的发布字段、README 风格、`CHANGELOG.md`/`LICENSE` 配套和工作区构建约定。

这次变更既涉及运行时依赖升级，也涉及新的静态资源发布契约。See [proposal.md](/Users/frankie/Web/Git/bytemd-plugin/openspec/changes/upgrade-math-package/proposal.md) - Why。行为要求以 `specs/math-plugin/spec.md` 为准。

## Goals / Non-Goals

**Goals:**

- 将 `packages/plugin-math` 升级为符合当前仓库规范的 `bytemd-plugin-math` 发布包
- 让消费者能够通过包内稳定入口同时接入插件逻辑与 KaTeX 样式资源
- 保持现有公式渲染方式、插件 API 和 locales 使用方式不发生额外行为漂移
- 把该包纳入当前工作区统一的构建、类型检查和发布清单约定
- 为该包补充一个遵循现有 playground 模式的最小示例入口，便于在仓库内直接验证 math 插件和样式导入

**Non-Goals:**

- 不重写数学渲染方案，不改用除 KaTeX 之外的渲染引擎
- 不新增与本次目标无关的 playground 页面或额外功能开关
- 不改变现有 `locale`、`katexOptions` 这类公开 JS API 的形状

## Decisions

### 1. 保留现有源码入口和懒加载渲染路径，只做维护性升级

`src/index.ts` 已经具备 `remark-math` 解析与 Viewer 侧 KaTeX 懒加载渲染能力，本次不重构这条运行时路径。这样可以把变更集中在包契约、依赖版本、构建输出和文档层面，降低行为回归风险。

备选方案：

- 直接重写插件内部实现或同步上游最新源码
  - 放弃原因：这会把“维护升级”和“行为重构”绑在一起，扩大验证面，且不符合当前需求重点

### 2. 通过包内显式 CSS 子路径导出发布 KaTeX 样式和字体

样式入口采用显式子路径 `bytemd-plugin-math/styles/katex.css`，并参考 `@tofrankie/bytemd-plugin-highlight` 的 style 导出方式，把最终 CSS 产物写入 `dist/styles/`。构建时从 `katex` 发布包复制或整理所需 CSS 与 `fonts/` 静态资源，写入插件包发布目录，并在 `exports`/`files`/`sideEffects` 中声明。这样消费者只需要记住 math 插件包自身的 CSS 入口，不再依赖 `katex/dist/*` 的外部路径，也不会因为导入 SCSS 源文件而在 Vite 等构建工具中报错。

备选方案：

- 继续要求消费者手动导入 `katex/dist/katex.css`
  - 放弃原因：这让样式契约游离在插件包之外，不符合“内置 katex 的样式导出”目标
- 在 JS 入口中自动注入 CSS
  - 放弃原因：这会引入打包器差异、SSR 副作用和隐藏依赖，不如显式 CSS 导入稳定

### 3. 元数据对齐已有维护子包模板，并切换到你当前维护的信息

`package.json` 将对齐现有维护子包模板：使用你当前维护版本对应的 `author`、`homepage`、`repository`、`bugs`、`funding`、`packageManager`、脚本和发布清单约定，而不是保留上游 `@bytemd/plugin-math` 的包信息。仓库链接统一指向 `bytemd-collection`，同时继续保留 `repository.directory: 'packages/plugin-math'`，避免因为本次只改 npm 包名而连带触发目录重命名。版本号从当前仓库维护的初始发布 `0.0.1` 开始，不继承上游 `@bytemd/plugin-math` 的历史版本。

备选方案：

- 同步把目录从 `plugin-math` 改为 `math`
  - 放弃原因：这会扩大引用更新范围，并与本次主要目标无直接关系

### 4. 把包纳入根级 TypeScript 工程引用和统一校验

虽然 `packages/plugin-math` 已有 `tsconfig.json`，但当前根 `tsconfig.json` 尚未引用它。本次会补上引用，并按现有维护子包方式补齐 `build`、`typecheck`、`publint` 等脚本或清单，使该包能被根级类型工程和批量命令一致覆盖。

备选方案：

- 保持该包只在子目录局部维护
  - 放弃原因：这会让工作区状态继续不一致，后续容易漏检

### 5. 复用现有 playground 路由模式增加最小 math 示例

playground 示例不单独发明新的演示结构，而是沿用仓库现有页面组织和包导入方式，直接展示 math 插件与 `bytemd-plugin-math/styles/katex.css` 的实际接入。这能让维护者在仓库里快速验证导入路径、样式资源和公式渲染结果是否一致。

备选方案：

- 只依赖 README 示例，不新增 playground 页面
  - 放弃原因：不符合当前仓库“新增维护子包应提供 playground 示例”的规范，也不利于后续回归验证

## Risks / Trade-offs

- [Risk] KaTeX CSS 依赖字体文件，若只导出 CSS 不发布字体，消费者运行时会出现资源 404
  → Mitigation：在设计上把字体资源纳入公开发布契约，并在任务中单独验证样式与字体路径

- [Risk] 包名从 `@bytemd/plugin-math` 改为 `bytemd-plugin-math` 会影响现有使用者的安装与导入路径
  → Mitigation：在 proposal/spec/README/CHANGELOG 中明确标注迁移点，并保持 JS 默认导出 API 不变，缩小迁移面

- [Risk] 依赖升级可能引入 KaTeX、remark-math 或打包输出上的兼容性变化
  → Mitigation：限定目标为与当前 `bytemd` 版本兼容的升级，并通过类型检查、构建和包导出检查验证

## Migration Plan

1. 更新 `packages/plugin-math` 的包元数据、脚本、README、`CHANGELOG.md` 与发布文件清单
2. 为 KaTeX 样式与字体补充构建/复制流程，并声明 `styles/katex.css` 到 `dist/styles/` 的子路径导出
3. 根据兼容性升级依赖，补充根 `tsconfig.json` 工程引用与必要校验
4. 运行该包及根级相关验证，确认 JS 入口、样式入口和发布资源一致
5. 补充 playground 示例并验证路由、包导入和公式展示是否正常

回滚策略：

- 若样式资源发布方案出现兼容性问题，可先回退到仅保留已有 JS 插件入口，不合入新的 `styles/katex.css` 契约变更
- 若依赖升级造成运行时回归，可回退到当前锁定版本，同时保留元数据和文档对齐部分
