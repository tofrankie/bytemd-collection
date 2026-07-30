## Why

当前仓库中的数学公式插件仍保留上游 `@bytemd/plugin-math` 的包名、元数据和文档口径，和现有 `plugin-gfm`、`plugin-highlight`、`theme-github` 等维护子包不一致，也没有把 KaTeX 样式作为本仓库契约的一部分。现在需要把它补齐为当前工作区可持续维护、可发布、可升级的数学插件包。

## What Changes

- 将 `packages/plugin-math` 从上游口径升级为当前仓库维护的 `bytemd-plugin-math` 包。由于这是基于旧包的重做版本，包信息需要切换为你当前维护的 `author`、`homepage`、`repository`、`bugs`、`funding` 与发布文件清单字段，而不是继续沿用上游信息
- 将当前维护包的初始发布版本定为 `0.0.1`，不沿用上游 `@bytemd/plugin-math` 的历史版本号
- 升级数学插件相关的上游依赖，并保持与当前 `bytemd` 工作区版本兼容的运行时与 peer dependency 约束
- 为包内补充参考 `bytemd-plugin-highlight-github` 的 KaTeX 样式导出入口，将构建产物写入 `dist/styles/`，并允许使用者直接从 `bytemd-plugin-math/styles/katex.css` 导入样式，而不是额外依赖 `katex/dist/katex.css` 或 SCSS 入口
- 补齐与当前仓库其他维护子包一致的 README、`CHANGELOG.md`、`LICENSE` 与安装使用说明
- 参考当前仓库已有子包模式，为 `bytemd-plugin-math` 补充一个可直接验证公式渲染与样式导入的 playground 示例
- **BREAKING**：对外包名从 `@bytemd/plugin-math` 迁移为 `bytemd-plugin-math`，README 与示例中的导入路径随之更新

## Capabilities

### New Capabilities

- `math-plugin`: 定义 bytemd 数学公式插件在包名、依赖、KaTeX 样式导出和 README 契约上的维护规范

### Modified Capabilities

无

## Impact

- 受影响代码主要位于 `packages/plugin-math`，包括 `package.json`、源码入口、样式导出、README、`CHANGELOG.md` 与许可证文件
- 还会影响 `playground` 中的路由、示例页面和示例导入路径
- 会影响该包的安装名、文档示例、发布产物清单以及 KaTeX 样式在 `dist/styles/` 下的导出方式
- 需要审查并升级 `katex`、`remark-math` 及相关类型依赖与构建配置
