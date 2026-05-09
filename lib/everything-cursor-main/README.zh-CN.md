# Everything Cursor - 中文说明

**生产级 Cursor AI 配置集合 — 规则、技能、智能体、命令、钩子和 MCP 配置**

一套完整的、可复用的配置模板，将专业软件工程实践注入 Cursor IDE 的 AI 辅助开发流程。

基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 改编并深度优化。

---

## 架构总览

```
everything-cursor/
├── .cursor/
│   ├── rules/         8 条规则    强制约束（安全、代码风格、测试、Git、自动路由）
│   ├── agents/       10 个智能体  具备思维链推理的专项 AI 角色 + 编排器
│   ├── skills/        5 项技能    深度领域知识注入
│   ├── commands/      8 个命令    轻量级 Slash 命令触发器
│   ├── hooks/         4 项检查    质量门禁定义
│   ├── mcp-configs/   2 套预设    外部工具集成模板
│   └── mcp.json                  默认 MCP 配置
├── init.ps1                      一键部署脚本（Windows PowerShell）
├── init.sh                       一键部署脚本（macOS / Linux）
└── README.md
```

### 设计原则

1. **分层上下文加载** — 5 条规则始终加载（security、coding-style、git-workflow、workflow、auto-routing）。测试、性能、设计模式规则根据文件类型按需激活，节省约 40% Token 开销。
2. **职责分离** — Agents = 深度角色扮演 + 推理链。Commands = 轻量触发入口。Skills = 领域知识库。Rules = 强制底线。
3. **专业 Prompt 工程** — 所有 Agent 均包含：身份设定、思维过程（CoT）、约束条件、输出格式约束、退出条件。
4. **生产可用** — Hooks 提供真实的集成方案（husky + lint-staged），而非仅停留在概念层面。

---

## 快速安装

### 一键完整安装

```bash
git clone https://github.com/jy315189/everything-cursor.git
cd everything-cursor

# Windows PowerShell — 交互式菜单
.\init.ps1

# macOS/Linux — 交互式菜单
chmod +x init.sh && ./init.sh
```

脚本会显示交互式菜单：

```
[1] Global Install    — 全局安装 Rules + Skills（所有项目生效）
[2] Project Init      — 项目初始化 Agents + Commands（当前项目）
[3] Full Setup        — 完整安装（全局 + 当前项目）
[4] Check Status      — 查看安装状态
```

### 命令行模式（跳过交互）

```bash
# Windows PowerShell
.\init.ps1 -Global              # 全局安装 Rules + Skills
.\init.ps1 -Project             # 当前项目初始化 Agents + Commands
.\init.ps1 -All                 # 完整安装
.\init.ps1 -All -Force          # 完整安装，覆盖已有配置
.\init.ps1 -Status              # 查看安装状态

# macOS/Linux
./init.sh --global
./init.sh --project
./init.sh --all
./init.sh --all --force
./init.sh --status
```

### 新项目快速初始化

全局安装完成后，在任何新项目中运行一条命令即可启用 Agents：

```powershell
# Windows — 在新项目根目录下执行
& "C:\path\to\everything-cursor\init.ps1" -Project
```

```bash
# macOS/Linux — 在新项目根目录下执行
/path/to/everything-cursor/init.sh --project
```

> **小技巧**：将 everything-cursor 目录加入系统 PATH，或创建别名（alias），可以更快速地初始化新项目。

> **为什么需要逐项目安装？** Cursor 的 Agents 和 Commands **仅支持项目级别**，不从全局 `~/.cursor/` 读取。Rules 和 Skills 支持全局。

### 安装位置说明

| 模块 | 安装位置 | 原因 |
|------|---------|------|
| Rules | **全局** `~/.cursor/rules/` | 所有项目自动生效 |
| Skills | **全局** `~/.cursor/skills/` | 所有项目可通过 @skills/ 引用 |
| Agents | **项目级** `.cursor/agents/` | Cursor 仅从项目目录读取 Agent |
| Commands | **项目级** `.cursor/commands/` | Cursor 仅从项目目录读取命令 |
| Hooks | **项目级** `.cursor/hooks/` | 项目专属质量门禁 |
| MCP | **项目级** `.cursor/mcp.json` | 项目专属工具集成 |

---

## 六大模块详解

### 1. Rules（规则）— 强制约束

使用 Cursor 的 `.mdc` 格式，带 YAML frontmatter 控制加载策略。

| 规则 | 加载策略 | 作用 |
|------|---------|------|
| `security.mdc` | **始终加载** | 禁止硬编码密钥、强制输入验证、防注入 |
| `coding-style.mdc` | **始终加载** | 不可变性、文件 ≤800 行、函数 ≤50 行、禁止 any |
| `git-workflow.mdc` | **始终加载** | Conventional Commits、PR 流程 |
| `workflow.mdc` | **始终加载** | 标准开发流程（规划 → TDD → 审查 → PR） |
| `auto-routing.mdc` | **始终加载** | 自动任务识别 — 根据用户请求自动路由到对应的 Agent 工作流 |
| `testing.mdc` | **按文件激活** | TDD 流程、覆盖率目标 — 仅在 `*.test.*`、`*.spec.*` 文件中加载 |
| `performance.mdc` | **按文件激活** | 性能优化规则 — 仅在缓存/查询/加载器文件中加载 |
| `patterns.mdc` | **按文件激活** | 设计模式 — 仅在 services/api/repositories 目录中加载 |

> **Token 节省**：3 条规则改为按需加载后，非测试、非 API 场景下上下文开销减少约 40%。

---

### 2. Agents（智能体）— 专项 AI 角色

每个 Agent 都经过专业 Prompt 工程设计，包含：

- **身份设定**：明确的角色和目标
- **思维过程**：Chain-of-Thought 推理引导，确保"先想后做"
- **约束条件**：明确禁止的行为和退出条件
- **输出格式**：严格的结构化模板，确保输出可预测
- **升级机制**：知道何时应请求人类介入

| 智能体 | 角色 | 核心能力 |
|--------|------|---------|
| `orchestrator` | **AI 项目经理** | **自动分析任务类型，调度专项 Agent，协调多阶段工作流** |
| `planner` | 任务规划师 | 需求分析、任务分解、风险评估、依赖映射 |
| `architect` | 系统架构师 | 多方案对比、技术选型、权衡文档化 |
| `tdd-guide` | TDD 教练 | 逐步引导 RED → GREEN → REFACTOR 循环 |
| `code-reviewer` | 代码审查员 | 按严重级别分类、每个问题附带修复建议 |
| `security-reviewer` | 安全工程师 | OWASP Top 10 检查、攻击场景分析、修复方案 |
| `build-error-resolver` | 构建专家 | 系统化诊断而非猜测，分类定位根因 |
| `e2e-runner` | E2E 测试专家 | Playwright 测试生成，内置反脆弱性模式 |
| `refactor-cleaner` | 清理专家 | 安全验证后才删除，小批量逐步清理 |
| `doc-updater` | 文档专家 | 代码变更后同步更新 JSDoc/README/CHANGELOG |

#### Orchestrator — 自动工作流编排

`orchestrator` 是一个 AI 项目经理。它分析你的请求，自动选择合适的 Agent 组合，按最优顺序执行多阶段工作流：

| 你的请求 | Orchestrator 自动执行 |
|---------|---------------------|
| "帮我加一个支付功能" | Planner → Architect → TDD Guide → Code Reviewer → Doc Updater |
| "这个接口有 bug" | TDD（复现）→ 修复 → Code Reviewer |
| "构建失败了，报 TS2339" | Build Error Resolver → 修复 → 验证构建 |
| "检查这个 API 的安全性" | Security Reviewer → 修复漏洞 → Code Reviewer |
| "清理废代码" | Refactor Cleaner → Code Reviewer |

**使用方式**：复杂多步骤任务用 `@orchestrator`。简单任务直接正常说话即可 — `auto-routing` 规则会自动识别并匹配工作流。

---

### 3. Skills（技能）— 深度领域知识

技能提供的不是 AI 已知的通用建议，而是**深度决策框架、生产级代码模式和反模式**。

| 技能 | 内容深度 |
|------|---------|
| `backend-patterns` | 分层架构（Handler→Service→Repository）、API 设计、缓存策略（多级缓存）、错误处理层次、RBAC 权限模型、事件驱动模式 |
| `coding-standards` | 不可变性规范、命名约定体系、TypeScript 严格模式（零 any 策略）、Result 类型模式、嵌套深度控制、导入组织规则 |
| `frontend-patterns` | Server/Client 组件决策树、状态管理选择框架、TanStack Query 模式、虚拟化长列表、表单验证模式、无障碍访问清单 |
| `security-review` | OWASP Top 10 速查、多层输入验证、文件上传安全、密码处理规范、JWT 安全实践、限流实现、安全响应头 |
| `tdd-workflow` | 完整 TDD 循环（含代码示例）、测试金字塔策略、Mock 工厂模式、反模式清单、Bug 修复 TDD 协议 |

---

### 4. Commands（命令）— 轻量触发入口

命令是简洁的使用说明，告诉你"什么时候用"和"会发生什么"，然后委派给对应的 Agent 执行。

| 命令 | 场景 | 委派给 |
|------|------|--------|
| `/tdd` | 用 TDD 实现功能 | `@agents/tdd-guide` |
| `/plan` | 创建实现计划 | `@agents/planner` |
| `/code-review` | 代码质量审查 | `@agents/code-reviewer` |
| `/security-audit` | 安全漏洞扫描 | `@agents/security-reviewer` |
| `/build-fix` | 修复构建错误 | `@agents/build-error-resolver` |
| `/e2e` | 生成 E2E 测试 | `@agents/e2e-runner` |
| `/refactor-clean` | 清理死代码 | `@agents/refactor-cleaner` |
| `/doc-sync` | 同步文档 | `@agents/doc-updater` |

---

### 5. Hooks（钩子）— 质量门禁

定义质量检查规则，配合 husky + lint-staged 实现真正的自动化执行。

| 检查项 | 严重级别 | 检测内容 |
|--------|---------|---------|
| `no-console-log` | Warning | 源码中的 `console.log` |
| `no-hardcoded-secrets` | Error | 代码中硬编码的 API Key / 密码 / Token |
| `no-ts-ignore` | Error | 隐藏类型错误的 `@ts-ignore` |
| `no-any-type` | Warning | 显式的 `any` 类型标注 |

> 详见 `hooks/README.md` 了解 husky + lint-staged 的实际集成步骤。

---

### 6. MCP Configs（工具集成）

| 预设 | 包含服务 | 适用场景 |
|------|---------|---------|
| `minimal.json` | GitHub、Context7 | 轻量开发 |
| `full-stack.json` | GitHub、Memory、Context7、Supabase、Vercel、Playwright、Filesystem | 全栈开发 |

> **提示**：建议每个项目启用 ≤10 个 MCP 服务，过多会挤占上下文窗口。

---

## 自定义配置

这些配置是起点，根据项目需要调整：

| 调整内容 | 文件位置 | 示例 |
|---------|---------|------|
| 测试覆盖率要求 | `rules/testing.mdc` | 将 `≥ 80%` 改为你的目标 |
| 文件大小限制 | `rules/coding-style.mdc` | 将 `≤ 800 lines` 改为你的限制 |
| 规则加载策略 | 任何 `.mdc` 的 frontmatter | 修改 `alwaysApply` / `globs` |
| 增加 Commit 类型 | `rules/git-workflow.mdc` | 添加 `perf:`、`i18n:` 等 |
| MCP 服务 | `mcp.json` | 启用/禁用特定服务 |

---

## 适用范围

| 项目类型 | 适用性 | 说明 |
|---------|--------|------|
| TypeScript / Next.js / React | 完全适用 | 所有模块直接可用 |
| Node.js 后端 | 完全适用 | 后端模式和安全规则高度匹配 |
| Python / Go / 其他语言 | 规则和流程适用 | 代码示例需替换为对应语言 |

---

## 项目来源

基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 改编：

- 原项目作者：[@affaanmustafa](https://x.com/affaanmustafa)
- Anthropic x Forum Ventures 黑客松冠军
- 25.9k+ GitHub Stars

---

## 许可证

MIT — 自由使用、修改，欢迎贡献。
