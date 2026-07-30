## ADDED Requirements

### Requirement: Highlight example page

playground SHALL 包含一个高亮插件示例路由，并 SHALL 使用 `bytemd-plugin-highlight-github` 渲染可编辑的多语言代码块示例。

#### Scenario: 打开高亮插件示例

- **WHEN** 用户访问高亮插件的 Playground 路由
- **THEN** 页面 SHALL 显示可编辑的 Markdown 代码块，并通过高亮插件以可观察的主题样式渲染预览

#### Scenario: 编辑代码块内容

- **WHEN** 用户在高亮插件示例中编辑 Markdown 内容
- **THEN** 页面 SHALL 使用高亮插件重新渲染预览中的代码块
