# 工程化配置与开发约定

> 本文档梳理项目从 0 到 1 需要建立的**工程化配置**和**开发约定**。  
> 技术栈：React 19 + TypeScript / Vite + pnpm / Ant Design / Tailwind CSS v4 + Less (CSS Modules) / React Router DOM v6 / Zustand / Axios / oxlint + oxfmt / vite-plugin-svgr

---

## 目录

- [1. 项目初始化](#1-项目初始化)
- [2. 目录结构](#2-目录结构)
- [3. TypeScript 配置](#3-typescript-配置)
- [4. Vite 配置](#4-vite-配置)
- [5. 样式方案](#5-样式方案)
- [6. 路由](#6-路由)
- [7. 状态管理](#7-状态管理)
- [8. 网络请求](#8-网络请求)
- [9. SVG 图标](#9-svg-图标)
- [10. 代码检查与格式化](#10-代码检查与格式化)
- [11. Git 约定](#11-git-约定)
- [12. 环境变量](#12-环境变量)
- [13. 测试](#13-测试)
- [14. 编码规范](#14-编码规范)
- [15. 页面开发规范（四层架构）](#15-页面开发规范四层架构)
- [16. 依赖管理](#16-依赖管理)
- [17. 构建与部署](#17-构建与部署)
- [附录 A：配置文件清单](#附录-a配置文件清单)

---

## 1. 项目初始化

### 1.1 Node 与包管理

| 项目 | 约定 |
|------|------|
| Node 版本 | ≥ 20 LTS，`.node-version` 或 `.nvmrc` 锁定 |
| 包管理器 | pnpm ≥ 9，`package.json` 中配置 `"packageManager"` 字段 |
| 锁文件 | 只允许 `pnpm-lock.yaml`，`.npmrc` 中设置 `engine-strict=true` |

```jsonc
// package.json (片段)
{
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

```ini
# .npmrc
engine-strict=true
auto-install-peers=true
shamefully-hoist=false
```

### 1.2 项目脚手架

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
```

---

## 2. 目录结构

```
src/
├── assets/                  # 静态资源（图片、字体等）
│   └── icons/               # SVG 图标（通过 svgr 作为组件使用）
├── components/              # 全局通用组件（跨页面复用）
│   ├── Layout/              # 布局组件
│   └── ...
├── hooks/                   # 全局通用 Hooks
├── pages/                   # 页面（按四层架构组织）
│   └── <PageName>/
│       ├── index.tsx
│       ├── types.ts
│       ├── components/
│       └── hooks/
├── router/                  # 路由配置
│   ├── index.tsx            # 路由定义
│   ├── routes.tsx           # 路由表
│   └── guards.tsx           # 路由守卫（可选）
├── services/                # API 请求层
│   ├── request.ts           # Axios 实例与拦截器
│   └── modules/             # 按业务域拆分的 API 模块
│       ├── user.ts
│       └── ...
├── stores/                  # Zustand 全局 Store
│   ├── useAuthStore.ts
│   └── ...
├── styles/                  # 全局样式
│   ├── index.css            # Tailwind 入口 + 全局 CSS 变量
│   ├── antd-theme.ts        # Ant Design 主题 token 配置
│   └── variables.less       # Less 全局变量（如需）
├── types/                   # 全局类型定义
│   ├── api.d.ts             # API 通用响应类型
│   ├── global.d.ts          # 全局类型扩展
│   └── vite-env.d.ts        # Vite 环境类型
├── utils/                   # 工具函数
│   ├── format.ts
│   ├── storage.ts
│   └── ...
├── constants/               # 全局常量
├── App.tsx                  # 根组件（挂载路由、全局 Provider）
├── main.tsx                 # 入口文件
└── vite-env.d.ts
```

### 2.1 目录职责边界

| 目录 | 放什么 | 不放什么 |
|------|--------|----------|
| `components/` | 跨页面复用的通用组件 | 只在单页面使用的组件（放页面目录下） |
| `hooks/` | 跨页面复用的通用 Hook | 页面级业务 Hook（放页面目录下） |
| `stores/` | 跨页面共享的全局状态 | 页面内部状态（用页面级 Hook 或 useState） |
| `services/modules/` | API 调用函数 | 业务逻辑（放 Hook 中） |
| `utils/` | 纯函数工具 | 含副作用的逻辑（放 Hook 或 services 中） |

---

## 3. TypeScript 配置

### 3.1 tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",

    // 严格模式
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // 输出
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

### 3.2 类型约定

| 约定 | 说明 |
|------|------|
| 优先使用 `type` | 接口继承 / 声明合并场景才用 `interface` |
| 禁止 `any` | 必须使用 `unknown` + 类型收窄；第三方库类型问题用 `as` 并加注释 |
| 组件 Props 用 `type` 定义 | 与组件同文件，命名为 `<ComponentName>Props`，需 export |
| API 响应类型 | 统一放在 `types/api.d.ts` 或对应的 `services/modules/` 中 |
| 枚举 | 优先用 `const` 对象 + `as const`，而非 `enum`（减少运行时代码） |

```typescript
// 推荐：const 对象代替 enum
const OrderStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

---

## 4. Vite 配置

### 4.1 vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { fill: "currentColor" },
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName:
        mode === "production"
          ? "[hash:base64:8]"
          : "[name]__[local]__[hash:base64:5]",
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "@/styles/variables.less";',
      },
    },
  },

  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },

  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd"],
        },
      },
    },
  },
}));
```

### 4.2 关键插件

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-react` | React Fast Refresh + JSX 转换 |
| `vite-plugin-svgr` | 将 SVG 文件作为 React 组件导入 |

---

## 5. 样式方案

项目采用 **Tailwind CSS v4 + Less (CSS Modules)** 双轨样式体系，配合 Ant Design 主题定制。

### 5.1 分工原则

| 场景 | 使用方案 | 示例 |
|------|---------|------|
| 布局、间距、flex/grid、响应式 | Tailwind CSS | `className="flex items-center gap-4 px-6"` |
| Ant Design 组件主题 | ConfigProvider theme token | `token: { colorPrimary: '#1677ff' }` |
| Ant Design 组件深度样式覆盖 | Less CSS Modules | `styles.customTable` |
| 复杂动画、伪元素、复杂选择器 | Less CSS Modules | `.card:hover::after { ... }` |
| 全局 CSS 变量 | `src/styles/index.css` | `--color-brand: #1677ff` |

### 5.2 Tailwind CSS v4

Tailwind v4 使用 CSS-first 配置方式，不再需要 `tailwind.config.js`。

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  --color-brand: #1677ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
```

### 5.3 CSS Modules 约定

| 约定 | 说明 |
|------|------|
| 文件命名 | `<ComponentName>.module.less` |
| 类名命名 | camelCase（由 Vite `localsConvention: 'camelCaseOnly'` 自动转换） |
| 使用方式 | `import styles from './MyComponent.module.less'` |
| 全局穿透 | `:global(.ant-xxx)` 覆盖 Ant Design 样式 |

```less
// OrderTable.module.less
.tableWrapper {
  :global(.ant-table-thead > tr > th) {
    background: var(--color-brand);
    color: #fff;
  }
}
```

```tsx
import styles from "./OrderTable.module.less";

function OrderTable() {
  return <div className={styles.tableWrapper}>...</div>;
}
```

### 5.4 Tailwind + CSS Modules 混合使用

```tsx
import styles from "./Card.module.less";
import clsx from "clsx";

function Card({ active }: { active: boolean }) {
  return (
    <div className={clsx("rounded-lg p-4 shadow-sm", styles.card, active && styles.cardActive)}>
      ...
    </div>
  );
}
```

> 安装 `clsx` 用于组合类名：`pnpm add clsx`

### 5.5 Ant Design 主题

```tsx
// src/styles/antd-theme.ts
import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Table: {
      headerBg: "#fafafa",
    },
  },
};
```

```tsx
// App.tsx
import { ConfigProvider } from "antd";
import { antdTheme } from "@/styles/antd-theme";

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      {/* ... */}
    </ConfigProvider>
  );
}
```

### 5.6 禁止事项

- **禁止**在组件中使用内联 `style={{}}`（除非是动态计算值，如 `width` 百分比）
- **禁止**使用 `!important`（通过提高选择器权重或使用 CSS Modules 的 `:global` 解决）
- **禁止**在 Tailwind 中使用 `@apply` 抽取大段样式（如果需要抽取，说明应该用 CSS Modules）

---

## 6. 路由

### 6.1 路由配置方式

使用 React Router DOM v6 的 Data Router（`createBrowserRouter`）模式。

```tsx
// src/router/routes.tsx
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <UserManagement /> },
      // ...
    ],
  },
  { path: "*", element: <NotFound /> },
];
```

```tsx
// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { Spin } from "antd";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

export function AppRouter() {
  return (
    <Suspense fallback={<Spin size="large" className="flex h-screen items-center justify-center" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

### 6.2 路由约定

| 约定 | 说明 |
|------|------|
| 路由路径 | kebab-case（`/api-dashboard`） |
| 懒加载 | 所有页面组件使用 `React.lazy()` + `Suspense` |
| 页面默认导出 | 页面入口文件 `index.tsx` 使用**命名导出 + 默认导出**双导出 |
| 嵌套路由 | 布局组件使用 `<Outlet />` 渲染子路由 |
| 路由守卫 | 通过 Layout wrapper 或 `loader` 实现鉴权 |

```tsx
// pages/Dashboard/index.tsx
export function DashboardPage() { /* ... */ }
export default DashboardPage;
```

### 6.3 路由参数与搜索参数

```typescript
// 路由参数：用于资源标识
// /users/:id → useParams<{ id: string }>()

// 搜索参数：用于筛选/分页等可选状态
// /users?page=1&status=active → useSearchParams()
```

**何时用路由参数 vs 组件 state**：

| 状态类型 | 存储位置 | 示例 |
|---------|---------|------|
| 页面标识、资源 ID | 路由参数 | `/orders/123` |
| 筛选条件、分页（需要可分享 URL） | searchParams | `?page=2&status=active` |
| 临时 UI 状态（弹窗开关、选中态） | 组件 state | `useState` / `useRef` |
| 跨页面持久数据（用户信息、权限） | Zustand store | `useAuthStore` |

---

## 7. 状态管理

### 7.1 分层原则

```
┌────────────────────────────────────────────┐
│  Zustand Store — 跨页面共享的全局状态        │
│  · 用户认证信息、权限                       │
│  · 全局配置（主题、语言）                    │
│  · 全局通知/消息                            │
├────────────────────────────────────────────┤
│  页面级 Hooks — 页面内业务状态               │
│  · API 数据 + CRUD 操作                     │
│  · 页面级 loading / error                   │
│  · 跨区域共享状态（由页面入口管理）           │
├────────────────────────────────────────────┤
│  组件 State — 区域/组件内部 UI 状态          │
│  · 表单输入、搜索词                         │
│  · 弹窗/折叠/hover 等纯 UI 状态             │
│  · 排序、分页等局部交互                      │
└────────────────────────────────────────────┘
```

### 7.2 Zustand 约定

| 约定 | 说明 |
|------|------|
| 文件命名 | `use<Domain>Store.ts` |
| 一个 store 一个文件 | 按业务域拆分，不搞一个巨大的 root store |
| 异步操作 | store 中只存状态和同步 action，异步逻辑放业务 Hook |
| 持久化 | 需要持久化的用 `persist` 中间件，key 带版本号 |
| 选择器 | 使用 selector 细粒度订阅，避免整个 store 变化触发重渲染 |

```typescript
// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: "auth-v1" },
  ),
);
```

```typescript
// 使用 selector 精确订阅
const token = useAuthStore((s) => s.token);
const user = useAuthStore((s) => s.user);

// 禁止：整体订阅
// const { token, user, setAuth } = useAuthStore();
```

### 7.3 不使用 Zustand 的场景

- 页面内部状态 → 页面级 Hook + useState
- 服务端数据缓存 → 业务 Hook 内管理（后续可引入 React Query）
- 表单状态 → 区域组件内 useState 或 Ant Design Form

---

## 8. 网络请求

### 8.1 Axios 实例

```typescript
// src/services/request.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { message } from "antd";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    if (data.code !== 0) {
      message.error(data.message || "请求失败");
      return Promise.reject(new Error(data.message));
    }
    return data.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    message.error(error.message || "网络异常");
    return Promise.reject(error);
  },
);

export { request };
```

### 8.2 API 模块

```typescript
// src/services/modules/user.ts
import { request } from "../request";

export type UserListParams = {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
};

export type UserListResult = {
  list: User[];
  total: number;
};

export const userApi = {
  getList: (params: UserListParams) =>
    request.get<UserListResult>("/users", { params }),

  getById: (id: string) =>
    request.get<User>(`/users/${id}`),

  create: (data: Omit<User, "id" | "createdAt">) =>
    request.post<User>("/users", data),

  update: (id: string, data: Partial<User>) =>
    request.patch<User>(`/users/${id}`, data),

  delete: (id: string) =>
    request.delete(`/users/${id}`),
};
```

### 8.3 API 通用响应类型

```typescript
// src/types/api.d.ts
type ApiResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

type PaginatedResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

### 8.4 请求约定

| 约定 | 说明 |
|------|------|
| 统一走 `request` 实例 | 禁止直接 `import axios` 后手动调用 |
| API 函数按模块组织 | `services/modules/<domain>.ts`，导出对象形式 `xxxApi` |
| 请求参数和响应都有类型 | API 函数必须标注入参和返回类型 |
| 错误统一在拦截器处理 | 业务 Hook 中 `catch` 只处理特殊逻辑（乐观更新回滚等） |
| 避免重复请求 | 业务 Hook 中管理 loading 状态，组件层 disable 按钮 |

---

## 9. SVG 图标

### 9.1 使用方式

通过 `vite-plugin-svgr` 将 SVG 作为 React 组件导入。

```tsx
import LogoIcon from "@/assets/icons/logo.svg?react";

function Header() {
  return <LogoIcon className="h-6 w-6 text-brand" />;
}
```

### 9.2 图标管理约定

| 约定 | 说明 |
|------|------|
| 存放位置 | `src/assets/icons/` |
| 命名 | kebab-case：`arrow-left.svg`、`user-avatar.svg` |
| SVG 规范 | 去除固定 `fill`/`stroke` 颜色，使用 `currentColor` 以支持 CSS 着色 |
| 导入后缀 | 必须使用 `?react` 后缀导入为组件 |
| Ant Design 图标 | 优先使用 `@ant-design/icons`，自定义图标才放 `assets/icons/` |

### 9.3 类型声明

```typescript
// src/types/global.d.ts
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const component: FC<SVGProps<SVGSVGElement>>;
  export default component;
}
```

---

## 10. 代码检查与格式化

### 10.1 工具选型

| 工具 | 用途 | 配置文件 |
|------|------|---------|
| oxlint | 代码检查（Lint） | `oxlintrc.json` |
| oxfmt | 代码格式化（Format） | `oxfmt.json` 或命令行参数 |

> oxlint 和 oxfmt 是基于 Rust 的高性能工具，替代 ESLint + Prettier。

### 10.2 oxlint 配置

```jsonc
// oxlintrc.json
{
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error"
  },
  "ignorePatterns": ["dist", "node_modules", "*.config.*"]
}
```

### 10.3 package.json scripts

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint src/",
    "format": "oxfmt --write src/",
    "format:check": "oxfmt --check src/",
    "type-check": "tsc --noEmit"
  }
}
```

### 10.4 编辑器集成

- 统一使用 `.editorconfig`
- VS Code / Cursor 推荐扩展放在 `.vscode/extensions.json`
- 保存时自动格式化（`.vscode/settings.json`）

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

```jsonc
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": null,
  "[typescript]": {
    "editor.defaultFormatter": "oxc.oxc-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "oxc.oxc-vscode"
  }
}
```

---

## 11. Git 约定

### 11.1 分支策略

| 分支 | 用途 | 保护规则 |
|------|------|---------|
| `main` | 生产分支 | 禁止直推，只接受 PR 合并 |
| `develop` | 开发主干（可选，小团队可省略） | 禁止直推 |
| `feature/<name>` | 功能开发 | 从 `main` (或 `develop`) 创建 |
| `fix/<name>` | Bug 修复 | 从 `main` 创建 |
| `chore/<name>` | 工程化/配置类改动 | 从 `main` 创建 |

### 11.2 Commit Message 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[可选正文]

[可选脚注]
```

**type 枚举**：

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变功能和接口） |
| `style` | 代码格式/样式（不影响逻辑） |
| `perf` | 性能优化 |
| `chore` | 构建/工具/依赖等工程化改动 |
| `docs` | 文档 |
| `test` | 测试 |
| `ci` | CI/CD 配置 |

**示例**：

```
feat(user): add user list page with search and filter

- Implement four-layer architecture for UserManagement page
- Add useUsers hook with pagination support
- Add UserListPanel and UserDetailPanel components
```

### 11.3 .gitignore

```gitignore
node_modules/
dist/
*.local
.env.local
.env.*.local
.DS_Store
*.log
```

### 11.4 Git Hooks（可选）

如需 Git Hooks，推荐 `simple-git-hooks` + `lint-staged`：

```jsonc
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "oxlint",
      "oxfmt --write"
    ]
  }
}
```

---

## 12. 环境变量

### 12.1 Vite 环境变量

| 文件 | 用途 | Git 跟踪 |
|------|------|---------|
| `.env` | 所有环境共享的默认值 | 是 |
| `.env.development` | 开发环境 | 是 |
| `.env.production` | 生产环境 | 是 |
| `.env.local` | 本地覆盖（不提交） | 否 |

### 12.2 变量命名

所有前端可访问的环境变量必须以 `VITE_` 开头：

```ini
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production
VITE_API_BASE_URL=/api
```

### 12.3 类型安全

```typescript
// src/types/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 13. 测试

### 13.1 工具选型

| 工具 | 用途 |
|------|------|
| Vitest | 单元测试 / 集成测试 |
| @testing-library/react | 组件测试 |
| MSW (Mock Service Worker) | API Mock |
| Playwright（可选） | E2E 测试 |

### 13.2 测试文件位置

```
src/pages/UserManagement/
├── hooks/
│   ├── useUsers.ts
│   └── __tests__/
│       └── useUsers.test.ts     # Hook 单元测试
├── components/
│   ├── UserListPanel.tsx
│   └── __tests__/
│       └── UserListPanel.test.tsx
```

**约定**：测试文件放在对应模块的 `__tests__/` 目录下，文件名 `<被测文件>.test.ts(x)`。

### 13.3 测试优先级

按投入产出比排序：

1. **业务 Hook 单元测试**（必需）— 逻辑集中，测试价值最高
2. **工具函数单元测试**（必需）— 纯函数，最容易测
3. **区域组件集成测试**（推荐）— 验证交互流程
4. **纯展示组件快照测试**（可选）— 防止 UI 意外变更
5. **E2E 测试**（核心流程）— 关键业务路径覆盖

### 13.4 vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.*", "src/types/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

---

## 14. 编码规范

### 14.1 命名规范

| 类型 | 风格 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserListPanel.tsx` |
| 非组件文件 | camelCase | `useUsers.ts`、`request.ts` |
| CSS Modules | `<Component>.module.less` | `UserTable.module.less` |
| 目录 | camelCase 或 PascalCase（页面名） | `hooks/`、`UserManagement/` |
| 组件名 | PascalCase | `function UserListPanel()` |
| Hook 名 | `use` + PascalCase | `function useUsers()` |
| 变量/函数 | camelCase | `const fetchUsers = ...` |
| 常量 | UPPER_SNAKE_CASE | `const API_BASE_URL = ...` |
| 类型/接口 | PascalCase | `type UserListParams = ...` |
| 事件回调 Props | `on` + 动词 | `onSelect`、`onFiltersChange` |
| 布尔 Props | `is`/`has`/`should` 前缀 | `isLoading`、`hasError` |

### 14.2 导入顺序

```typescript
// 1. React / 框架
import { useState, useCallback } from "react";

// 2. 第三方库
import { Table, Button } from "antd";
import { useParams } from "react-router-dom";

// 3. 项目内绝对路径 (@/ 开头)
import { request } from "@/services/request";
import { useAuthStore } from "@/stores/useAuthStore";

// 4. 页面内相对路径
import { useUsers } from "./hooks/useUsers";
import { UserCard } from "./components/UserCard";
import type { User } from "./types";
```

### 14.3 组件编写规范

```tsx
// 1. 导入
import { useState, useCallback } from "react";
import type { SomeType } from "./types";

// 2. Props 类型定义（export）
export type MyComponentProps = {
  items: SomeType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// 3. 组件（命名导出）
export function MyComponent({ items, selectedId, onSelect }: MyComponentProps) {
  // 3.1 Hooks 调用
  const [localState, setLocalState] = useState("");

  // 3.2 派生数据
  const filteredItems = items.filter(/* ... */);

  // 3.3 事件处理
  const handleClick = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  // 3.4 渲染
  return (
    <div>
      {filteredItems.map((item) => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 14.4 禁止事项

| 禁止 | 原因 | 替代方案 |
|------|------|---------|
| `export default` 匿名组件 | debug 困难、无法 tree-shake | 命名导出 + 页面文件额外 `export default` |
| `// @ts-ignore` | 隐藏类型错误 | 修复类型问题，万不得已用 `// @ts-expect-error` 并注释原因 |
| `as any` | 绕过类型检查 | 使用 `unknown` + 类型守卫 |
| `useEffect` 做数据获取（新代码） | 竞态风险、清理复杂 | 封装在业务 Hook 中统一管理 |
| 在组件中直接 `localStorage.setItem` | 副作用散落 | 封装到 `utils/storage.ts` 或 Zustand persist |
| 魔法数字 / 魔法字符串 | 可读性差 | 提取为命名常量 |

---

## 15. 页面开发规范（四层架构）

详见 `.cursor/rules/page-layering.rule.mdc`，此处仅做概要。

```
┌─────────────────────────────────────────────┐
│ 1. 页面入口 — 编排 + 跨区域状态              │
├──────────┬────────────────┬─────────────────┤
│ 2. 区域A │   2. 区域B     │   2. 区域C      │
│ ┌──────┐ │  ┌──────────┐ │  ┌────────────┐ │
│ │4.展示│ │  │ 4.展示   │ │  │  4.展示    │ │
│ └──────┘ │  └──────────┘ │  └────────────┘ │
├──────────┴────────────────┴─────────────────┤
│ 3. 业务 Hooks — API 调用 + 数据 + 规则       │
└─────────────────────────────────────────────┘
```

| 层 | 文件位置 | 核心职责 |
|---|---|---|
| 页面入口 | `pages/<Name>/index.tsx` | 编排组件、管理跨区域共享状态 |
| 区域组件 | `pages/<Name>/components/<Region>Panel.tsx` | 区域内部 UI 自治，通过 props 回调对外通信 |
| 业务 Hooks | `pages/<Name>/hooks/use<Domain>.ts` | API 调用、数据状态、业务计算，返回 state + actions |
| 纯展示组件 | `pages/<Name>/components/<Widget>View.tsx` | 只接收 props，不调用 API/Hook |

### 何时使用全局 Store vs 页面 Hook

| 数据特征 | 存储方式 |
|---------|---------|
| 跨页面共享（用户信息、token、全局配置） | Zustand Store |
| 单页面内的业务数据（列表、详情、筛选） | 页面级业务 Hook |
| 单组件内部的 UI 状态（折叠、hover） | 组件 useState |

---

## 16. 依赖管理

### 16.1 依赖分类

```jsonc
{
  "dependencies": {
    // 运行时依赖：React、Ant Design、Zustand 等
  },
  "devDependencies": {
    // 开发时依赖：Vite、TypeScript、oxlint、Vitest 等
  }
}
```

### 16.2 约定

| 约定 | 说明 |
|------|------|
| 锁定版本 | pnpm-lock.yaml 必须提交 |
| 审慎引入新依赖 | 引入前评估：包大小、维护活跃度、是否有更轻量替代 |
| 及时移除无用依赖 | 定期 `pnpm why <pkg>` 检查，`depcheck` 扫描 |
| 安全审计 | CI 中运行 `pnpm audit` |

### 16.3 核心依赖版本（参考）

| 包 | 最低版本 |
|----|---------|
| react | 19.x |
| react-dom | 19.x |
| typescript | 5.8+ |
| vite | 6.x |
| @vitejs/plugin-react | 4.x |
| antd | 5.x |
| @ant-design/icons | 5.x |
| tailwindcss | 4.x |
| react-router-dom | 6.x |
| zustand | 5.x |
| axios | 1.x |
| clsx | 2.x |
| less | 4.x |
| vite-plugin-svgr | 5.x |
| oxlint | 1.x |

---

## 17. 构建与部署

### 17.1 构建命令

```bash
pnpm build
```

产出目录：`dist/`

### 17.2 构建优化

| 优化项 | 配置方式 |
|--------|---------|
| 代码分割 | Vite `manualChunks` 分离 vendor/antd |
| 懒加载 | 路由级 `React.lazy()` |
| Tree-shaking | Ant Design v5 默认支持，无需额外配置 |
| 资源压缩 | Vite 生产模式默认 minify |
| gzip/brotli | 通过 `vite-plugin-compression` 或 Nginx 配置 |

### 17.3 CI/CD Pipeline（建议）

```
push → lint + type-check + test → build → deploy
```

```yaml
# 伪代码示意
steps:
  - pnpm install --frozen-lockfile
  - pnpm type-check
  - pnpm lint
  - pnpm test --run
  - pnpm build
  - deploy dist/
```

---

## 附录 A：配置文件清单

项目根目录下需要创建/维护的配置文件一览：

| 文件 | 用途 | 是否必需 |
|------|------|---------|
| `package.json` | 项目元信息、脚本、依赖 | 是 |
| `pnpm-lock.yaml` | 依赖锁文件 | 是 |
| `.npmrc` | pnpm/npm 配置 | 是 |
| `.node-version` | Node 版本锁定 | 是 |
| `tsconfig.json` | TypeScript 配置 | 是 |
| `vite.config.ts` | Vite 构建配置 | 是 |
| `oxlintrc.json` | oxlint 规则 | 是 |
| `.editorconfig` | 编辑器通用格式 | 是 |
| `.gitignore` | Git 忽略规则 | 是 |
| `.env` / `.env.*` | 环境变量 | 是 |
| `vitest.config.ts` | Vitest 测试配置 | 推荐 |
| `.vscode/settings.json` | 编辑器设置 | 推荐 |
| `.vscode/extensions.json` | 推荐扩展 | 推荐 |
