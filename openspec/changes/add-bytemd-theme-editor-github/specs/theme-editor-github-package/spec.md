## Purpose

定义 `bytemd-theme-editor-github` 的发布模型、主题产物和 SCSS token 组合能力，确保 bytemd 编辑器样式可以在不改造内核包的前提下复用 Primer/GitHub 风格主题 token。

## ADDED Requirements

### Requirement: 可发布的编辑器主题样式包

系统 SHALL 提供名为 `bytemd-theme-editor-github` 的工作区包，用于发布 bytemd 编辑器主题样式。该包 MUST 作为独立样式资产包存在，MUST NOT 以修改 `@tofrankie/bytemd` 源码为前提，并 MUST 提供 README、`LICENSE`、`CHANGELOG.md` 与当前仓库一致的包元数据。

#### Scenario: 查看编辑器主题包元数据

- **WHEN** 维护者检查 `packages/theme-editor-github/package.json`
- **THEN** 该文件 MUST 声明 `name: 'bytemd-theme-editor-github'`，并提供与当前仓库其他发布子包一致的 `author`、`homepage`、`repository`、`bugs`、`license`、`files` 与 `funding` 字段

#### Scenario: 引入编辑器主题包而不改造内核

- **WHEN** 使用者安装并使用 `bytemd-theme-editor-github`
- **THEN** 系统 MUST 允许其作为独立样式包消费，而不要求同步修改 `@tofrankie/bytemd` 的包内容或运行时 API

#### Scenario: 从包根导入默认主题

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github'`
- **THEN** 包根入口 MUST 直接解析到 `dist/light.css`
- **AND** 包 MUST NOT 发布仅用于转发主题的 JS 入口

### Requirement: 发布完整的 Primer 主题产物

`bytemd-theme-editor-github` SHALL 发布 `pure.css`、所有 `@primer/primitives` functional concrete theme CSS 与预定义的 `auto-*.css` 自动配对主题。concrete theme 入口 MUST 表示固定 token 集；自动主题入口 MUST 在 light 与 dark 两组 token 之间自动切换。

#### Scenario: 导入纯规则产物

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/pure.css'`
- **THEN** 系统 MUST 提供仅包含规则与 `var(--token)` 引用的 CSS 产物，而不定义任何主题 token

#### Scenario: 导入任意 concrete theme

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/<theme>.css'`，其中 `<theme>` 为当前 `@primer/primitives` functional theme 目录中的 concrete theme
- **THEN** 系统 MUST 提供包含对应主题 token 定义和完整规则的最终 CSS 产物

#### Scenario: 导入自动配对主题产物

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/auto.css'` 或任一 `auto-*.css`
- **THEN** 系统 MUST 根据该入口的预定义 light/dark theme 配对，在 `data-color-mode`、`data-light-theme`、`data-dark-theme` 与 `prefers-color-scheme` 条件下提供自动切换的最终 CSS 产物

### Requirement: 纯规则产物覆盖完整 SCSS import 链路

`pure.css` SHALL 覆盖 `src/index.scss` 及其 import 链路中的全部规则输出。系统 MUST 允许这些规则同时包含 `.bytemd`、`.tippy-box` 或其他 selector，而不得要求它们只能归属于单一容器。

#### Scenario: 规则链路包含多个宿主 selector

- **WHEN** `src/index.scss` 及其 import 文件同时定义 `.bytemd` 和 `.tippy-box` 规则
- **THEN** `pure.css` MUST 保留这些规则，而不是只输出某一个固定容器下的样式

### Requirement: 提供多 target 的 SCSS token mixin

系统 SHALL 提供将规则输出与主题 token 输出分离的 SCSS 入口。主题 token 输出 MUST 支持多个 target，每个 target 都 MUST 能独立声明基础 token 容器 selector、显式主题 mode、原样输出的主题 token selector、对应 token 方案与可选 `media` 条件。

#### Scenario: 同时为编辑器和浮层声明主题 token

- **WHEN** 宿主通过 SCSS 入口为 `.bytemd` 和 `.tippy-box` 分别声明 target
- **THEN** 系统 MUST 能为这两个 target 分别生成 token 定义，而不要求它们共享同一个固定容器

#### Scenario: target 使用显式 modes 结构

- **WHEN** 宿主声明某个 target 的主题模式
- **THEN** 系统 MUST 通过显式的 `modes` 结构接收 `selectors`、`tokens` 与可选 `media` 信息，而不是依赖隐式简写推断 light、dark 或 auto 语义

#### Scenario: selector 与 media 分支原样输出

- **WHEN** 某个 mode 声明多个 `selectors`，并为该 mode 声明 `media`
- **THEN** 系统 MUST 将 selectors 作为同一个逗号分组原样输出到对应 `@media` 分支，且 MUST NOT 自动将它们与 target 的 container 拼接

#### Scenario: 支持主题状态节点之外的 Tippy portal

- **WHEN** Tippy tooltip 节点被挂载到主题状态节点之外的 portal 容器
- **THEN** 生成的主题 token 选择器 MUST 使用 `body:has(#root > [data-color-mode='...'][data-*-theme='...'])` 关系匹配该 tooltip
- **AND** 自动主题的 `auto` 分支 MUST 将对应的 portal 选择器放入匹配的 `@media (prefers-color-scheme: light|dark)` 块中

### Requirement: 主题 token 按引用闭包提取

系统 SHALL 从 `@primer/primitives` 的主题目录与相关 functional 静态 token 文件中提取主题变量。构建流程 MUST 分别从每个 `src/patchs/*.scss` 规则输出里实际引用的 CSS 变量出发递归收集依赖，只输出最终闭包中的 token，而 MUST NOT 将全部 Primer token 无差别写入每个主题产物或其他 patch 的 container。

#### Scenario: 规则只引用部分 Primer token

- **WHEN** 规则源文件只引用少量 `fgColor`、`bgColor`、`borderColor`、`base-size` 或其他 Primer token
- **THEN** 生成的主题产物 MUST 只包含这些 token 及其依赖闭包，而不是包含整个 Primer 主题全集

#### Scenario: 缺失被规则引用的 token

- **WHEN** 某个规则引用的 token 无法从 Primer 主题文件或静态 functional 文件中解析
- **THEN** 构建流程 MUST 视为失败，而不是静默省略该 token

#### Scenario: patch token 相互隔离

- **WHEN** `.bytemd` 与 `.tippy-box` 分别由不同 patch 定义规则
- **THEN** 每个 container MUST 只定义其自身规则引用的基础 token 与主题 token，而不得携带另一个 patch 未引用的 token

### Requirement: 发布可组合的 patch SCSS 源

系统 SHALL 将可组合规则源维护在 `src/patchs/`，并以 `patchs/*.scss` 形式作为公开 SCSS 入口。每个 patch MUST 暴露对应的 `render-<name>()` mixin；`src/patchs/index.scss` MUST 作为完整规则的聚合入口。

#### Scenario: 使用者按需组合 patch

- **WHEN** 使用者导入 `bytemd-theme-editor-github/patchs/editor.scss` 或其他已发布 patch
- **THEN** 系统 MUST 允许使用者调用该 patch 的 `render-<name>()` mixin，而不要求导入完整规则集合

#### Scenario: 新增 patch 后构建

- **WHEN** 维护者新增 `src/patchs/<name>.scss`、在聚合入口中导入它并执行构建
- **THEN** 系统 MUST 将该 patch 的规则和按引用闭包收集的 token 自动纳入 CSS 产物与 artifacts 快照

### Requirement: 保留可比对的主题快照产物

系统 SHALL 在包目录内保留与发布产物同源生成的 artifacts 快照，用于比较上游 Primer 升级或规则变更后的主题输出差异。正式发布入口 MAY 指向 `dist/`，但快照产物 MUST 保持在独立目录中并纳入版本管理。

#### Scenario: 升级 Primer 后检查主题差异

- **WHEN** 维护者升级 `@primer/primitives` 并重新生成编辑器主题产物
- **THEN** 仓库 MUST 提供稳定路径下的 artifacts 快照，以便维护者直接比较主题输出变化
