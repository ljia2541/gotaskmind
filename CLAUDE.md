# GoTaskMind - AI-Powered Project Management Platform

## 项目概述

GoTaskMind 是一个基于 AI 的智能项目管理平台，旨在帮助团队将想法转化为可执行的计划。该平台提供自然语言项目描述输入，AI 自动生成详细的任务分解、时间线和团队工作流程。

## 技术栈

### 核心框架
- **Next.js 15.2.4** - React 全栈框架，支持 App Router
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集

### 样式和 UI
- **Tailwind CSS 4.1.9** - 原子化 CSS 框架
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Lucide React** - 图标库
- **Geist** - 字体（Sans 和 Mono）

### 状态管理和表单
- **React Hook Form** - 高性能表单库
- **Zod** - TypeScript 优先的模式验证
- **@hookform/resolvers** - 表单验证解析器

### 分析和监控
- **@vercel/analytics** - 网站分析工具

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 后处理器
- **autoprefixer** - CSS 自动前缀

## 项目结构

```
D:\Trea\gotaskmind/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   │   ├── ai/           # AI 相关 API
│   │   │   └── generate/ # AI 任务生成
│   │   ├── auth/         # 认证相关 API
│   │   ├── tasks/        # 任务管理 API
│   │   └── analytics/    # 数据分析 API
│   ├── lib/              # 服务端库
│   │   ├── ai-service.ts # AI 服务
│   │   ├── auth-service.ts # 认证服务
│   │   └── language-service.ts # 语言服务
│   ├── hooks/            # 客户端 Hooks
│   │   └── use-auth.ts  # 认证 Hook
│   ├── components/       # 页面组件
│   │   └── auth-navigation.tsx # 认证导航
│   ├── tasks/            # 任务管理页面
│   ├── team/             # 团队管理页面
│   ├── analytics/        # 数据分析页面
│   ├── privacy/          # 隐私政策页面
│   ├── terms/            # 服务条款页面
│   ├── auth/             # 认证页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/           # React 组件
│   ├── ui/              # shadcn/ui 组件库（60+ 个组件）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ... (60+ UI 组件)
│   ├── decorative-elements.tsx  # 装饰性元素组件
│   ├── logo.tsx               # Logo 组件
│   └── theme-provider.tsx     # 主题提供者
├── lib/                  # 工具库
│   └── utils.ts         # 通用工具函数
├── types/               # TypeScript 类型定义
│   ├── task.ts         # 任务相关类型
│   ├── project.ts      # 项目相关类型
│   └── team.ts         # 团队相关类型
├── hooks/              # 自定义 React Hooks
│   ├── use-toast.ts    # Toast Hook
│   └── use-mobile.ts   # 移动端检测 Hook
├── public/             # 静态资源
├── styles/             # 样式文件
└── 配置文件...
```

## 核心功能

### 1. 项目主页 (`app/page.tsx`)
- **AI 驱动的项目规划演示**：展示自然语言输入转换为项目计划
- **功能特性展示**：智能任务分解、团队协作、智能洞察
- **定价方案**：免费版和专业版
- **客户评价**：展示不同行业团队的使用案例
- **响应式设计**：支持桌面端和移动端

### 2. 任务管理系统 (`app/tasks/page.tsx`)
- **任务 CRUD 操作**：创建、读取、更新、删除任务
- **任务分类**：工作 (Work)、个人 (Personal)、学习 (Learning)、其他 (Other)
- **优先级管理**：低 (Low)、中 (Medium)、高 (High)
- **状态跟踪**：待办 (Todo)、进行中 (In Progress)、已完成 (Completed)
- **搜索和过滤**：按关键词搜索，按状态筛选
- **排序功能**：按创建时间或截止日期排序
- **项目关联**：任务可关联到具体项目
- **团队成员分配**：支持任务分配给团队成员
- **本地存储**：使用 localStorage 持久化数据

### 3. 项目管理
- **项目 CRUD 操作**：创建、编辑、删除项目
- **项目状态管理**：规划中 (Planning)、活跃 (Active)、已完成 (Completed)、暂停 (On-hold)
- **项目颜色标识**：为每个项目设置独特的颜色
- **项目截止日期**：设置和跟踪项目截止日期
- **关联任务管理**：项目删除时自动清理关联任务

### 4. 团队管理 (`app/team/page.tsx`)
- **团队成员管理**：添加、编辑、删除团队成员
- **角色管理**：管理员 (Admin)、成员 (Member)、查看者 (Viewer)
- **成员状态跟踪**：活跃 (Active)、已邀请 (Invited)、非活跃 (Inactive)、已暂停 (Suspended)
- **项目成员分配**：管理项目成员角色和权限

### 5. 数据分析 (`app/analytics/page.tsx`)
- **任务统计**：任务完成率、分布统计
- **项目进度**：项目状态分布、进度跟踪
- **团队绩效**：成员工作效率分析
- **可视化图表**：使用图表展示数据趋势

### 6. AI 功能集成
- **智能任务生成**：基于项目描述自动生成任务列表
- **AI 服务集成**：使用 DeepSeek API 进行智能分析
- **多语言支持**：支持中英文项目描述
- **任务属性自动分配**：AI 自动判断任务分类和优先级

## 数据模型

### 任务类型 (`types/task.ts`)
```typescript
type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  category: 'work' | 'personal' | 'learning' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  projectId?: string;
  assigneeId?: string;
  assignedAt?: string;
  comments?: TaskComment[];
};
```

### 项目类型 (`types/project.ts`)
```typescript
type Project = {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  color?: string;
  keywords?: string[];
};
```

### 团队成员类型 (`types/team.ts`)
```typescript
type TeamMember = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: 'admin' | 'member' | 'viewer';
  status?: 'active' | 'invited' | 'inactive' | 'suspended';
  joinedAt?: string;
};
```

## UI 组件体系

### shadcn/ui 组件库
项目使用了完整的 shadcn/ui 组件库，包含 60+ 个高质量组件：
- **基础组件**：Button, Input, Card, Badge, Dialog
- **表单组件**：Form, Field, Select, Checkbox, Textarea
- **导航组件**：Tabs, Navigation Menu, Breadcrumb
- **反馈组件**：Alert, Toast, Skeleton, Progress
- **布局组件**：Separator, Scroll Area, Aspect Ratio
- **复合组件**：Command, Context Menu, Dropdown Menu
- **数据展示**：Table, Pagination, Chart
- **交互组件**：Slider, Switch, Calendar, Carousel

### 自定义组件
- **Logo**：统一的品牌标识组件
- **DecorativeElements**：页面装饰性元素
- **ThemeProvider**：主题切换提供者
- **AuthNavigation**：认证状态导航组件

## AI 服务架构

### AI 服务类 (`app/lib/ai-service.ts`)
- **DeepSeek API 集成**：使用 DeepSeek 聊天模型
- **任务分解生成**：将项目描述转换为详细任务列表
- **多语言支持**：自动识别并处理中英文输入
- **智能分析**：项目进度分析和建议生成

### API 端点 (`app/api/ai/generate/route.ts`)
- **RESTful API 设计**：标准的 POST 请求处理
- **错误处理**：完善的错误处理和响应机制
- **数据验证**：请求数据格式验证
- **安全考虑**：API 密钥服务端管理

## 认证系统

### 认证服务 (`app/lib/auth-service.ts`)
- **Google OAuth 集成**：支持 Google 账号登录
- **JWT 会话管理**：安全的用户会话处理
- **模拟登录**：开发环境下的模拟认证功能

### 认证 Hook (`app/hooks/use-auth.ts`)
- **认证状态管理**：全局认证状态
- **用户信息获取**：用户资料和权限管理
- **登录/登出操作**：认证操作封装

## 国际化支持

### 语言服务 (`app/lib/language-service.ts`)
- **多语言检测**：自动检测用户语言偏好
- **翻译系统**：界面文本翻译
- **动态语言切换**：支持实时语言切换
- **本地化存储**：用户语言偏好持久化

## 配置文件

### Next.js 配置 (`next.config.mjs`)
- 忽略构建时的 ESLint 错误
- 忽略构建时的 TypeScript 错误
- 禁用图片优化

### TypeScript 配置 (`tsconfig.json`)
- 严格模式启用
- 支持 ES6+ 语法
- 路径别名配置：`@/*` 指向项目根目录

### shadcn/ui 配置 (`components.json`)
- 样式主题：new-york
- 支持 RSC (React Server Components)
- Tailwind CSS 集成
- CSS 变量支持

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

## 特性亮点

### 1. AI 驱动的智能规划
- **自然语言处理**：支持中英文项目描述
- **智能任务分解**：AI 自动生成详细任务列表
- **属性自动分配**：智能判断任务分类和优先级
- **上下文理解**：基于项目类型生成相关任务

### 2. 完整的项目管理功能
- **项目生命周期管理**：从规划到完成的全程跟踪
- **任务依赖关系**：支持任务间的关联和依赖
- **进度可视化**：直观的进度展示和状态跟踪
- **团队协作**：成员角色管理和任务分配

### 3. 响应式设计
- **移动端优先**：适配各种屏幕尺寸
- **流畅交互**：优化的用户体验和动画效果
- **离线支持**：本地存储确保数据不丢失
- **性能优化**：代码分割和懒加载优化

### 4. 数据安全与隐私
- **API 密钥保护**：服务端管理敏感信息
- **数据本地存储**：用户数据本地化处理
- **权限控制**：基于角色的访问控制
- **隐私保护**：符合数据保护规范

## 部署注意事项

### 环境变量
- `DEEPSEEK_API_KEY`：DeepSeek API 密钥（必需）
- `NEXTAUTH_SECRET`：认证密钥（生产环境必需）
- `NEXTAUTH_URL`：认证服务 URL（生产环境必需）

### 构建优化
- Next.js 配置已优化构建过程
- 图像优化已禁用（适合静态部署）
- TypeScript 和 ESLint 错误在构建时被忽略

### 静态部署
项目可以部署到任何支持静态网站的平台上：
- Vercel（推荐）
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 扩展建议

### 1. 后端集成
- **数据库集成**：PostgreSQL 或 MongoDB
- **用户认证系统**：完整的用户注册和登录
- **团队协作功能**：实时协作和通知系统
- **API 集成**：第三方工具集成

### 2. 高级功能
- **甘特图视图**：时间线和依赖关系可视化
- **看板视图**：拖拽式任务管理
- **报表功能**：详细的项目报表和导出
- **自动化工作流**：规则驱动的任务自动化

### 3. 企业级特性
- **单点登录 (SSO)**：企业认证集成
- **权限管理**：细粒度权限控制
- **审计日志**：操作记录和合规性
- **数据备份**：自动备份和恢复

### 4. AI 功能增强
- **智能推荐**：基于历史数据的任务推荐
- **风险预测**：项目风险识别和预警
- **资源优化**：智能资源分配建议
- **自然语言查询**：语音输入和智能问答

## 代码规范

### 1. TypeScript
- 使用严格的 TypeScript 配置
- 为所有组件和函数添加类型注解
- 使用接口定义数据结构
- 遵循类型最佳实践

### 2. React 最佳实践
- 使用函数组件和 Hooks
- 遵循单一职责原则
- 合理使用 memo 和 useMemo 优化性能
- 保持组件的可读性和可维护性

### 3. 样式规范
- 使用 Tailwind CSS 类名
- 遵循响应式设计原则
- 保持一致的间距和颜色系统
- 使用 CSS 变量实现主题切换

### 4. 文件组织
- 按功能模块组织文件
- 使用清晰的命名约定
- 保持适当的文件大小
- 遵循项目目录结构规范

## 总结

GoTaskMind 是一个功能完整、设计精良的 AI 驱动项目管理平台。项目采用现代化的技术栈，具有良好的可扩展性和维护性。代码结构清晰，组件化程度高，适合进一步的开发和定制。

项目目前已实现了核心的 AI 任务生成、项目管理、团队协作和数据分析功能，可以作为 MVP（最小可行产品）进行市场验证。后续可以根据用户反馈和业务需求，逐步添加更多高级功能和企业级特性。