# Cursor Template Starter — 工具包说明

本项目包含一套完整的 **Cursor Rules + Skills + 工程化约定文档**，可作为 React + TypeScript 项目的标准模板。

---

## 文件清单

### Cursor Rules（始终生效的约束）

| 文件 | 说明 |
|------|------|
| `.cursor/rules/page-layering.rule.mdc` | 页面四层架构（入口/区域/Hook/展示） |
| `.cursor/rules/typescript-conventions.rule.mdc` | TypeScript 编码规范（类型、命名、导入顺序） |
| `.cursor/rules/styling.rule.mdc` | 样式分工（Tailwind + Less CSS Modules + Ant Design） |
| `.cursor/rules/api-services.rule.mdc` | API 请求层与模块组织 |
| `.cursor/rules/zustand-stores.rule.mdc` | Zustand 全局状态管理 |
| `.cursor/rules/routing.rule.mdc` | React Router 路由规则 |
| `.cursor/rules/react-performance.rule.mdc` | React 渲染性能优化（memo / useCallback / useMemo） |
| `.cursor/rules/svg-icons.rule.mdc` | SVG 图标管理（按需生效） |

### Cursor Skills（按需触发的工作流）

| Skill | 触发场景 |
|-------|---------|
| `generate-page` | 生成四层架构页面脚手架 |
| `add-api-module` | 新建 API 服务模块 |
| `add-zustand-store` | 新建 Zustand 全局 Store |
| `add-route` | 注册新路由 + 创建页面入口 |

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
