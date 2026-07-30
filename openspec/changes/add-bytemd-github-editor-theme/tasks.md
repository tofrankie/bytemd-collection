## 1. 子包骨架与规则产物

- [x] 1.1 新建 `packages/theme-github-editor`，补齐 `package.json`、README、`LICENSE`、`CHANGELOG.md` 与基础构建脚本
- [x] 1.2 建立 `src/index.scss` 及其规则 import 链路，并生成不含 token 定义的 `pure.css`
- [x] 1.3 配置包导出与发布文件清单，提供 `pure.css`、`light.css`、`dark.css`、`auto.css` 的对外入口

## 2. SCSS 主题 mixin 与 token 提取

- [x] 2.1 设计并实现将规则输出与 token 输出拆分的 SCSS 入口
- [x] 2.2 实现支持多 target、显式 modes 结构的主题 token mixin
- [x] 2.3 实现基于规则引用闭包的 Primer token 收集逻辑，覆盖主题目录与必要的 functional 静态 token 文件

## 3. 主题产物与快照验证

- [x] 3.1 生成 `light.css`、`dark.css` 与 `auto.css` 三类主题产物，并确保它们与 `pure.css` 组合后完整可用
- [x] 3.2 生成并提交 artifacts 快照，用于后续 Primer 升级差异对比
- [x] 3.3 完成包构建与必要校验，确认首版能力严格限定在 `pure/light/dark/auto` 范围内
