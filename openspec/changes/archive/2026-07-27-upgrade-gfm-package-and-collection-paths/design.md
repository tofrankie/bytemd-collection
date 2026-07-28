## Context

当前工作区内的 `packages/plugin-gfm` 仍保留了更多上游 `@bytemd/plugin-gfm` 的历史痕迹：`remark-gfm` 依赖版本较旧，`package.json` 缺少与现有维护子包一致的 `type`、`packageManager`、作者、主页、仓库、问题反馈、脚本等字段，README 也仍展示上游作用域包名。与此同时，根 README 与多个子包 README、`package.json` 中仍写死 `bytemd-plugin` 仓库路径，而仓库对外命名即将调整为 `bytemd-collection`。

这次变更同时涉及单个子包升级、跨包元数据统一、README 文案同步和锁文件更新，属于跨工作区的联动修改。用户还明确要求“先改路径，稍后再手动改目录名”，因此设计上必须把“对外引用路径”和“仓库实际目录结构”拆开处理。

在实际联调中确认，`bytemd@1.22.0` 仍依赖 `remark-parse@10` / `unified@10` 解析链，而 `remark-gfm@4` 已切换到 `remark-parse@11` / `unified@11`。因此本次实现需要将 `packages/plugin-gfm` 保持在与当前 `bytemd` 兼容的 `remark-gfm@^3.0.1` 版本线上。

## Goals / Non-Goals

**Goals:**

- 将 `packages/plugin-gfm` 的 `remark-gfm` 对齐到与 `bytemd@1.22.0` 兼容的 `^3.0.1`，并同步锁文件。
- 让 `packages/plugin-gfm/package.json` 与当前维护中的其他子包在字段结构、发布脚本和仓库元数据上保持一致，并确保包信息明确指向本项目。
- 让可发布子包遵循统一的发布文件约定，包括携带从根目录复制的 `LICENSE`、提供 `CHANGELOG.md`，并在 `package.json` 中正确声明 `license`、`files`、`homepage`、`repository`、`bugs` 与统一的 `funding`。
- 更新 `packages/plugin-gfm/README.md` 的包名展示、安装方式、导入示例与许可证/仓库链接。
- 将根 README、各子包 README 与工作区包元数据中的 GitHub 仓库路径统一切换为 `bytemd-collection`。
- 统一根 README、各子包 README 与各包 `description` 的表达风格，使其符合本项目的整体定位，并保持简洁、准确、自然的美式英文。
- 保证本次只修改“文本和元数据中的路径引用”，不提前改动物理目录名称。

**Non-Goals:**

- 不在本次变更中重命名仓库根目录、工作区目录或 `packages/*` 目录名。
- 不改动 `plugin-gfm` 的插件公开 API、Markdown 渲染行为或默认选项。
- 不引入新的 playground 页面或新的发布包。
- 不处理与 `bytemd-collection` 迁移无关的 README 文案润色。

## Decisions

### 沿用现有包名，仅升级依赖与维护元数据

`packages/plugin-gfm` 继续保留当前发布包名 `bytemd-plugin-gfm`，本次只将 `remark-gfm` 对齐到当前 `bytemd` 可兼容的版本线，并对齐维护元数据、脚本与 README。这样可以先完成依赖与文档治理，避免把“包名迁移”与“仓库路径迁移”耦合到同一次变更里。

备选方案是同步把 `plugin-gfm` 也迁移到新的 npm scope 或新包名。该方案会额外引入兼容性、迁移说明和发布策略问题，因此不采用。

### 以现有维护子包为模板统一 `plugin-gfm/package.json`

`packages/mermaid`、`packages/github-alerts`、`packages/highlight` 已形成当前仓库维护约定：声明 `type: module`、`packageManager`、作者信息、`homepage`、`repository`、必要时 `bugs`、`files` 和统一的 `dev/build/typecheck/publint` 脚本。`plugin-gfm` 将参照这些现有模式补齐，并将 `author`、`homepage`、`repository`、`bugs` 等字段统一改为指向本项目，而不是继续沿用上游原始清单格式。

备选方案是继续使用 `remark-gfm@4` 并尝试直接兼容。该方案会引入 `remark/unified` 主版本不匹配的运行时问题，不适合当前 `bytemd` 版本，因此不采用。

### 将 `bytemd-collection` 仅作为对外引用前缀，不提前修改目录段

所有 README、`homepage`、`repository.url`、`bugs.url`、许可证链接等对外跳转都统一切换为 `https://github.com/tofrankie/bytemd-collection...`。但 `repository.directory` 以及 README 中指向仓库内文件的包目录段仍保持当前 `packages/<name>` 结构，因为实际目录尚未改名。

备选方案是提前把文档中的目录段也改成未来的新目录名。该方案会让当前仓库中的链接先失效，不符合“路径先改、目录后改”的要求，因此不采用。

### README 说明以当前维护包为准，不再展示上游作用域导入

`packages/plugin-gfm/README.md` 与根 README 中关于 GFM 插件的安装和导入示例，将以当前维护包 `bytemd-plugin-gfm` 为准；若需要说明来源，可在 README 尾部保留 fork 信息，但不再让主体用法指向 `@bytemd/plugin-gfm`。

备选方案是保留上游作用域示例，仅在文字里补充“当前仓库维护版本”。该方案会让用户无法直接根据 README 使用当前发布包，因此不采用。

### 文档与包描述统一采用仓库整体视角

根 README 应从仓库整体定位出发，说明本项目是围绕 bytemd 的插件与配套样式包集合；各子包 README 和 `package.json` `description` 则应从单包能力出发，用统一、简洁、准确的美式英文描述功能。这样可以让仓库首页、包详情页和子包文档形成同一套表达系统。

根 README 的 Packages 表格描述也应与对应子包 `README.md` 首段和 `package.json` `description` 保持语义一致，避免根 README 采用另一套更宽泛或更窄的说法，导致首页摘要与包详情页脱节。

备选方案是分别按每个包独立润色，不定义统一口径。该方案短期可行，但会继续累积语气、句式和定位层级不一致的问题，因此不采用。

### 新增子包默认补充 playground 示例

新增子包时不应只交付包代码、README 和发布元数据，还应补一个可直接运行的 playground 示例页，用于在仓库内部快速验证该子包的最小可用行为。实现方式应参考现有的 Mermaid、Highlight 等示例路由，沿用当前 `playground` 的路由与页面组织模式，而不是为每个新包临时发明新的演示入口。

备选方案是把 playground 视为可选项，仅在用户额外要求时补充。该方案会削弱仓库对新子包的可验证性，也不利于后续维护者快速理解包能力，因此不采用。

### 子包发布配套文件采用统一模板

每个可发布子包都应默认带有 `LICENSE` 和 `CHANGELOG.md`，其中 `LICENSE` 复制自仓库根目录，`CHANGELOG.md` 则作为随包发布的维护记录一并纳入 `files`。同时，子包 `package.json` 还应统一提供 `homepage`、`repository`、`bugs` 与 `funding` 字段，前者统一指向本项目的仓库页面，后者统一包含 PayPal 与爱发电两种资助方式。这样后续新增子包时可以直接按统一模板初始化，避免出现许可证缺失、变更记录缺失、仓库元数据缺失、资助信息缺失或 npm 发布内容不完整的问题。

备选方案是把这些文件视为“按需补充”的可选项。该方案会让新子包质量不稳定，也不利于后续发布维护，因此不采用。

## Risks / Trade-offs

- [`remark-gfm` 与 `bytemd` 解析栈主版本不兼容] → 保持在 `remark-gfm@^3.0.1` 兼容版本线，并通过 `plugin-gfm` 与 playground 示例验证运行时行为。
- [全仓库路径替换容易误伤实际文件路径或 npm 包名] → 仅替换 GitHub 仓库相关 URL、README 文案与链接目标，不改动 `packages/*` 实际目录名和已发布 npm 包名。
- [不同子包当前元数据字段并不完全一致] → 以“现有维护子包的共同最小约定”为基准统一 `plugin-gfm`，同时确保 `author`、`homepage`、`repository`、`bugs` 明确落在本项目语义下；对 `publishConfig` 等仍按子包实际需要决定。
- [部分 README 示例或 Markdown 文档中的历史包名可能被遗漏] → 使用全文检索覆盖 `bytemd-plugin`、`@bytemd/plugin-gfm`、旧 GitHub 路径等关键字，并在完成后复查剩余引用。

## Migration Plan

1. 先更新 `packages/plugin-gfm` 的依赖、元数据和 README，使单包定义与当前维护约定一致，并让作者/仓库/主页/问题反馈全部指向本项目。
2. 再统一根 README、各子包 README、根/子包 `package.json` 中的仓库路径与文案前缀为 `bytemd-collection`。
3. 更新 `pnpm-lock.yaml`，并执行受影响包的类型检查、构建与必要的工作区校验。
4. 如果需要回退，可独立撤销 `plugin-gfm` 的依赖升级，或单独撤销路径文案调整；由于未修改物理目录结构，回退不会涉及文件移动。

## Open Questions

- 根 README 的包列表是否要在本次一并补充 `plugin-gfm` 条目，还是仅更新现有条目的仓库路径与说明。
