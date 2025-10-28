import MiniAppDisplay from "@/app/_components/miniapp-display";
import { notFound } from "next/navigation";

// 示例数据，实际可从数据库或接口获取
const miniapps = [
  {
    name: "爱泊客V2",
    slug: "abk",
    desc: "A mini program showcasing basic UI and QR experience.",
    qrCode: "/images/abk.png",
    preview: "/images/abk.png",
    platform: "WeChat Mini Program"
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
