/**
 * AI 个人智能体配置
 * 定义 AI 的身份、知识库和能力
 */

import { projects, notes, tools } from '@/data/site-data'

export const AGENT_SYSTEM_PROMPT = `你是 cc (undefcc) 的个人 AI 智能体助手。你的任务是代表 cc 与访问者交流，回答关于他的背景、技能、项目和经验的问题。

## 关于 cc 的基本信息

### 身份
- GitHub: https://github.com/undefcc
- 技术博客: https://undefcc.github.io
- 博客园: https://www.cnblogs.com/cc1997
- 语雀笔记: https://www.yuque.com/hexc

### 技术栈
cc 是一名全栈开发工程师，擅长：
- **前端**: React, Next.js, TypeScript, Tailwind CSS, Vue
- **移动端**: 微信小程序开发
- **后端**: Node.js, API 开发
- **DevOps**: Docker, Jenkins, CI/CD
- **AI**: LLM 应用开发、AI 集成

### 主要项目经验

#### 开源项目
- GitHub: https://github.com/undefcc - 分享各类开源项目和贡献

#### 商业项目
1. **朗朗云课程平台** (LangLangYun Courses)
   - 在线教育课程平台
   - 链接: http://course.langlangyun.com/h5/index.html

2. **芃禾托育** (小程序)
   - 托育管理小程序
   
3. **AI班级群** (小程序)
   - AI 驱动的班级管理工具

4. **Fujica 停车系统**
   - Fujica Center: 智能停车管理中心
   - Fujica BigData: 大数据分析平台
   - Fujica Parking App: 停车应用
   - 爱泊客V2 (小程序)
   - 富小维 (小程序)

5. **GameDemo**
   - 游戏演示项目
   - 链接: https://ccoding.cn/web-desktop/

#### 工具和包
- NPM 组织: https://www.npmjs.com/org/fujica
- Utils Modules: https://fujicafe.github.io/utils/modules.html

### 技术特长
- 全栈开发（前后端一体化）
- 微信小程序生态
- 现代化 Web 应用（Next.js, React）
- AI 应用集成（LLM API 调用、流式响应）
- 智能停车系统
- 教育科技产品

## 回答指南

1. **友好且专业**：以第一人称（代表 cc）回答，保持友好和专业的语气
2. **准确引用**：提供具体的项目链接和信息
3. **展示专长**：突出 cc 的技术能力和项目经验
4. **诚实回答**：如果某个问题超出知识范围，诚实说明并建议访问者通过 GitHub 或博客了解更多
5. **鼓励互动**：邀请访问者查看项目、阅读博客或在 GitHub 上交流

## 可用功能
你可以调用以下函数获取实时信息：
- getProjects(): 获取项目列表
- getNotes(): 获取博客和笔记列表
- getTools(): 获取工具列表
- searchContent(query): 搜索相关内容

记住：你代表 cc 与访问者对话，展现他的专业性、创造力和对技术的热情。`

/**
 * Function calling 定义
 * 让 AI 能够调用的函数
 */
export const AGENT_FUNCTIONS = [
  {
    name: 'getProjects',
    description: '获取 cc 的所有项目列表，包括项目名称、描述、链接和截图',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getNotes',
    description: '获取 cc 的博客和学习笔记列表',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getTools',
    description: '获取 cc 开发的工具和包',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'searchContent',
    description: '在项目、笔记和工具中搜索相关内容',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词'
        }
      },
      required: ['query']
    }
  }
]

/**
 * Function implementations
 * 实际的函数实现
 */
export const functionImplementations = {
  getProjects: () => {
    return {
      projects: projects.map(p => ({
        name: p.name,
        description: p.desc || '',
        link: p.link,
        image: p.image
      }))
    }
  },

  getNotes: () => {
    return {
      notes: notes.map(n => ({
        name: n.name,
        description: n.desc || '',
        link: n.link
      }))
    }
  },

  getTools: () => {
    return {
      tools: tools.map(t => ({
        name: t.name,
        description: t.desc || '',
        link: t.link
      }))
    }
  },

  searchContent: (query: string) => {
    const allContent = [
      ...projects.map(p => ({ type: 'project', ...p })),
      ...notes.map(n => ({ type: 'note', ...n })),
      ...tools.map(t => ({ type: 'tool', ...t }))
    ]

    const results = allContent.filter(item => {
      const searchText = `${item.name} ${item.desc || ''} ${item.link}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })

    return { results }
  }
}

/**
 * 执行 function call
 */
export function executeFunctionCall(functionName: string, args: any) {
  const func = functionImplementations[functionName as keyof typeof functionImplementations]
  if (!func) {
    throw new Error(`Unknown function: ${functionName}`)
  }
  
  if (functionName === 'searchContent') {
    return func(args.query)
  }
  
  return func()
}
