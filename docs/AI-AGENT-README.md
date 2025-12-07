# AI 个人智能体 - 使用指南

> 让 AI 代表你与访问者智能交流

## 🚀 快速开始（3 步）

### 1. 设置 API 密钥

```bash
# .env.local
AI_302_API_KEY=your_api_key_here
```

### 2. 自定义个人信息

编辑 `src/lib/ai-agent-config.ts`：

```typescript
export const AGENT_SYSTEM_PROMPT = `你是 [你的名字] 的个人 AI 智能体助手...

## 关于 [你的名字] 的基本信息

### 身份
- GitHub: https://github.com/[username]
- 博客: https://[your-blog]

### 技术栈
- 前端: React, Next.js...
- 后端: Node.js...

### 主要项目
1. **项目A** - 项目描述
2. **项目B** - 项目描述
...
`
```

### 3. 更新项目数据

编辑 `src/data/site-data.ts`：

```typescript
export const projects: ProjectItem[] = [
  {
    name: "项目名称",
    desc: "项目描述",
    link: "https://...",
    image: "...",
  },
]
```

启动测试：
```bash
npm run dev
```

## 💡 工作原理

### System Prompt（系统提示词）
定义 AI 的"人设"：
- 你是谁
- 你知道什么
- 如何回答

### Function Calling（函数调用）
AI 主动调用函数获取数据：
- `getProjects()` - 项目列表
- `getNotes()` - 博客笔记
- `getTools()` - 开发工具
- `searchContent(query)` - 搜索内容

### 工作流程
```
用户提问 → AI 判断需要数据 → 调用函数 → 获取结果 → 生成回答
```

## 📁 核心文件

```
src/
├── lib/ai-agent-config.ts      # AI 配置（修改这里）
├── app/api/ai/route.ts         # API 路由
├── components/ai/chat-dialog.tsx  # 对话界面
└── data/site-data.ts           # 网站数据
```

## 🎨 自定义建议

### 调整欢迎消息

`src/components/ai/chat-dialog.tsx`：

```typescript
const WELCOME_MESSAGE: Message = {
  content: `👋 你好！我是 [你的名字] 的 AI 助手...`
}

const EXAMPLE_QUESTIONS = [
  "你的问题1",
  "你的问题2",
]
```

### 添加新函数

在 `ai-agent-config.ts` 中：

```typescript
// 1. 定义函数
export const AGENT_FUNCTIONS = [
  {
    name: 'getSkills',
    description: '获取技能列表',
    parameters: { type: 'object', properties: {}, required: [] }
  }
]

// 2. 实现函数
export const functionImplementations = {
  getSkills: () => ({ skills: ['React', 'Node.js'] })
}
```

## 🐛 常见问题

**Q: 如何让 AI 更专业/友好？**  
A: 在 System Prompt 中添加：
```
回答时使用专业术语，展现技术深度。
// 或
用轻松幽默的语气回答，可以使用表情符号 😊
```

**Q: 响应太慢？**  
A: 限制历史消息长度（在 `chat-dialog.tsx`）：
```typescript
const historyMessages = messages.slice(-10) // 只保留最近 10 条
```

**Q: 如何防止滥用？**  
A: 添加速率限制或 IP 限流

## ✨ 测试你的智能体

访问 http://localhost:3000，点击机器人图标，尝试：
- "介绍一下你自己"
- "有哪些项目？"
- "擅长什么技术？"
- "推荐一些博客"

## 📚 进阶功能（可选）

- **RAG**：使用向量数据库存储文章
- **MCP**：标准化工具调用协议
- **多模态**：支持图片、代码等
- **用户反馈**：收集评价持续优化

---

**就这么简单！现在你有了一个专属的 AI 智能体** 🎉
