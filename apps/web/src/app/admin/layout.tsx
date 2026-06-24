"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  CalendarOff,
  Users,
  Menu,
  X,
  LogOut,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MagicButton } from "@/components/ui/magic-button";

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays    },
  { href: "/admin/availability", label: "Availability", icon: Clock           },
  { href: "/admin/vacations",    label: "Vacations",    icon: CalendarOff     },
  { href: "/admin/patients",     label: "Patients",     icon: Users           },
] as const;

function NavLink({ href, label, icon: Icon, onClick }: (typeof NAV_ITEMS)[number] & { onClick?: () => void }) {
  const pathname = usePathname();
  const active   = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-teal/10 text-teal"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-violet">
          <HeartPulse className="size-4 text-white" />
        </div>
        <div className="leading-none">
          <p className="text-xs font-bold text-foreground">Dr. Greeshma</p>
          <p className="text-[10px] text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} onClick={onLinkClick} />
        ))}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-border/50 pt-3">
        <div className="mb-2 px-3">
          <p className="text-xs font-medium text-foreground truncate">
            {session?.user?.name ?? "Doctor"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session?.user?.email}
          </p>
        </div>
        <MagicButton
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/");
          }}
        >
          <LogOut className="size-3.5" />
          Sign out
        </MagicButton>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-violet">
              <HeartPulse className="size-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">Admin Portal</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
