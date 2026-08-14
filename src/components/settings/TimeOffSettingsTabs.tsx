"use client";

import { usePathname } from "next/navigation";
import { TabBar, TabLink } from "@/components/ui";

export default function TimeOffSettingsTabs() {
  const pathname = usePathname();
  return (
    <TabBar>
      <TabLink href="/time-off-settings/policies" active={pathname.startsWith("/time-off-settings/policies")}>
        Policies
      </TabLink>
      <TabLink href="/time-off-settings/holidays" active={pathname.startsWith("/time-off-settings/holidays")}>
        Holidays
      </TabLink>
    </TabBar>
  );
}
