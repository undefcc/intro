import MiniAppDisplay from "@/app/_components/miniapp-display";
import { notFound } from "next/navigation";

// 示例数据，实际可从数据库或接口获取
const miniapps = [
  {
    name: "芃禾",
    slug: "ph",
    desc: "托育服务小程序，提供家园共育、育儿资讯、在线课程等功能。",
    qrCode: "/images/qrcode/ph.png",
    preview: [
      "/images/preview/ph.png",
      // 额外预览图按需添加
    ],
  },
  {
    name: "AI班级群",
    slug: "aiclass",
    desc: "智能班级管理小程序，支持班级通知、作业布置、家校沟通等功能。",
    qrCode: "/images/qrcode/aiclass.png",
    preview: [
      "/images/preview/aiclass.png",
      "/images/preview/aiclass1.png",
      "/images/preview/aiclass2.png",
      "/images/preview/aiclass3.png",
    ],
  },
  {
    name: "爱泊客",
    slug: "abk1",
    desc: "停车导航与支付小程序，支持车位查询、导航、在线支付等功能。",
    qrCode: "/images/qrcode/abk1.png",
    preview: [
      "/images/preview/abk1.png",
    ],
  },
  {
    name: "爱泊客V2",
    slug: "abk",
    desc: "停车导航与支付小程序，支持车位查询、导航、在线支付等功能。",
    qrCode: "/images/qrcode/abk.png",
    preview: [
      "/images/preview/abk.png",
    ],
  },
  {
    name: "富易行V2",
    slug: "fyx",
    desc: "停车场管理系统小程序，提供车位查询、导航、支付等功能。",
    qrCode: "/images/qrcode/fyx.png",
    preview: [
      "/images/preview/fyx.png",
    ],
  },
  {
    name: "富小维",
    slug: "fxw",
    desc: "运维管理小程序，支持设备监控、故障报修等功能。",
    qrCode: "/images/qrcode/fxw.png",
    preview: [
      "/images/preview/fxw.png",
      "/images/preview/fxw1.png",
    ],
  },
];

export default function MiniAppPage({ params }: { params: { name: string } }) {
  const miniapp = miniapps.find(m => m.slug === decodeURIComponent(params.name));
  if (!miniapp) return notFound();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <MiniAppDisplay miniapp={miniapp} />
    </div>
  );
}
