## MODIFIED Requirements

### Requirement: 基于路由的 playground 入口

playground SHALL 提供基于路由的插件示例入口，并 SHALL 允许每个示例页定义各自的 markdown 内容与插件集合。

#### Scenario: 在不同示例间切换

- **WHEN** 用户打开不同的 playground 路由
- **THEN** 每个路由 SHALL 独立渲染对应的示例页面

#### Scenario: 新增子包时扩展 playground

- **WHEN** 仓库新增一个新的可发布子包
- **THEN** playground SHALL 为该子包新增一个对应的示例路由或页面，以便在仓库内直接验证其能力

### Requirement: 新子包示例遵循现有模式

新增子包的 playground 示例 SHALL 参考现有示例页面的组织方式实现，包括现有路由结构、页面布局、示例 markdown 管理方式与最小可观察演示目标。

#### Scenario: 维护者为新子包创建 playground 示例

- **WHEN** 维护者为新增子包添加 playground 页面
- **THEN** 该页面 SHALL 复用现有 `playground` 的路由化与页面组织模式，而不是采用与现有示例明显不一致的独立实现方式

### Requirement: 完整 bytemd 组合示例页面

playground SHALL 提供一个完整的 bytemd 编辑器示例页，用于验证多插件共存时的编辑、预览与主题效果。该页面 MUST 参考仓库外部真实使用场景中的插件组合，优先接入本仓库 workspace 包，并补齐需要的官方 bytemd 插件。

#### Scenario: 打开完整组合示例页

- **WHEN** 用户访问完整 bytemd 组合示例路由
- **THEN** 页面 MUST 同时接入仓库维护的 `bytemd-plugin-github-alerts`、`bytemd-plugin-gfm`、`bytemd-plugin-highlight-github`、`bytemd-plugin-mermaid` 以及所需的官方 bytemd 插件，并展示可编辑的 Markdown 预览效果

#### Scenario: 组合示例验证主题包

- **WHEN** 用户在完整 bytemd 组合示例中查看包含脚注、task list、代码块、数学公式和 Mermaid 的 Markdown
- **THEN** 页面 MUST 使用仓库内发布的 GitHub 主题包入口来渲染这些内容，以便直接验证多插件联动下的最终样式

### Requirement: GFM 示例页消费仓库主题包

playground 的 GFM 示例页面 SHALL 通过仓库内发布的主题包入口验证 GitHub 风格样式，而不是继续直接依赖上游主题包路径。

#### Scenario: 打开 GFM 示例页

- **WHEN** 用户访问 GFM 示例页面
- **THEN** 页面 MUST 通过 `bytemd-theme-github` 的默认入口或显式主题入口加载样式，并展示表格、任务列表、脚注、删除线和自动链接等效果
