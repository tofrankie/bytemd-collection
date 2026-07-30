## 1. 子包骨架与规则产物

- [x] 1.1 新建 `packages/theme-editor-github`，补齐 `package.json`、README、`LICENSE`、`CHANGELOG.md` 与基础构建脚本
- [x] 1.2 建立 `src/index.scss` 及其规则 import 链路，并生成不含 token 定义的 `pure.css`
- [x] 1.3 配置包导出与发布文件清单，提供所有 CSS 主题、`scss` 与 `patchs/*.scss` 的对外入口

## 2. SCSS 主题 mixin 与 token 提取

- [x] 2.1 设计并实现将规则输出与 token 输出拆分的 SCSS 入口
- [x] 2.2 实现支持多 target、显式 modes、原样 selector 与可选 `media` 的主题 token mixin
- [x] 2.3 实现基于每个 patch 规则引用闭包的 Primer token 收集逻辑，覆盖主题目录与必要的 functional 静态 token 文件

## 3. 主题产物与快照验证

- [x] 3.1 生成所有 concrete theme 与 `auto-*.css` 自动配对主题，并确保它们与 `pure.css` 组合后完整可用
- [x] 3.2 生成并提交 artifacts 快照，用于后续 Primer 升级差异对比
- [x] 3.3 完成包构建与必要校验，确认所有 CSS、SCSS 与 patch 发布入口可用
