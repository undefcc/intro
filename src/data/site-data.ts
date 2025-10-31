import { getScreenshot } from "@/lib/utils";

export interface BaseItem { name: string; link: string; image: string; desc?: string }
export interface ProjectItem extends BaseItem { slug?: string }
export type NoteItem = BaseItem
export type ToolItem = BaseItem

export const projects: ProjectItem[] = [
  {
    name: "GitHub",
    desc: "My GitHub profile where I share various open-source projects and contributions.",
    link: "https://github.com/undefcc",
    image: getScreenshot("https://github.com/undefcc"),
  },
  {
    name: "LangLangYun Courses",
    desc: "",
    link: "http://course.langlangyun.com/h5/index.html",
    image: "/images/preview/llcourse.png",
  },
  {
    name: "芃禾托育",
    slug: "ph",
    image: "/images/preview/ph.png",
    link: "/miniapp/ph",
  },
  {
    name: "AI班级群",
    slug: "aiclass",
    image: "/images/preview/aiclass1.png",
    link: "/miniapp/aiclass",
  },
  {
    name: "GameDemo",
    desc: "",
    link: "https://ccoding.cn/web-desktop/",
    image: "images/preview/fpdemo.png",
  },
  {
    name: "Fujica Center",
    desc: "",
    link: "https://fst.fujica.com.cn",
    image: getScreenshot("https://fst.fujica.com.cn/#/login?redirect=%2Fdashboard"),
  },
  {
    name: "Fujica Parking App",
    desc: "",
    link: "https://www.fujica.com.cn/lists/104.html",
    image: getScreenshot("https://www.fujica.com.cn/lists/104.html"),
  },
  {
    name: "Fujica BigData",
    desc: "",
    link: "https://fsbigdata.fujica.com.cn/#/login?redirect=%2Fdashboard",
    image: getScreenshot("https://fsbigdata.fujica.com.cn/#/login?redirect=%2Fdashboard"),
  },
  {
    name: "爱泊客V2",
    slug: "abk",
    image: "/images/preview/abk.png",
    link: "/miniapp/abk",
  },
  {
    name: "富小维",
    slug: "fxw",
    image: "/images/preview/fxw.png",
    link: "/miniapp/fxw",
  },
];

export const notes: NoteItem[] = [
  {
    name: "YuQue",
    desc: "My study Notes.",
    link: "https://www.yuque.com/hexc",
    image: getScreenshot("https://www.yuque.com/hexc"),
  },
  {
    name: "Blog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://undefcc.github.io",
    image: getScreenshot("https://undefcc.github.io"),
  },
  {
    name: "CNBlog",
    desc: "A personal blog built with Next.js, Tailwind CSS, and Contentlayer.",
    link: "https://www.cnblogs.com/cc1997",
    image: getScreenshot("https://www.cnblogs.com/cc1997"),
  },
];

export const tools: ToolItem[] = [
  {
    name: "Org Fujica on NPM",
    desc: "",
    link: "https://www.npmjs.com/org/fujica",
    image: getScreenshot("https://www.npmjs.com/org/fujica"),
  },
  {
    name: "Utils Modules",
    desc: "",
    link: "https://fujicafe.github.io/utils/modules.html",
    image: getScreenshot("https://fujicafe.github.io/utils/modules.html"),
  },
];
