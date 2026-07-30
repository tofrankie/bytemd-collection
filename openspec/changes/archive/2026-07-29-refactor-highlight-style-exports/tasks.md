## 1. 样式构建流水线

- [x] 1.1 审查 `packages/plugin-highlight-github` 现有样式源码、构建脚本与导出目录，定位所有 `highlight.js` 主题透传逻辑
- [x] 1.2 为 `packages/plugin-highlight-github` 接入基于 `sass` 的规则编译流程，产出仅包含规则与变量引用的 `styles/pure.css`
- [x] 1.3 实现 Primer 主题遍历与变量提取脚本，为 `@primer/primitives/dist/css/functional/themes` 下每个可用主题生成对应的 `styles/<theme>.css`
- [x] 1.4 在生成主题 CSS 时把 `--prettylights-` 变量、`base.scss` 使用到的主题变量及其依赖收敛到 `.hljs {}` 作用域，并写入 `@primer/primitives` 版本来源注释
- [x] 1.5 同步生成仓库内的 `artifacts/styles` 基准产物，并将正式发布样式写入 `dist/styles/`，确保两者使用同一来源

## 2. 包导出与文档

- [x] 2.1 更新 `packages/plugin-highlight-github/package.json` 的构建脚本、发布文件清单与 `exports`，暴露 `styles/<theme>.css` 和 `styles/pure.css`
- [x] 2.2 移除或停止发布旧的 `highlight.js` 样式透传产物与 `scss/<theme>` 导出，确保样式契约只指向插件包内 CSS 入口
- [x] 2.3 更新 `packages/plugin-highlight-github/README.md`，说明新的主题导入方式、`pure.css` 用法、仓库内基准产物角色与主题变量来源

## 3. 验证

- [x] 3.1 运行 `packages/plugin-highlight-github` 的构建，确认所有主题 CSS 与 `pure.css` 均成功生成并进入发布目录
- [x] 3.2 抽样检查生成产物，确认 `.hljs` 作用域、变量依赖补齐、版本注释、`pure.css` 无变量定义，且 `artifacts/styles` 与发布 CSS 保持一致
- [x] 3.3 运行与该包相关的类型检查、构建或 OpenSpec 校验，确认 README 与导出路径和最终产物一致
