## ADDED Requirements

### Requirement: Primer 主题样式导出

系统 SHALL 为 `@tofrankie/bytemd-plugin-highlight` 发布基于 `@primer/primitives` 功能主题生成的高亮样式文件。对于每个受支持主题，系统 MUST 提供 `@tofrankie/bytemd-plugin-highlight/styles/<theme>.css` 入口，并将该入口映射到包内发布产物 `dist/styles/<theme>.css`。主题文件中，系统 MUST 将所有以 `--prettylights-` 开头的 CSS 变量定义、`src/base.scss` 中引用到的主题变量，以及它们所依赖的变量引用一起收敛到 `.hljs {}` 作用域，并与插件的高亮规则样式合并输出。生成的变量定义段 MUST 标注其来源的 `@primer/primitives` 版本。

#### Scenario: 应用导入一个生成主题

- **WHEN** 应用导入 `@tofrankie/bytemd-plugin-highlight/styles/<theme>.css`
- **THEN** 系统 MUST 提供包含 `.hljs {}` 作用域变量定义与高亮规则的完整 CSS 产物

#### Scenario: 验证主题变量来源

- **WHEN** 消费者检查任一生成主题 CSS 中的变量定义段
- **THEN** 系统 MUST 能让消费者看到该段内容基于哪个 `@primer/primitives` 版本生成

### Requirement: 纯规则样式导出

系统 SHALL 提供 `@tofrankie/bytemd-plugin-highlight/styles/pure.css` 入口。该文件 MUST 仅包含由插件规则样式编译得到的选择器与变量引用，不包含任何 CSS 变量定义，以便应用将主题变量与规则样式分开组合。

#### Scenario: 应用只导入纯规则样式

- **WHEN** 应用导入 `@tofrankie/bytemd-plugin-highlight/styles/pure.css`
- **THEN** 系统 MUST 提供不定义 CSS 变量、但仍保留变量引用的 CSS 产物

### Requirement: 仓库内保留可比对的样式基准产物

系统 SHALL 在 `packages/plugin-highlight` 包目录内保留一份与发布样式构建同步更新的可提交产物，用于在升级 `@primer/primitives` 等上游依赖后比较主题输出是否发生变化。正式发布的 CSS 主题 MUST 写入 `dist/styles/`，而该基准产物 MUST 保持在独立的仓库路径中、与发布产物同源生成，并且 MUST 不作为包对外导出接口的一部分。

#### Scenario: 维护者升级上游依赖后检查差异

- **WHEN** 维护者重新生成高亮主题样式并查看仓库变更
- **THEN** 系统 MUST 提供一份稳定路径下的基准产物，供维护者直接比较输出差异

#### Scenario: 消费者查看包导出

- **WHEN** 消费者查看 `@tofrankie/bytemd-plugin-highlight` 的公开导出
- **THEN** 系统 MUST 不要求消费者通过该基准产物路径来导入样式

## MODIFIED Requirements

### Requirement: 主题样式由应用选择

插件 SHALL 不自动导入或注入任何高亮主题 CSS。README MUST 展示应用从 `@tofrankie/bytemd-plugin-highlight/styles/<theme>.css` 或 `@tofrankie/bytemd-plugin-highlight/styles/pure.css` 导入样式，并将插件加入 ByteMD `plugins` 的使用方式。系统 MUST 不再承诺重新导出 `highlight.js/styles/*` 原生主题文件，也 MUST 不再提供 `scss/<theme>` 形式的样式导出。

#### Scenario: 应用选择插件包内主题

- **WHEN** 应用需要代码块主题样式
- **THEN** 应用 MUST 能自行从 `@tofrankie/bytemd-plugin-highlight/styles/<theme>.css` 导入所选主题，而插件不覆盖该选择

#### Scenario: 应用升级到新样式入口

- **WHEN** 应用查阅高亮插件 README
- **THEN** 文档 MUST 指向插件包内的主题样式入口，而不是 `highlight.js/styles/*` 路径

#### Scenario: 应用尝试查找 SCSS 入口

- **WHEN** 应用或维护者查阅高亮插件文档与导出声明
- **THEN** 系统 MUST 只暴露 CSS 主题入口，而不再声明 `scss/<theme>` 导出
