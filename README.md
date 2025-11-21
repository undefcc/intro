# 个人简介页面

基于 Next.js 13、TypeScript 和 Tailwind CSS 构建的现代化个人简介网站，集成了 AI 聊天助手、Markdown 渲染、主题切换等功能。

## ✨ 功能特色

### 核心功能
- 🎨 **主题切换** - 支持深色/浅色模式，自动适配系统偏好
- 🌐 **多语言支持** - 中英文切换
- 🤖 **AI 聊天助手** - 集成 Deepseek API，支持流式对话
- 📝 **Markdown 渲染** - 完整支持 GFM、表格、代码高亮、数学公式
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🎯 **3D 卡片效果** - 交互式项目展示
- 📊 **可视化图表** - 技术栈雷达图展示

### AI 聊天功能
- 流式响应，实时显示
- 完整的 Markdown 支持（包括表格、代码块）
- 代码语法高亮
- 一键复制代码
- 数学公式渲染（KaTeX）
- 聊天历史管理
- 中断生成功能

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/undefcc/intro.git
   cd intro
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件：
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local`，添加 API Key：
   ```env
   AI_302_API_KEY=your_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   在浏览器打开 [http://localhost:3000](http://localhost:3000)

## 📦 构建与部署

### 本地构建
```bash
npm run build
npm start
```

### Docker 部署

1. **构建镜像**
   ```bash
   docker build -t intro:latest -f script/Dockerfile .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 3000:3000 \
     --name intro \
     -e AI_302_API_KEY="your_api_key" \
     --restart unless-stopped \
     intro:latest
   ```

### GitHub Actions + Docker

项目配置了自动化部署流程：

1. **设置 GitHub Secrets**
   - `AI_302_API_KEY` - 302.AI API Key
   - `ALIYUN_DOCKER_USERNAME` - 阿里云容器镜像用户名
   - `ALIYUN_DOCKER_PASSWORD` - 阿里云容器镜像密码
   - （可选）`ECS_HOST`, `ECS_USERNAME`, `ECS_SSH_PRIVATE_KEY` - 用于自动部署到 ECS

2. **推送到 main 分支**
   
   GitHub Actions 会自动：
   - 构建 Next.js 应用
   - 打包 Docker 镜像
   - 推送到阿里云容器镜像仓库

3. **手动部署到服务器**
   ```bash
   docker pull your-registry/intro:latest
   docker run -d -p 3000:3000 \
     --name intro \
     -e AI_302_API_KEY="your_api_key" \
     --restart unless-stopped \
     your-registry/intro:latest
   ```

## 📁 项目结构

```
intro/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页
│   │   ├── layout.tsx            # 根布局
│   │   ├── globals.css           # 全局样式
│   │   ├── _components/          # 页面组件
│   │   │   ├── background.tsx
│   │   │   ├── capabilities.tsx
│   │   │   ├── tech-stack.tsx
│   │   │   └── ...
│   │   ├── api/
│   │   │   └── ai/
│   │   │       └── route.ts      # AI API 路由
│   │   └── miniapp/              # 小程序展示页
│   ├── components/
│   │   ├── ai/
│   │   │   └── chat-dialog.tsx   # AI 聊天对话框
│   │   ├── theme/                # 主题切换组件
│   │   ├── time-picker/          # 时间选择器
│   │   └── ui/                   # UI 组件库 (shadcn/ui)
│   │       └── shadcn-io/
│   │           └── ai/           # AI 相关 UI 组件
│   ├── data/
│   │   └── site-data.ts          # 站点数据配置
│   └── lib/
│       └── utils.ts              # 工具函数
├── content/
│   └── snippets/                 # 代码片段
├── public/
│   └── images/                   # 静态资源
├── script/
│   ├── Dockerfile                # Docker 配置
│   └── Jenkinsfile              # Jenkins 配置
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 配置
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🛠️ 技术栈

### 核心框架
- **Next.js 13** - React 服务端渲染框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS

### UI 组件
- **shadcn/ui** - 可复用的 UI 组件
- **Radix UI** - 无样式的可访问组件
- **Lucide React** - 图标库

### Markdown & 代码
- **react-markdown** - Markdown 渲染
- **remark-gfm** - GitHub Flavored Markdown
- **rehype-katex** - 数学公式支持
- **react-syntax-highlighter** - 代码高亮
- **Prism** - 语法高亮引擎

### AI 集成
- **302.AI** - AI API 服务
- **Deepseek** - 大语言模型

### 其他
- **next-themes** - 主题管理
- **Contentlayer** - 内容管理
- **Recharts** - 图表库
- **date-fns** - 日期处理

## 🔧 配置说明

### 修改个人信息

编辑 `src/data/site-data.ts`：

```typescript
export const siteData = {
  name: '你的名字',
  title: '你的职位',
  description: '你的简介',
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    // ...
  }
}
```

### 配置 AI API

支持以下 AI 服务提供商：
- 302.AI (默认)
- OpenAI
- Azure OpenAI
- 其他兼容 OpenAI API 的服务

修改 `src/app/api/ai/route.ts` 中的 API 端点和模型配置。

## 🌟 主要特性

### 流式 Markdown 渲染
- 实时流式显示 AI 回复
- 完整支持 GFM 表格、任务列表
- 自动处理不完整的 Markdown 语法
- 支持 HTML 标签（经过安全过滤）

### 代码高亮
- 支持 100+ 编程语言
- 深色/浅色主题自动切换
- 一键复制代码
- 显示行号（可选）

### 安全性
- API Key 通过环境变量管理
- HTML 内容经过 sanitize 处理
- 防止 XSS 攻击
- HTTPS 强制（生产环境）

## 📝 开发指南

### 添加新的 AI 模型

1. 修改 `src/app/api/ai/route.ts`
2. 更新 `model` 参数
3. 调整 prompt 模板（如需要）

### 自定义主题

编辑 `src/app/globals.css`，修改 CSS 变量：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

### 添加新页面

1. 在 `src/app/` 下创建新目录
2. 添加 `page.tsx` 文件
3. 配置路由和导航

## 🐛 故障排除

### AI 聊天无响应
- 检查 `.env.local` 中的 `AI_302_API_KEY` 是否正确
- 查看浏览器控制台和服务器日志
- 确认 API 配额是否充足

### 构建失败
```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

### Docker 部署问题
```bash
# 查看容器日志
docker logs intro

# 进入容器调试
docker exec -it intro sh
```

## 📄 License

ISC License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- **作者**: [cc](https://github.com/undefcc)
- **仓库**: [intro](https://github.com/undefcc/intro)
- **问题反馈**: [Issues](https://github.com/undefcc/intro/issues)

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [302.AI](https://302.ai/)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**