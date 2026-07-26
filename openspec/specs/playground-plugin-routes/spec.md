## Purpose

为 playground 提供按路由组织的最小示例入口，并用 Mermaid 原生主题配置展示默认与深色渲染效果。

## Requirements

### Requirement: Route-based playground entry points

playground SHALL 提供基于路由的插件示例入口，并 SHALL 允许每个示例页定义各自的 markdown 内容与插件集合。

#### Scenario: 在不同示例间切换

- **WHEN** 用户打开不同的 playground 路由
- **THEN** 每个路由 SHALL 独立渲染对应的示例页面

### Requirement: Mermaid example page

playground SHALL 包含一个 Mermaid 示例路由，用于渲染 Mermaid 内容，并通过 Mermaid 原生 `theme` 配置验证默认主题与深色主题。

#### Scenario: 验证原生主题配置

- **WHEN** 用户打开 Mermaid 示例页面
- **THEN** 页面 SHALL 以可观察的方式渲染 Mermaid 图表，并可分别检查默认主题与深色主题效果

### Requirement: Minimal existing example migration

playground SHALL 通过将现有示例迁移到路由化结构中来保留既有示例能力。

#### Scenario: 现有示例继续可用

- **WHEN** 用户打开迁移后的现有示例路由
- **THEN** 原有示例 SHALL 仍按迁移前的方式正常渲染与工作

### Requirement: Highlight example page

playground SHALL 包含一个高亮插件示例路由，并 SHALL 使用 `@tofrankie/bytemd-plugin-highlight` 渲染可编辑的多语言代码块示例。

#### Scenario: 打开高亮插件示例

- **WHEN** 用户访问高亮插件的 Playground 路由
- **THEN** 页面 SHALL 显示可编辑的 Markdown 代码块，并通过高亮插件以可观察的主题样式渲染预览

#### Scenario: 编辑代码块内容

- **WHEN** 用户在高亮插件示例中编辑 Markdown 内容
- **THEN** 页面 SHALL 使用高亮插件重新渲染预览中的代码块
