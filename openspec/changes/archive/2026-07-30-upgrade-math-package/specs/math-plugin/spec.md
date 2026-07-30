## Purpose

定义 `bytemd-plugin-math` 作为当前仓库维护的数学公式插件包在发布元数据、兼容依赖、KaTeX 样式资源和 README 用法上的对外行为契约，确保使用者可以稳定安装、导入并渲染数学公式。

## ADDED Requirements

### Requirement: 可维护的数学插件包

系统 SHALL 提供名为 `bytemd-plugin-math` 的工作区包，用于发布 bytemd 的数学公式插件。由于该包是基于旧包重做的当前维护版本，该包 MUST 遵循 `workspace-package-path-metadata` 中关于 `author`、`license`、`homepage`、`repository`、`bugs`、`funding`、`LICENSE` 与 `CHANGELOG.md` 的模板约定，其中 `author` 与 `LICENSE` 署名都 MUST 指向当前维护者，并继续将 `bytemd` 声明为 peer dependency。

#### Scenario: 查看数学插件包元数据

- **WHEN** 维护者检查 `packages/plugin-math/package.json`
- **THEN** 该文件 MUST 声明 `name: 'bytemd-plugin-math'`、`version: '0.0.1'`，并提供指向当前维护者与当前项目的 `author`、`homepage`、`repository`、`bugs`、`funding`、`license` 与发布文件清单

#### Scenario: 发布数学插件包

- **WHEN** 维护者发布 `bytemd-plugin-math`
- **THEN** npm 包 MUST 包含 README 中承诺的 JS 入口、样式入口、必要静态资源、`LICENSE` 与 `CHANGELOG.md`

### Requirement: 数学插件保持当前公式渲染能力

`bytemd-plugin-math` SHALL 继续提供默认数学插件工厂函数，并与当前 bytemd 插件体系兼容。系统 MUST 支持使用 `remark-math` 解析公式语法，并在 Viewer 渲染阶段使用 KaTeX 渲染 `.math.math-inline` 与 `.math.math-display` 元素。系统 MUST 继续允许调用方传入 `locale` 与 `katexOptions`。

#### Scenario: 应用导入数学插件

- **WHEN** 使用者从 `bytemd-plugin-math` 默认入口导入插件并调用 `math()`
- **THEN** 系统 MUST 返回可被 bytemd 接收的插件对象，并保持现有的数学公式渲染能力

#### Scenario: 应用传入 KaTeX 配置

- **WHEN** 使用者调用 `math({ katexOptions, locale })`
- **THEN** 系统 MUST 在不改变默认插件入口的前提下继续应用这些配置来渲染数学公式与工具栏文案

### Requirement: 插件包内提供 CSS 样式入口

`bytemd-plugin-math` SHALL 直接发布可供应用导入的 CSS 样式入口。系统 MUST 提供 `bytemd-plugin-math/styles/katex.css` 作为公开导入路径，并将构建产物写入包内 `dist/styles/` 目录，同时随包发布该样式依赖的字体资源，使应用无需再从 `katex/dist/katex.css` 或任何 SCSS 入口导入样式。

#### Scenario: 应用导入包内样式

- **WHEN** 使用者执行 `import 'bytemd-plugin-math/styles/katex.css'`
- **THEN** 系统 MUST 解析到该包在 `dist/styles/` 中发布的 KaTeX 样式文件，而不是要求使用者改为导入 `katex/dist/katex.css`

#### Scenario: KaTeX 样式引用字体资源

- **WHEN** 应用使用 `bytemd-plugin-math/styles/katex.css` 并渲染数学公式
- **THEN** 该样式所需的字体资源 MUST 能从同一个 npm 包中解析，不得要求使用者额外复制 `katex/dist/fonts/*`

#### Scenario: Vite 等构建工具消费样式

- **WHEN** 使用者在 Vite 等构建工具中导入 `bytemd-plugin-math/styles/katex.css`
- **THEN** 系统 MUST 通过 CSS 产物完成样式消费，而不是要求导入 SCSS 源文件导致构建报错

### Requirement: README 说明当前包名与样式用法

`bytemd-plugin-math` 的 README SHALL 以当前维护包名为主体，展示安装、插件导入和样式导入方式。README MUST 使用 `bytemd-plugin-math` 作为包名示例，并明确指向包内 `styles/katex.css` 入口，而不是继续以上游 `@bytemd/plugin-math`、`katex/dist/katex.css` 或任何 SCSS 路径作为主说明。

#### Scenario: 查看 README 使用方式

- **WHEN** 使用者打开 `packages/plugin-math/README.md`
- **THEN** README MUST 展示 `bytemd-plugin-math` 的安装命令、默认导入方式和 `import 'bytemd-plugin-math/styles/katex.css'` 的样式导入示例

#### Scenario: 查看 README 的维护来源

- **WHEN** 使用者阅读 `packages/plugin-math/README.md`
- **THEN** 文档 MUST 指向当前维护仓库的许可证或源码位置，而不是仅保留上游作用域包的说明
