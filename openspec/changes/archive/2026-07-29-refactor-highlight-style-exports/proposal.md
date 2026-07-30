## Why

当前 `bytemd-plugin-highlight-github` 的样式入口只是重新暴露 `highlight.js` 自带主题，无法承载仓库希望提供的 Primer 风格代码高亮主题，也不能单独导出只包含规则、不定义变量的纯样式入口。随着 `@primer/primitives` 已经在包内可用，现在需要把样式产物收敛到仓库自己的构建流程和导出契约上，避免主题能力继续依赖上游目录结构与手工拼装。

## What Changes

- 重构 `bytemd-plugin-highlight-github` 的样式构建与导出，只调整样式相关入口，不改变现有插件的 JS/TS 入口与运行时高亮行为。
- 停止重新导出 `highlight.js` 原生主题文件，改为由包自身生成并发布映射到 `dist/styles/<theme>.css` 的 `styles/<theme>.css` 主题产物。
- 停止提供 `bytemd-plugin-highlight-github/scss/<theme>` 导出，仅保留 CSS 产物作为公开样式接口。
- 基于 `@primer/primitives/dist/css/functional/themes` 的全部可用主题生成高亮样式，将 `--prettylights-` 相关变量定义、`src/base.scss` 使用到的主题变量及其依赖一起收敛到 `.hljs {}` 作用域，并与 `src/base.scss` 编译结果合并。
- 新增 `styles/pure.css` 入口，仅保留规则与变量引用，不输出任何 CSS 变量定义。
- 在包目录内保留一份可提交的构建基准产物，便于未来升级上游依赖时比较输出变化；正式发布样式产物则仅放在 `dist/styles/`。
- 更新 README，说明新的主题入口、`pure.css` 用法与主题变量来源。

## Capabilities

### New Capabilities

- 无

### Modified Capabilities

- `highlight-plugin`: 高亮插件的主题样式职责从“应用自行导入 `highlight.js` 主题”调整为“插件包发布自有的 Primer 风格主题 CSS 与纯规则 CSS 入口”。

## Impact

- 受影响代码：`packages/plugin-highlight-github` 的样式源码、构建脚本、包导出字段、仓库内构建基准产物与 README。
- 受影响依赖：样式构建将显式依赖 `sass` 与已安装的 `@primer/primitives` 主题源文件。
- 受影响对外接口：新增 `bytemd-plugin-highlight-github/styles/<theme>.css` 与 `bytemd-plugin-highlight-github/styles/pure.css` 导入方式，移除对 `highlight.js` 主题文件透传导出以及 `scss/<theme>` 导出的承诺。
