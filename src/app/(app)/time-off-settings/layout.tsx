import TimeOffSettingsTabs from "@/components/settings/TimeOffSettingsTabs";

export default function TimeOffSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TimeOffSettingsTabs />
      {children}
    </div>
  );
}
