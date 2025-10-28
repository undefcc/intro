import React from "react";
import { allSnippets } from "contentlayer/generated";
import { Snippet } from "@/components/snippet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { ModeToggle } from "@/components/theme/toggle-mode";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/theme/toggle-lang";
import ChatDialog from '@/components/ai/chat-dialog'
import IndexRadar from "@/app/_components/index-radar";
import TechStack from "@/app/_components/tech-stack";
import Capabilities from "@/app/_components/capabilities";
import Card from "./_components/card";
import MiniAppDisplay from "./_components/miniapp-display";

const snippets = allSnippets.sort((a, b) => a.order - b.order);

// 使用截图服务自动生成预览图
const getScreenshot = (url: string) => {
  // 方案1: screenshotone.com (免费额度有限，需注册获取 API key)
  // return `https://api.screenshotone.com/take?access_key=YOUR_KEY&url=${encodeURIComponent(url)}&viewport_width=1280&viewport_height=720&format=jpg&image_quality=80`
  
  // 方案2: screenshotapi.net (免费额度)
  // return `https://shot.screenshotapi.net/screenshot?token=YOUR_TOKEN&url=${encodeURIComponent(url)}&width=1280&height=720&output=image&file_type=png&wait_for_event=load`
  
  // 方案3: apiflash.com (免费1000次/月)
  // return `https://api.apiflash.com/v1/urltoimage?access_key=YOUR_KEY&url=${encodeURIComponent(url)}&width=1280&height=720&format=jpeg&quality=80`
  
  // 方案4: 使用 Vercel 的 og-image (适合部署在 Vercel)
  // return `/api/screenshot?url=${encodeURIComponent(url)}`
  
  // 方案5: 开源免费的 microlink.io
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
}
const projects = [
  {
    name: "GitHub",
    desc: "My GitHub profile where I share various open-source projects and contributions.",
    link: "https://github.com/undefcc",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://github.com/undefcc')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "LangLangYun Courses",
    desc: "",
    link: "http://course.langlangyun.com/h5/index.html",
    image: `https://api.microlink.io/?url=${encodeURIComponent('http://course.langlangyun.com/h5/index.html')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "Fujica Parking App",
    desc: "",
    link: "https://www.fujica.com.cn/lists/104.html",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://www.fujica.com.cn/lists/104.html')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "Fujica BigData",
    desc: "",
    link: "https://fsbigdata.fujica.com.cn/#/login?redirect=%2Fdashboard",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://fsbigdata.fujica.com.cn/#/login?redirect=%2Fdashboard')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "Fujica Center",
    desc: "",
    link: "https://fst.fujica.com.cn",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://fst.fujica.com.cn/#/login?redirect=%2Fdashboard')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  // 小程序项目
  {
    name: "爱泊客V2",
    slug: "abk",
    desc: "A demo mini program showcasing basic UI and QR experience.",
    image: "/images/abk.png", // preview image
    qrCode: "/images/abk.png", // QR code
    link: "/miniapp/abk", // internal detail page path
  },
];

const notes = [
  {
    name: "YuQue",
    desc: "My study Notes.",
    link: "https://www.yuque.com/hexc",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://www.yuque.com/hexc')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "Blog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://undefcc.github.io",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://undefcc.github.io')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "CNBlog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://www.cnblogs.com/cc1997",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://www.cnblogs.com/cc1997')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
];
const tools = [
  {
    name: "Org Fujica on NPM",
    desc: "",
    link: "https://www.npmjs.com/org/fujica",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://www.npmjs.com/org/fujica')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
  {
    name: "Utils Modules",
    desc: "",
    link: "https://fujicafe.github.io/utils/modules.html",
    image: `https://api.microlink.io/?url=${encodeURIComponent('https://fujicafe.github.io/utils/modules.html')}&screenshot=true&meta=false&embed=screenshot.url`,
  },
];


export default function Home() {
  return (
    <main className="flex min-h-screen relative flex-col items-center justify-between p-2 sm:p-8">
      <div className="sm:sticky top-0 flex w-full max-w-[1280px] mx-auto">
        <div className="sm:absolute sm:top-2 sm:-right-12 gap-2 p-1 flex-1 flex sm:flex-col justify-center items-center">
          <ModeToggle />
          <LangToggle />
          <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
            <a
              href="https://github.com/undefcc"
              target="_blank"
            >
              <Github />
            </a>
          </Button>
          <ChatDialog />
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full max-w-[1280px] relative mx-auto flex-1 p-4 border border-border backdrop-blur-[2px] rounded-lg">
        <div className="grid gap-4 text-center mx-auto max-w-2xl mt-12">
          <h1 className="text-3xl font-cal">He xuchao</h1>
          <p className="text-muted-foreground">
            Just A Simple Coder
          </p>
          <div>
            {/* <DateTimePickerForm /> */}

          </div>
        </div>
        <div className="flex-1 min-h-full flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 pb-4">
            <div className="grid pb-4 md:pb-0 md:pr-4">
              <div className="flex flex-col gap-4 pb-4 border-b border-border">
                <h3 className="text-xl font-cal">Tech Stack</h3>
                <TechStack />
              </div>
              <div className="pt-4 flex flex-col gap-4">
                <h4 className="text-sm font-semibold tracking-wide text-muted-foreground">Capabilities</h4>
                <Capabilities />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:border-l border-border md:pl-4 md:pt-0 md:border-t-0 border-t pt-4">
              <h3 className="text-xl font-cal">Visual</h3>
              <IndexRadar />
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Projects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                projects.map((project) => (
                  <Card key={project.name} project={project} />
                ))
              }
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Notes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                notes.map((note) => (
                  <Card key={note.name} project={note} />
                ))
              }
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {
                tools.map((tool) => (
                  <Card key={tool.name} project={tool} />
                ))
              }
            </div>
          </div>

          {/* <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Snippets</h3>
            <Accordion
              type="single"
              collapsible
              // defaultValue={snippets[0].file}
            >
              {snippets.map((snippet) => (
                <AccordionItem key={snippet.slug} value={snippet.file}>
                  <AccordionTrigger id={snippet.file}>
                    <code>{snippet.file}</code>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Snippet snippet={snippet} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div> */}
        </div>
        <div>
          <p className="text-center text-muted-foreground text-sm mb-1">
            Powered by{" "}
            <a
              className="text-foreground underline hover:no-underline"
              href="https://nextjs.org/"
            >
              Next.js
            </a>
          </p>
          <p className="text-center text-muted-foreground text-xs">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              粤ICP备2023063699号
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
