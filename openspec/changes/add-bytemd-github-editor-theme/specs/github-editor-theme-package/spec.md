## Purpose

定义 `bytemd-theme-editor-github` 的发布模型、主题产物和 SCSS token 组合能力，确保 bytemd 编辑器样式可以在不改造内核包的前提下复用 Primer/GitHub 风格主题 token。

## ADDED Requirements

### Requirement: 可发布的编辑器主题样式包

系统 SHALL 提供名为 `bytemd-theme-editor-github` 的工作区包，用于发布 bytemd 编辑器主题样式。该包 MUST 作为独立样式资产包存在，MUST NOT 以修改 `@tofrankie/bytemd` 源码为前提，并 MUST 提供 README、`LICENSE`、`CHANGELOG.md` 与当前仓库一致的包元数据。

#### Scenario: 查看编辑器主题包元数据

- **WHEN** 维护者检查 `packages/theme-github-editor/package.json`
- **THEN** 该文件 MUST 声明 `name: 'bytemd-theme-editor-github'`，并提供与当前仓库其他发布子包一致的 `author`、`homepage`、`repository`、`bugs`、`license`、`files` 与 `funding` 字段

#### Scenario: 引入编辑器主题包而不改造内核

- **WHEN** 使用者安装并使用 `bytemd-theme-editor-github`
- **THEN** 系统 MUST 允许其作为独立样式包消费，而不要求同步修改 `@tofrankie/bytemd` 的包内容或运行时 API

### Requirement: 首版发布四类主题产物

`bytemd-theme-editor-github` SHALL 在首版发布 `pure.css`、`light.css`、`dark.css` 与 `auto.css` 四类主题产物。`light.css` 与 `dark.css` MUST 表示单色主题模式，`auto.css` MUST 表示在 light 与 dark 两组 token 之间自动切换的模式。

#### Scenario: 导入纯规则产物

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/pure.css'`
- **THEN** 系统 MUST 提供仅包含规则与 `var(--token)` 引用的 CSS 产物，而不定义任何主题 token

#### Scenario: 导入单色主题产物

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/light.css'` 或 `import 'bytemd-theme-editor-github/dark.css'`
- **THEN** 系统 MUST 提供包含对应主题 token 定义和完整规则的最终 CSS 产物

#### Scenario: 导入自动主题产物

- **WHEN** 使用者执行 `import 'bytemd-theme-editor-github/auto.css'`
- **THEN** 系统 MUST 提供在 light 与 dark 两组 token 之间自动切换的最终 CSS 产物，而不是只固定到其中一种主题

### Requirement: 纯规则产物覆盖完整 SCSS import 链路

`pure.css` SHALL 覆盖 `src/index.scss` 及其 import 链路中的全部规则输出。系统 MUST 允许这些规则同时包含 `.bytemd`、`.tippy-box` 或其他 selector，而不得要求它们只能归属于单一容器。

#### Scenario: 规则链路包含多个宿主 selector

- **WHEN** `src/index.scss` 及其 import 文件同时定义 `.bytemd` 和 `.tippy-box` 规则
- **THEN** `pure.css` MUST 保留这些规则，而不是只输出某一个固定容器下的样式

### Requirement: 提供多 target 的 SCSS token mixin

系统 SHALL 提供将规则输出与主题 token 输出分离的 SCSS 入口。主题 token 输出 MUST 支持多个 target，每个 target 都 MUST 能独立声明容器 selector、主题 mode 和对应的 token 方案。

#### Scenario: 同时为编辑器和浮层声明主题 token

- **WHEN** 宿主通过 SCSS 入口为 `.bytemd` 和 `.tippy-box` 分别声明 target
- **THEN** 系统 MUST 能为这两个 target 分别生成 token 定义，而不要求它们共享同一个固定容器

#### Scenario: target 使用显式 modes 结构

- **WHEN** 宿主声明某个 target 的主题模式
- **THEN** 系统 MUST 通过显式的 `modes` 结构接收 `selectors` 与 `tokens` 信息，而不是依赖隐式简写推断 light、dark 或 auto 语义

### Requirement: 主题 token 按引用闭包提取

系统 SHALL 从 `@primer/primitives` 的主题目录与相关 functional 静态 token 文件中提取主题变量。构建流程 MUST 从规则里实际引用的 CSS 变量出发递归收集依赖，只输出最终闭包中的 token，而 MUST NOT 将全部 Primer token 无差别写入每个主题产物。

#### Scenario: 规则只引用部分 Primer token

- **WHEN** 规则源文件只引用少量 `fgColor`、`bgColor`、`borderColor`、`base-size` 或其他 Primer token
- **THEN** 生成的主题产物 MUST 只包含这些 token 及其依赖闭包，而不是包含整个 Primer 主题全集

#### Scenario: 缺失被规则引用的 token

- **WHEN** 某个规则引用的 token 无法从 Primer 主题文件或静态 functional 文件中解析
- **THEN** 构建流程 MUST 视为失败，而不是静默省略该 token

### Requirement: 保留可比对的主题快照产物

系统 SHALL 在包目录内保留与发布产物同源生成的 artifacts 快照，用于比较上游 Primer 升级或规则变更后的主题输出差异。正式发布入口 MAY 指向 `dist/`，但快照产物 MUST 保持在独立目录中并纳入版本管理。

#### Scenario: 升级 Primer 后检查主题差异

- **WHEN** 维护者升级 `@primer/primitives` 并重新生成编辑器主题产物
- **THEN** 仓库 MUST 提供稳定路径下的 artifacts 快照，以便维护者直接比较主题输出变化
