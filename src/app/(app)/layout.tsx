import { NeonBackground } from "@/components/layout/NeonBackground";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NeonBackground>
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          <AppHeader />
          <main className="flex-1 px-5">{children}</main>
          <BottomTabs />
        </div>
      </NeonBackground>
    </AuthProvider>
  );
}

