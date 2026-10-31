"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { HUB_PATH } from "@/lib/content/hub";
import { loginHref } from "./HubBar";
import { useLearner } from "./LearnerProvider";

/** The site header with the Hub's own links, for everyone inside the Hub. */
export default function HubHeader() {
  const pathname = usePathname();
  const { ready, learner, signOut } = useLearner();
  const onMyLearning = pathname.startsWith(`${HUB_PATH}/my-learning`);
  const onLogin = pathname === `${HUB_PATH}/login`;
  const onHome = pathname === HUB_PATH;

  return (
    <Header
      links={[
        { href: HUB_PATH, label: "Hub", current: onHome },
        { href: `${HUB_PATH}#library`, label: "Library", current: !onHome && !onMyLearning && !onLogin },
        ...(learner ? [{ href: `${HUB_PATH}/my-learning`, label: "My learning", current: onMyLearning }] : []),
        { href: "/", label: "Main site" },
      ]}
      cta={ready && !learner && !onLogin ? { href: loginHref(pathname), label: "Log in" } : undefined}
      onSignOut={learner ? () => void signOut() : undefined}
    />
  );
}
