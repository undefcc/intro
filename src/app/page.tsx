import React from "react";
import { allSnippets } from "contentlayer/generated";
import { Snippet } from "@/components/snippet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { ModeToggle } from "@/components/theme/toggle-mode";
import { Bot, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/theme/toggle-lang";
import IndexRadar from "@/app/_components/index-radar";
import CardProject from "./_components/card-project";

const snippets = allSnippets.sort((a, b) => a.order - b.order);

const projects = [
  {
    name: "Blog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://undefcc.github.io",
    icon: "blog",
  },
  {
    name: "GitHub",
    desc: "My GitHub profile where I share various open-source projects and contributions.",
    link: "https://github.com/undefcc",
    icon: "github",
  },
];
export default function Home() {
  return (
    <main className="flex min-h-screen relative flex-col items-center justify-between p-4 sm:p-16">
      <div className="sm:sticky top-0 flex w-full max-w-3xl mx-auto">
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
          <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
            <a href="https://twitter.com/undefcc" target="_blank">
              <Bot />
            </a>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-8 container max-w-3xl relative mx-auto flex-1 p-4 border border-border backdrop-blur-[2px] rounded-lg">
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
              <div className="flex flex-col gap-3 pb-4 border-b border-border">
                <h3 className="text-xl font-cal">Tech Stack</h3>
                <code>- HTML, CSS, JavaScript, TypeScript</code>
                <code>- Vue, React, Next.js</code>
                <code>- Node.js, Nest.js, Express</code>
                <code>- Redis, MySQL, MongoDB</code>
                <code>- Docker, Git, Linux</code>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <ul className="list-decimal list-outside ml-5 marker:text-muted-foreground space-y-2 text-sm">
                  <li>Develop Mini Program in WeChat/Alipay</li>
                  <li>Develop Web App in Taro/Uniapp</li>
                  <li>Develop Native HarmonyOS App by ArkTS</li>
                  <li>Develop H5 Game by Cocos, Egret</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:border-l border-border md:pl-4 md:pt-0 md:border-t-0 border-t pt-4">
              <h3 className="text-xl font-cal">Visual</h3>
              <IndexRadar />
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <h3 className="text-xl font-cal">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {
                projects.map((project) => (
                  <CardProject key={project.name} project={project} />
                ))
              }
            </div>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
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
          </div>
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
