import { Link, useLocation } from "@tanstack/react-router";
import { Bell, ChevronDown, CircleHelp, FileClock, LayoutDashboard, ListFilter, Menu, Search, Settings2, ShieldCheck, Sparkles, TrendingUp, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const navItems = [
  { label: "Overview", to: "/workspace", icon: LayoutDashboard },
  { label: "Recovery Queue", to: "/queue", icon: ListFilter },
  { label: "Recovery Cases", to: "/cases", icon: FileClock },
  { label: "Agent Activity", to: "/activity", icon: Sparkles },
  { label: "Analytics", to: "/analytics", icon: TrendingUp },
  { label: "Policies & Guardrails", to: "/policies", icon: ShieldCheck },
  { label: "Audit Log", to: "/audit", icon: Settings2 },
] as const;

export function RecoveryShell({ children, eyebrow, title, action }: { children: ReactNode; eyebrow: string; title: string; action?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        <button aria-label="Open navigation" className="fixed left-4 top-4 z-30 grid size-10 place-items-center rounded-2xl bg-surface text-brand shadow-card lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-line bg-surface px-4 py-5 transition-transform lg:sticky lg:top-0 lg:flex lg:h-screen lg:translate-x-0 lg:flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-2">
             <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <div className="grid size-9 place-items-center rounded-2xl bg-brand font-display text-lg font-800 text-primary-foreground">₹</div>
              <div className="leading-tight"><p className="font-display text-[16px] font-700">RecoveryOS</p><p className="font-mono text-[10px] text-muted">revenue tower</p></div>
            </Link>
            <button aria-label="Close navigation" className="text-muted lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button>
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-brand to-violet px-3 py-2.5 text-primary-foreground shadow-brand">
            <span className="relative flex size-2.5"><span className="absolute inset-0 rounded-full bg-primary-foreground animate-dot-pulse" /><span className="relative size-2.5 rounded-full bg-primary-foreground" /></span>
            <div className="leading-tight"><p className="font-display text-[12px] font-700">Recovery Agent</p><p className="text-[10px] text-primary-foreground/70">Active · routing 428</p></div>
          </div>
          <nav className="mt-5 space-y-1 text-[13px] font-500">
            {navItems.map(({ label, to, icon: Icon }) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/workspace" }} activeProps={{ className: "bg-brand-soft font-700 text-brand" }} className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-muted transition-colors hover:bg-paper hover:text-ink" onClick={() => setMobileOpen(false)}>
                <Icon size={15} strokeWidth={1.8} />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-mint-soft px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-mint">Systemic guard</p>
            <p className="mt-1 text-[11px] font-600 text-ink/80">Outreach paused for 1,284 affected payments</p>
          </div>
        </aside>
        {mobileOpen && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={() => setMobileOpen(false)} />}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-5 py-3.5 backdrop-blur lg:px-7">
            <div className="ml-12 flex items-center gap-2.5 lg:ml-0"><div className="grid size-8 place-items-center rounded-full bg-amber-soft font-display text-[13px] font-700 text-amber">N</div><div className="leading-tight"><p className="text-[13px] font-700">Nimbus Retail Pvt Ltd</p><p className="font-mono text-[10px] text-muted">acct · rzp_live_nimbus</p></div></div>
            <div className="ml-auto flex items-center gap-3"><div className="hidden w-64 items-center rounded-full border border-line bg-paper px-3 py-2 text-[12px] text-muted md:flex"><Search size={14} className="mr-2" />Search cases, customers, audit…</div><button aria-label="Notifications" className="grid size-9 place-items-center rounded-full border border-line bg-surface text-muted hover:text-brand"><Bell size={16} /></button><button aria-label="Profile menu" className="flex items-center gap-1.5 rounded-full bg-violet-soft px-2 py-1.5 text-[12px] font-700 text-violet"><span>AK</span><ChevronDown size={13} /></button></div>
          </header>
          <div className="px-5 py-6 lg:px-7">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p><h1 className="mt-1 font-display text-[28px] font-800 leading-tight">{title}</h1></div>{action}</div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-card bg-surface p-5 shadow-card ${className}`}>{children}</section>; }
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { Recovered: "bg-mint-soft text-mint", Pending: "bg-amber-soft text-amber", "Human Review": "bg-rose-soft text-rose", Recoverable: "bg-violet-soft text-violet", Stopped: "bg-paper text-muted" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-700 ${styles[status] ?? "bg-paper text-muted"}`}>{status}</span>;
}
export function ActionBadge({ action }: { action: string }) { return <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-600 text-brand">{action}</span>; }
export function EmptyHint({ icon: Icon = CircleHelp, children }: { icon?: typeof CircleHelp; children: ReactNode }) { return <div className="flex items-center gap-2 text-sm text-muted"><Icon size={16} />{children}</div>; }