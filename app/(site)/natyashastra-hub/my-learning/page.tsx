import type { Metadata } from "next";
import MyLearning from "@/components/hub/MyLearning";
import { summarize } from "@/lib/content/hub";
import { getPublicHub } from "@/lib/content/store";

export const metadata: Metadata = { title: "My learning — Natyashastra Hub" };

export default async function MyLearningPage() {
  return <MyLearning hub={summarize(await getPublicHub())} />;
}
