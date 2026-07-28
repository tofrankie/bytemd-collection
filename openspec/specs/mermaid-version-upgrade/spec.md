## Purpose

升级 `bytemd-plugin-mermaid` 到新的 Mermaid 版本，并保留对 Mermaid 原生配置的直接透传。

## Requirements

### Requirement: Mermaid 版本升级

`bytemd-plugin-mermaid` 插件 SHALL 升级到目标 Mermaid 新版本，并 SHALL 保持对 Mermaid 原生配置的直接透传。

#### Scenario: 透传 Mermaid 原生主题

- **WHEN** 插件以 `theme: 'dark'` 创建
- **THEN** 插件 SHALL 将 `theme` 作为 Mermaid 原生配置传入初始化流程

#### Scenario: 默认配置继续可用

- **WHEN** 插件未传入额外 Mermaid 配置
- **THEN** 插件 SHALL 仍然能够成功渲染 Mermaid 图表

### Requirement: 不新增额外的颜色模式封装

插件 SHALL NOT 新增 `colorMode` 等与 Mermaid 原生 `theme` 配置重复的主题包装参数。

#### Scenario: 使用方自行传入 theme

- **WHEN** 使用方需要深色主题
- **THEN** 使用方 SHALL 通过 Mermaid 原生 `theme: 'dark'` 配置完成

### Requirement: Mermaid 渲染结果兼容性

插件 SHALL 兼容升级后 Mermaid `render()` 返回的 SVG 与绑定函数结果。

#### Scenario: 渲染结果写入容器

- **WHEN** Mermaid 图表完成渲染
- **THEN** 插件 SHALL 将返回的 SVG 写入图表容器，并在存在绑定函数时完成绑定
