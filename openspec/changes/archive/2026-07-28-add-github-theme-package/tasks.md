## 1. 主题包基础设施

- [x] 1.1 新建 `packages/theme-github` 工作区目录，并补齐 `package.json`、README、`LICENSE`、`CHANGELOG.md` 与必要的构建配置
- [x] 1.2 基于 `@tofrankie/github-markdown-css` 的顶层非 `primer/*` 主题文件建立主题复制或构建流程，并生成对外发布的最终样式文件
- [x] 1.3 配置 `bytemd-theme-github` 的条件导出，使 `import 'bytemd-theme-github'` 默认解析到 `light`，并支持 `bytemd-theme-github/<theme>.css` 的短路径导入

## 2. bytemd 主题适配

- [x] 2.1 为主题包补充脚注、`.bytemd-mermaid`、`pre code.hljs`、task list checkbox 与 `.math.math-display` 的兼容样式
- [x] 2.2 确认每个对外发布的主题文件都包含完整的 bytemd 适配补丁，而不要求消费者额外导入第二份补丁文件
- [x] 2.3 确认主题包不暴露 `primer/*`、`styles/*`、`unpkg`、`jsdelivr` 或 UMD 这类超出约定的公开入口

## 3. Playground 组合示例与现有页面接入

- [x] 3.1 为 playground 新增一个完整 bytemd 组合示例路由、页面与测试 Markdown，参考 `github-blogger` 的插件栈并优先使用本仓库 workspace 包
- [x] 3.2 为完整示例页补齐缺失的官方 bytemd 插件依赖，并保证编辑、预览与多插件联动可观察
- [x] 3.3 更新现有 GFM 示例页，使其通过 `bytemd-theme-github` 入口加载主题样式，而不是继续直接依赖上游主题路径

## 4. 验证与文档

- [x] 4.1 在 `packages/theme-github/README.md` 中说明默认浅色主题、短路径 CSS 导入方式，以及与 `bytemd-plugin-gfm`、`bytemd-plugin-highlight-github` 的组合使用方式
- [x] 4.2 执行新主题包与受影响 playground 的构建、类型检查和必要的发布入口校验
- [x] 4.3 复查 OpenSpec、示例页面和包元数据，确认能力边界与用户要求一致后再进入实现阶段
