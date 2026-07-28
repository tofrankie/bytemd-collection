## Purpose

定义本仓库在 README、子包元数据、发布文件和 playground 示例方面的统一约定，确保新增或维护子包时可以复用一致的模板和表达方式。

## Requirements

### Requirement: 统一的仓库元数据路径

根工作区包与各发布子包的仓库元数据 SHALL 统一使用 `bytemd-collection` 作为对外 GitHub 仓库前缀。凡是 `homepage`、`repository.url`、`bugs.url` 等指向仓库页面的问题反馈或项目主页链接，MUST 指向 `https://github.com/tofrankie/bytemd-collection` 下的对应地址。

#### Scenario: 查看根包或子包元数据

- **WHEN** 维护者检查根 `package.json` 或任一发布子包的 `package.json`
- **THEN** 所有对外 GitHub 仓库链接 MUST 使用 `bytemd-collection` 作为仓库名，而不是 `bytemd-plugin`

#### Scenario: 保留当前目录段

- **WHEN** 维护者检查 `repository.directory` 等仓库内目录定位字段
- **THEN** 在实际目录尚未重命名前，系统 MUST 继续指向当前存在的 `packages/<name>` 目录段

### Requirement: 文档中的统一仓库路径

根 README、子包 README 与其他面向使用者的文档 SHALL 统一使用 `bytemd-collection` 作为仓库链接前缀。文档中的许可证、源码、包列表和仓库跳转链接 MUST 与新的仓库名前缀保持一致，同时不得要求本次变更提前修改真实目录名称。

#### Scenario: 查看根 README 包列表或说明链接

- **WHEN** 使用者打开根 `README.md`
- **THEN** README 中所有仓库、许可证或子包说明链接 MUST 指向 `bytemd-collection` 下的对应页面

#### Scenario: 查看子包 README 的许可证或 fork 来源链接

- **WHEN** 使用者打开任一受影响子包的 README
- **THEN** 文档中的仓库内链接 MUST 使用 `bytemd-collection` 前缀，并继续引用当前真实存在的文件路径或包目录

### Requirement: 文档与包描述表达统一

根 `README.md`、各子包 `README.md` 与各 `package.json` 的 `description` SHALL 使用一致、简洁、准确的美式英文表达，并 MUST 体现本项目围绕 bytemd 插件与配套样式包的整体定位。根 README MUST 从仓库整体视角描述项目；子包 README 与 `description` MUST 从各自包的能力视角描述功能，且不得混用上游口径、过时措辞或风格明显不一致的句式。

#### Scenario: 查看根 README 的项目定位

- **WHEN** 使用者打开根 `README.md`
- **THEN** 文档 MUST 将本项目描述为围绕 bytemd 的插件与配套 CSS 包集合，而不是仅描述为零散插件列表

#### Scenario: 查看各子包 README 与 description

- **WHEN** 维护者检查任一子包 `README.md` 首段或 `package.json` 的 `description`
- **THEN** 这些描述 MUST 使用简洁自然的美式英文，准确说明该包的能力，并与其他子包保持统一表达风格

#### Scenario: 查看根 README 的包表描述

- **WHEN** 维护者检查根 `README.md` 的 Packages 表格描述列
- **THEN** 每条描述 MUST 与对应子包 `README.md` 首段和 `package.json` `description` 在语义上保持一致，不得使用与子包定位明显不吻合的概括性文案

### Requirement: 新增子包附带 playground 示例

后续新增可发布子包时，仓库 SHALL 参考现有 `playground` 示例页面模式，为该子包补充至少一个独立的 playground 示例入口。该示例 MUST 使用该子包的真实包入口、提供最小可观察的演示内容，并使维护者能够在本仓库内快速验证该子包的基本行为。

#### Scenario: 新增一个新的子包

- **WHEN** 维护者在 `packages/` 下新增一个新的可发布子包
- **THEN** 仓库 MUST 同步新增一个对应的 playground 示例页面或路由，而不是只更新包代码与 README

#### Scenario: 参考现有 playground 模式实现示例

- **WHEN** 维护者为新增子包编写 playground 示例
- **THEN** 示例 MUST 参考仓库中已有子包的 playground 组织方式，复用现有路由化结构、页面模式与最小演示内容约定

### Requirement: 新增子包关联根 TypeScript 工程引用

后续新增可发布子包时，仓库 MUST 将该子包的 `tsconfig.json` 同步添加到根目录 `tsconfig.json` 的 `references` 中。根 `tsconfig.json` 的引用路径 MUST 指向当前真实存在的子包目录，以便维护者能够通过根级 TypeScript 工程视图统一管理各子包。

#### Scenario: 新增一个使用 TypeScript 的子包

- **WHEN** 维护者在 `packages/` 下新增一个带有 `tsconfig.json` 的可发布子包
- **THEN** 根目录 `tsconfig.json` MUST 同步新增一条指向该子包 `tsconfig.json` 的 `references` 项，而不是只在子包内部单独维护

#### Scenario: 检查根 tsconfig 的子包引用

- **WHEN** 维护者检查根目录 `tsconfig.json`
- **THEN** `references` 中的每个子包路径 MUST 指向当前真实存在的子包目录，不得保留已经重命名或不存在的旧路径

### Requirement: 子包发布文件约定

每个可发布子包 MUST 包含 `LICENSE` 与 `CHANGELOG.md` 文件。`LICENSE` MUST 默认复制自仓库根目录的许可证文本；子包 `package.json` MUST 声明与该许可证一致的 `license` 协议，并 MUST 在 `files` 中包含 `CHANGELOG.md` 以及所有需要随包发布的静态文件。该约定 SHALL 作为后续新增子包时的默认模板要求。

#### Scenario: 检查子包许可证文件

- **WHEN** 维护者查看任一可发布子包目录
- **THEN** 目录中 MUST 存在从根目录许可证复制而来的 `LICENSE` 文件，且子包 `package.json` 的 `license` 字段 MUST 与之匹配

#### Scenario: 检查子包变更记录与发布清单

- **WHEN** 维护者查看任一可发布子包的 `CHANGELOG.md` 与 `package.json`
- **THEN** 子包 MUST 提供 `CHANGELOG.md`，并且 `package.json` 的 `files` MUST 包含 `CHANGELOG.md`，以便随 npm 包一同发布

### Requirement: 子包仓库元数据模板

每个可发布子包的 `package.json` MUST 提供统一的 `homepage`、`repository` 与 `bugs` 字段。`homepage` MUST 指向 `https://github.com/tofrankie/bytemd-collection/tree/main/packages/<name>`；`repository.url` MUST 指向 `git+https://github.com/tofrankie/bytemd-collection.git`；`repository.directory` MUST 指向当前真实存在的 `packages/<name>` 目录；`bugs.url` MUST 指向 `https://github.com/tofrankie/bytemd-collection/issues`。该约定 SHALL 作为后续新增子包时的默认模板要求。

#### Scenario: 检查子包 funding 配置

- **WHEN** 维护者查看任一可发布子包的 `package.json`
- **THEN** 子包 MUST 提供统一的 `funding` 数组，并同时包含 PayPal 与爱发电两条资助链接

#### Scenario: 检查子包仓库元数据模板

- **WHEN** 维护者查看任一可发布子包的 `package.json`
- **THEN** 子包 MUST 提供统一格式的 `homepage`、`repository` 与 `bugs` 字段，并全部指向本项目对应的仓库页面

### Requirement: 子包 funding 元数据模板

每个可发布子包的 `package.json` MUST 提供统一的 `funding` 数组，并同时包含 `{"type":"paypal","url":"https://paypal.me/tofrankie"}` 与 `{"type":"ifdian","url":"https://ifdian.net/a/tofrankie"}` 两条资助链接。该约定 SHALL 作为后续新增子包时的默认模板要求。

#### Scenario: 检查 funding 模板值

- **WHEN** 维护者查看任一可发布子包的 `package.json`
- **THEN** `funding` 字段 MUST 同时包含 PayPal 与爱发电两条固定链接，而不是遗漏其一或改用其他值
