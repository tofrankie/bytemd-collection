# 高亮插件规范

## Purpose

提供一个可发布的 bytemd 高亮插件，并定义其依赖、高亮行为、初始化能力与主题样式边界。

## Requirements

### Requirement: 可发布的高亮插件包

系统 SHALL 提供名为 `@tofrankie/bytemd-plugin-highlight` 的工作区包。该包 MUST 声明 `bytemd` 为 peer dependency、声明 `highlight.js@^11.11.1` 为运行时 dependency，并提供 ESM、CJS、UMD 与 TypeScript 声明入口。

#### Scenario: 消费者从任一模块系统导入插件

- **WHEN** 消费者通过 ESM、CommonJS 或浏览器 UMD 入口加载该包
- **THEN** 系统 MUST 提供同一个默认高亮插件工厂函数及其 TypeScript 类型

#### Scenario: ByteMD 由应用提供

- **WHEN** 包被安装到使用 ByteMD 的应用中
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

### Requirement: 主题样式由应用选择

插件 SHALL 不自动导入或注入 `highlight.js` 的 CSS 主题。README MUST 展示应用导入 `highlight.js` 主题样式并将插件加入 ByteMD `plugins` 的使用方式。

#### Scenario: 应用选择高亮主题

- **WHEN** 应用需要代码块主题样式
- **THEN** 应用 MUST 能自行从 `highlight.js/styles/*` 导入所选主题，而插件不覆盖该选择
