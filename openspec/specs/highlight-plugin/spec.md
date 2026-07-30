# 高亮插件规范

## Purpose

提供一个可发布的 bytemd 高亮插件，用于在 Viewer 中按需接入 `highlight.js` 代码高亮能力，并明确该插件在依赖声明、运行时加载、初始化钩子和主题样式职责边界上的统一约定。

## Requirements

### Requirement: 可发布的高亮插件包

系统 SHALL 提供名为 `bytemd-plugin-highlight-github` 的工作区包。该包 MUST 声明 `bytemd` 为 peer dependency、声明 `highlight.js@^11.11.1` 为运行时 dependency，并提供 ESM、CJS、UMD 与 TypeScript 声明入口。

#### Scenario: 消费者从任一模块系统导入插件

- **WHEN** 消费者通过 ESM、CommonJS 或浏览器 UMD 入口加载该包
- **THEN** 系统 MUST 提供同一个默认高亮插件工厂函数及其 TypeScript 类型

#### Scenario: bytemd 由应用提供

- **WHEN** 包被安装到使用 bytemd 的应用中
- **THEN** 包 MUST 使用应用提供的兼容 `bytemd` peer dependency，而不是将 `bytemd` 打包进构建产物

### Requirement: Viewer 代码块按需高亮

默认插件工厂 SHALL 返回 `BytemdPlugin`，并在 Viewer effect 中选择 `markdownBody` 下的 `pre > code` 元素。系统 MUST 在不存在匹配元素时不加载 `highlight.js`，并在存在匹配元素时调用 `highlight.js` 的元素高亮 API。

#### Scenario: Viewer 不包含代码块

- **WHEN** Viewer 的 `markdownBody` 中没有 `pre > code` 元素
- **THEN** 系统 MUST 不加载 `highlight.js` 且不执行高亮操作

#### Scenario: Viewer 包含代码块

- **WHEN** Viewer 的 `markdownBody` 中存在一个或多个 `pre > code` 元素
- **THEN** 系统 MUST 加载 `highlight.js` 并对每个匹配元素执行高亮

### Requirement: 可选的高亮库初始化

插件工厂 SHALL 接受可选的 `init` 回调，该回调接收加载后的 `highlight.js` 实例，并可同步或异步完成。系统 MUST 在同一插件实例首次加载高亮库后调用该回调一次，并在回调完成后再高亮代码块。

#### Scenario: 使用者注册额外语言

- **WHEN** 使用者传入会向 `highlight.js` 注册语言的异步 `init` 回调
- **THEN** 系统 MUST 等待回调完成，再对当前 Viewer 的代码块执行高亮

#### Scenario: 使用者未传入初始化回调

- **WHEN** 使用者调用插件工厂时未提供 `init`
- **THEN** 系统 MUST 使用默认的 `highlight.js` 实例完成代码块高亮

### Requirement: Primer 主题样式导出

系统 SHALL 为 `bytemd-plugin-highlight-github` 发布基于 `@primer/primitives` 功能主题生成的高亮样式文件。对于每个受支持主题，系统 MUST 提供 `bytemd-plugin-highlight-github/styles/<theme>.css` 入口，并将该入口映射到包内发布产物 `dist/styles/<theme>.css`。主题文件中，系统 MUST 将所有以 `--prettylights-` 开头的 CSS 变量定义、`src/base.scss` 中引用到的主题变量，以及它们所依赖的变量引用一起收敛到 `.hljs {}` 作用域，并与插件的高亮规则样式合并输出。生成的变量定义段 MUST 标注其来源的 `@primer/primitives` 版本。

#### Scenario: 应用导入一个生成主题

- **WHEN** 应用导入 `bytemd-plugin-highlight-github/styles/<theme>.css`
- **THEN** 系统 MUST 提供包含 `.hljs {}` 作用域变量定义与高亮规则的完整 CSS 产物

#### Scenario: 验证主题变量来源

- **WHEN** 消费者检查任一生成主题 CSS 中的变量定义段
- **THEN** 系统 MUST 能让消费者看到该段内容基于哪个 `@primer/primitives` 版本生成

### Requirement: 纯规则样式导出

系统 SHALL 提供 `bytemd-plugin-highlight-github/styles/pure.css` 入口。该文件 MUST 仅包含由插件规则样式编译得到的选择器与变量引用，不包含任何 CSS 变量定义，以便应用将主题变量与规则样式分开组合。

#### Scenario: 应用只导入纯规则样式

- **WHEN** 应用导入 `bytemd-plugin-highlight-github/styles/pure.css`
- **THEN** 系统 MUST 提供不定义 CSS 变量、但仍保留变量引用的 CSS 产物

### Requirement: 仓库内保留可比对的样式基准产物

系统 SHALL 在 `packages/plugin-highlight-github` 包目录内保留一份与发布样式构建同步更新的可提交产物，用于在升级 `@primer/primitives` 等上游依赖后比较主题输出是否发生变化。正式发布的 CSS 主题 MUST 写入 `dist/styles/`，而该基准产物 MUST 保持在独立的仓库路径中、与发布产物同源生成，并且 MUST 不作为包对外导出接口的一部分。

#### Scenario: 维护者升级上游依赖后检查差异

- **WHEN** 维护者重新生成高亮主题样式并查看仓库变更
- **THEN** 系统 MUST 提供一份稳定路径下的基准产物，供维护者直接比较输出差异

#### Scenario: 消费者查看包导出

- **WHEN** 消费者查看 `bytemd-plugin-highlight-github` 的公开导出
- **THEN** 系统 MUST 不要求消费者通过该基准产物路径来导入样式

### Requirement: 主题样式由应用选择

插件 SHALL 不自动导入或注入任何高亮主题 CSS。README MUST 展示应用从 `bytemd-plugin-highlight-github/styles/<theme>.css` 或 `bytemd-plugin-highlight-github/styles/pure.css` 导入样式，并将插件加入 ByteMD `plugins` 的使用方式。系统 MUST 不再承诺重新导出 `highlight.js/styles/*` 原生主题文件，也 MUST 不再提供 `scss/<theme>` 形式的样式导出。

#### Scenario: 应用选择插件包内主题

- **WHEN** 应用需要代码块主题样式
- **THEN** 应用 MUST 能自行从 `bytemd-plugin-highlight-github/styles/<theme>.css` 导入所选主题，而插件不覆盖该选择

#### Scenario: 应用升级到新样式入口

- **WHEN** 应用查阅高亮插件 README
- **THEN** 文档 MUST 指向插件包内的主题样式入口，而不是 `highlight.js/styles/*` 路径

#### Scenario: 应用尝试查找 SCSS 入口

- **WHEN** 应用或维护者查阅高亮插件文档与导出声明
- **THEN** 系统 MUST 只暴露 CSS 主题入口，而不再声明 `scss/<theme>` 导出
