## Why

`packages/plugin-gfm` 仍停留在较早的 `remark-gfm` 版本，且 `package.json`、子包 README、根 README 中的包信息与仓库路径风格没有完全对齐当前维护中的其他子包约定。随着仓库即将从 `bytemd-plugin` 迁移为 `bytemd-collection`，现在需要先把所有对外路径与文档引用统一好，避免后续目录改名时出现遗漏或混乱。

## What Changes

- 将 `packages/plugin-gfm` 的 `remark-gfm` 依赖升级并对齐到与 `bytemd@1.22.0` 兼容的 `^3.0.1`，并同步更新锁文件。
- 参考 `packages/mermaid`、`packages/github-alerts`、`packages/highlight` 的现有约定，补齐或统一 `packages/plugin-gfm/package.json` 的维护元数据、发布字段、脚本和说明信息，并确保包信息、作者、主页、仓库与问题反馈均指向本项目。
- 更新 `packages/plugin-gfm/README.md`，使安装、导入方式、包名展示和仓库链接与当前维护分支保持一致。
- 更新根 `README.md` 以及各子包文档、`package.json` 中涉及仓库名、主页、issues、许可证链接和包路径的内容，将对外引用从 `bytemd-plugin` 统一调整为 `bytemd-collection`。
- 仅更新引用路径和文案，不在本次变更中直接修改实际目录名称；目录重命名留给后续独立操作处理。

## Capabilities

### New Capabilities

- `gfm-plugin-maintenance`: 定义受维护的 GFM 插件包应使用与当前 `bytemd` 版本兼容的 `remark-gfm` 依赖，并提供与其他子包一致、且明确指向本项目的发布元数据和 README 用法说明。
- `workspace-package-path-metadata`: 定义根 README、子包 README 与工作区包元数据中的仓库、主页、问题反馈和许可证链接应统一使用 `bytemd-collection` 作为对外路径前缀。

### Modified Capabilities

None

## Impact

- 受影响代码与文档：`packages/plugin-gfm`、根 `README.md`、各子包 `README.md`、各子包 `package.json`、根 `package.json`、示例或文档中的仓库路径引用。
- 受影响依赖：`remark-gfm` 版本升级，以及对应的 `pnpm-lock.yaml` 变更。
- 受影响对外接口：`bytemd-plugin-gfm` 的安装与导入说明、npm/仓库跳转链接、README 中展示的包列表与链接目标，以及 `author`、`homepage`、`repository`、`bugs` 等包元数据字段。
