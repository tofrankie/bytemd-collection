## 1. 对齐 math 子包元数据与依赖

- [x] 1.1 更新 `packages/plugin-math/package.json`，将包名切换为 `bytemd-plugin-math`、版本设置为 `0.0.1`，并把 `author`、`homepage`、`repository`、`bugs`、`funding` 等包信息切换到你当前维护的版本，再补齐 `type`、`packageManager`、`files`、脚本与发布配置等字段
- [x] 1.2 结合当前 `bytemd` 工作区版本，审查并升级 `packages/plugin-math` 中的 `katex`、`remark-math`、类型依赖与 peer dependency / devDependency 声明
- [x] 1.3 为 `packages/plugin-math` 补齐或更新 `CHANGELOG.md`、`LICENSE`，并确保发布清单包含 README、样式入口和必要静态资源
- [x] 1.4 将 `packages/plugin-math/tsconfig.json` 补入根 `tsconfig.json` 的 `references`，使该包纳入工作区统一类型工程

## 2. 发布 KaTeX 样式与字体资源

- [x] 2.1 为 `packages/plugin-math` 增加 KaTeX 样式资源的构建或复制流程，参考 `bytemd-plugin-highlight-github` 生成包内可发布的 `dist/styles/katex.css` 与对应字体资源目录
- [x] 2.2 更新 `packages/plugin-math/package.json` 的 `exports`、`sideEffects`、`style` 或相关发布字段，暴露 `bytemd-plugin-math/styles/katex.css` 公开入口
- [x] 2.3 复查 `packages/plugin-math/src/index.ts` 及相关源码，确保默认插件入口、`locale` / `katexOptions` API 与当前公式渲染行为在本次升级后保持兼容
- [x] 2.4 验证 `dist/styles/katex.css` 中的字体引用路径能从 `bytemd-plugin-math` 包内解析，不要求消费者额外复制 `katex/dist/fonts/*`
- [x] 2.5 验证样式导出使用纯 CSS 产物即可在 Vite 等构建工具中导入，不再要求消费者导入 SCSS 源文件

## 3. 更新文档并完成验证

- [x] 3.1 重写 `packages/plugin-math/README.md`，改用 `bytemd-plugin-math` 作为安装与导入主体，并展示 `import 'bytemd-plugin-math/styles/katex.css'` 的样式用法
- [x] 3.2 在 README 或 `CHANGELOG.md` 中明确记录从 `@bytemd/plugin-math` 迁移到 `bytemd-plugin-math` 的 breaking change 与迁移方式
- [x] 3.3 运行 `packages/plugin-math` 相关的类型检查、构建和发布入口校验，确认 JS 入口、`dist/styles/katex.css` 和字体资源均已进入最终产物
- [x] 3.4 通过检索与抽样检查复核仓库中与 math 插件相关的旧包名、旧样式导入路径和仓库链接，确保文档与包契约一致
- [x] 3.5 参考现有子包模式，为 `bytemd-plugin-math` 补充一个 playground 示例页面与路由，并验证公式渲染和 `bytemd-plugin-math/styles/katex.css` 导入正常
