## 1. 升级 plugin-gfm 依赖与元数据

- [x] 1.1 将 `packages/plugin-gfm/package.json` 中的 `remark-gfm` 对齐到与 `bytemd@1.22.0` 兼容的 `^3.0.1`
- [x] 1.2 参考其他维护中的子包，为 `packages/plugin-gfm/package.json` 补齐或统一 `type`、`packageManager`、作者、主页、仓库、问题反馈、`files` 与脚本等字段
- [x] 1.3 确认 `packages/plugin-gfm/package.json` 中的 `author`、`homepage`、`repository`、`bugs` 全部指向本项目，而不是保留上游信息
- [x] 1.4 为 `packages/plugin-gfm` 补齐从根目录复制的 `LICENSE`、`CHANGELOG.md`，并确认 `package.json` 的 `license`、`files`、`homepage`、`repository`、`bugs` 与 `funding` 符合统一发布约定
- [x] 1.5 评估并补充 `packages/plugin-gfm` 所需的构建或校验配置，使其与当前工作区发布约定保持一致

## 2. 更新 GFM 文档与工作区路径引用

- [x] 2.1 更新 `packages/plugin-gfm/README.md`，使用 `bytemd-plugin-gfm` 作为主体安装与导入示例，并同步许可证/仓库链接
- [x] 2.2 更新根 `README.md` 中与 GFM 插件、包列表或仓库说明相关的内容，并以仓库整体视角说明本项目围绕 bytemd 的插件与配套样式包定位
- [x] 2.3 扫描并更新根包、各发布子包 `package.json` 与 README 中的 GitHub 仓库路径，将 `bytemd-plugin` 前缀统一替换为 `bytemd-collection`
- [x] 2.4 统一各子包 `README.md` 首段说明与 `package.json` `description` 的表达风格，确保其使用简洁、准确、自然的美式英文并符合各包能力定位
- [x] 2.5 复查各可发布子包是否均包含 `LICENSE`、`CHANGELOG.md` 与正确的 `package.json` `license` / `files` / `homepage` / `repository` / `bugs` / `funding` 配置，确保新增子包也可复用该模板
- [x] 2.6 复查示例 Markdown、README 和其他面向使用者的文档，修正残留的旧仓库路径、上游包名主说明或非本项目链接
- [x] 2.7 将“新增子包时补充 playground 示例，并参考现有示例模式”补充到规范与设计文档中
- [x] 2.8 参考现有 playground 模式，为 `bytemd-plugin-gfm` 补充独立的 GFM 示例页面与示例 markdown

## 3. 锁文件与验证

- [x] 3.1 更新 `pnpm-lock.yaml` 中与 `remark-gfm` 升级相关的锁定结果
- [x] 3.2 执行 `packages/plugin-gfm` 的类型检查、构建和必要的发布入口校验
- [x] 3.3 执行针对仓库路径替换的全文检索复查，确认不误改实际目录名、npm 包名和不应变动的代码路径
