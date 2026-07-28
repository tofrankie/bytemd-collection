## ADDED Requirements

### Requirement: GFM 插件依赖维护

工作区 SHALL 提供可维护的 `bytemd-plugin-gfm` 包，并 MUST 将 `remark-gfm` 声明为与 `bytemd@1.22.0` 兼容的运行时依赖 `^3.0.1`。该包 MUST 继续将 `bytemd` 保持为兼容的 peer dependency，并保留可供现有使用者消费的模块入口与类型声明。

#### Scenario: 安装 GFM 插件包

- **WHEN** 使用者安装 `bytemd-plugin-gfm`
- **THEN** 包 MUST 解析到 `remark-gfm@^3.0.1`，且不会把 `bytemd` 作为运行时内置依赖打包进去

#### Scenario: 消费者按现有入口导入插件

- **WHEN** 使用者通过包的默认入口导入 `bytemd-plugin-gfm`
- **THEN** 系统 MUST 继续提供与升级前兼容的 GFM 插件默认导出与 TypeScript 类型入口

### Requirement: GFM 插件元数据与 README 对齐

`packages/plugin-gfm/package.json` 与 `packages/plugin-gfm/README.md` SHALL 对齐当前维护子包的发布与说明约定。包元数据 MUST 包含一致的维护信息、仓库信息和构建脚本，且 `author`、`homepage`、`repository`、`bugs` 等字段 MUST 指向本项目；README MUST 展示当前维护包名的安装方式、导入示例和许可证信息，而不是以上游作用域包作为主说明。

#### Scenario: 查看包清单元数据

- **WHEN** 维护者查看 `packages/plugin-gfm/package.json`
- **THEN** 该文件 MUST 呈现与当前维护子包一致的关键字段结构，例如模块类型、包管理器、作者、主页、仓库、问题反馈与发布脚本

#### Scenario: 元数据指向当前项目

- **WHEN** 维护者检查 `packages/plugin-gfm/package.json` 中的 `author`、`homepage`、`repository`、`bugs`
- **THEN** 这些字段 MUST 指向当前维护的项目与仓库，而不是保留上游 `@bytemd/plugin-gfm` 或其他非本项目指向

#### Scenario: 查看 GFM README 用法

- **WHEN** 使用者打开 `packages/plugin-gfm/README.md`
- **THEN** README MUST 以 `bytemd-plugin-gfm` 作为主体安装与导入示例，并提供指向当前维护仓库的许可证或项目链接
