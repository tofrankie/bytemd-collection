## 1. 子包基础设施

- [x] 1.1 新建 `packages/highlight` 工作区目录，并配置与 Mermaid 子包一致的 `package.json` 发布元数据、入口、脚本、关键词和 `bytemd` peer dependency。
- [ ] 1.2 添加 `highlight.js@^11.11.1` 运行时依赖，并更新 pnpm 锁文件。
- [x] 1.3 添加 TypeScript 与 `tsdown` 配置，构建 ESM、CJS、UMD 和类型声明产物，并将 `bytemd` 保持为 external。

## 2. 高亮插件实现

- [x] 2.1 实现默认导出的 `highlight(options?)` 工厂函数和包含可选 `init` 回调的公开选项类型。
- [x] 2.2 在 `viewerEffect` 中检测 `pre > code` 元素，并在不存在代码块时直接返回而不加载 `highlight.js`。
- [x] 2.3 在首次检测到代码块时动态加载 `highlight.js`，等待可选初始化回调完成，并对所有匹配元素调用高亮 API。
- [x] 2.4 确保同一插件实例仅复用一次加载后的高亮库和初始化结果。

## 3. 文档与验证

- [x] 3.1 在 Playground 新增 `/highlight` 路由与可编辑代码块示例，并导入一个 `highlight.js` 主题 CSS。
- [x] 3.2 编写 README，说明安装命令、插件接入、应用导入 `highlight.js` 主题 CSS，以及可选 `init` 回调的语言注册用法。
- [ ] 3.3 执行新子包的 `typecheck`、`build` 和 `publint`，确认发布入口及类型声明可用。
- [ ] 3.4 执行根工作区的类型检查、lint 与构建，并验证带代码块和无代码块的 Viewer 行为。
