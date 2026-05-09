# Cursor Template Starter — 工具包说明

本项目包含一套完整的 **Cursor Rules + Skills + 工程化约定文档**，可作为 React + TypeScript 项目的标准模板。

---

## 文件清单

### Cursor Rules

加载策略详见 `.cursor/rules/README.md`。当前 5 条 always-on，8 条按 glob 触发。

| 文件 | 加载 | 说明 |
|------|------|------|
| `.cursor/rules/workflow.rule.mdc` | always | 标准开发流程 + 提交前自检清单 |
| `.cursor/rules/auto-routing.rule.mdc` | always | 关键词 → skill / workflow 自动路由 |
| `.cursor/rules/typescript-conventions.rule.mdc` | always | TypeScript 编码规范（类型、命名、导入顺序） |
| `.cursor/rules/styling.rule.mdc` | always | 样式分工（Tailwind + Less CSS Modules + Ant Design） |
| `.cursor/rules/error-handling.rule.mdc` | always | 错误责任边界 / Result 模式 / `App.useApp()` 用法 |
| `.cursor/rules/page-layering.rule.mdc` | glob `src/pages/**` | 页面四层架构（入口 / 区域 / Hook / 展示） |
| `.cursor/rules/react-performance.rule.mdc` | glob `src/**/*.{ts,tsx}` | React 渲染性能（memo / useCallback / useMemo） |
| `.cursor/rules/data-fetching.rule.mdc` | glob `src/pages/**/hooks` | 业务 Hook 三态契约 / 请求取消 / 乐观更新 |
| `.cursor/rules/forms.rule.mdc` | glob `src/pages/**` | antd Form 统一范式 / 提交态 / 校验 |
| `.cursor/rules/routing.rule.mdc` | glob `src/router/**` | React Router v6 路由规则 |
| `.cursor/rules/zustand-stores.rule.mdc` | glob `src/stores/**` | Zustand 全局状态管理 |
| `.cursor/rules/api-services.rule.mdc` | glob `src/services/**` | API 请求层与模块组织 |
| `.cursor/rules/svg-icons.rule.mdc` | glob `*.svg` | SVG 图标管理 |

### Cursor Skills

触发与维护详见 `.cursor/skills/README.md`。

| Skill | 触发场景 | 深度参考 |
|-------|---------|---------|
| `generate-page` | 生成四层架构页面脚手架 | `references/page-layering-guide.md`、`references/react-performance-guide.md` |
| `add-api-module` | 新建 API 服务模块 | — |
| `add-zustand-store` | 新建 Zustand 全局 Store | — |
| `add-route` | 注册新路由 + 创建页面入口 | — |

### 文档

| 文件 | 说明 |
|------|------|
| `docs/engineering-conventions.md` | 工程化配置与开发约定（17 个领域） |
| `docs/complex-page-prd.md` | PRD 范例（API 管理仪表盘） |

---

## 快速开始

```bash
pnpm install
pnpm dev
```

在 Cursor 中直接描述需求，Rules 自动注入约束，Skills 按需触发：

```
请生成一个用户管理页面，包含用户列表和用户详情两个区域。
```
