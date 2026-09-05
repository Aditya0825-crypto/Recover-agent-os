import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, CircleDollarSign, FileCheck2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import landingImage from "../assets/recoveryos-landing.jpg";

const workflow = [
  { icon: Sparkles, step: "01", title: "Diagnose the failure", detail: "Separate temporary bank issues, soft declines, customer intent and true dead ends." },
  { icon: TrendingUp, step: "02", title: "Price the next move", detail: "Calculate recovery probability and expected value before any outreach happens." },
  { icon: ShieldCheck, step: "03", title: "Act inside policy", detail: "Retry, remind, link, wait or escalate — only when your guardrails allow it." },
  { icon: FileCheck2, step: "04", title: "Prove the outcome", detail: "Track every decision, action and rupee recovered in one audit trail." },
];

const stats = [
  ["₹12.84L", "revenue at risk"],
  ["68%", "recovery rate"],
  ["₹4.29L", "recovered this month"],
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-brand font-display text-lg font-800 text-primary-foreground shadow-brand">₹</span>
            <span className="leading-tight"><span className="block font-display text-[17px] font-800">RecoveryOS</span><span className="block font-mono text-[10px] text-muted">revenue tower</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-600 text-muted md:flex" aria-label="Main navigation">
            <a href="#how-it-works" className="transition hover:text-ink">How it works</a>
            <a href="#control" className="transition hover:text-ink">Control by design</a>
            <Link to="/workspace" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2.5 text-ink shadow-card transition hover:border-brand hover:text-brand">Open workspace <ArrowRight size={14} /></Link>
          </nav>
          <Link to="/workspace" className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[13px] font-700 text-primary-foreground shadow-brand transition hover:-translate-y-0.5 md:hidden">Open app <ArrowRight size={14} /></Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-[720px] items-end overflow-hidden bg-paper lg:min-h-[820px]">
        <img src={landingImage} alt="RecoveryOS revenue recovery workspace on a laptop" width={1600} height={1008} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-paper/65 lg:bg-paper/25" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-36 lg:px-8 lg:pb-28">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-[11px] font-700 text-brand shadow-card backdrop-blur"><span className="size-2 rounded-full bg-mint animate-dot-pulse" />AI revenue recovery for Razorpay merchants</div>
            <h1 className="font-display text-[52px] font-800 leading-[0.98] tracking-tight text-ink sm:text-[68px]">Recover more.<br /><span className="text-brand">Intervene less.</span></h1>
            <p className="mt-6 max-w-lg text-[17px] leading-7 text-ink/75">RecoveryOS turns failed payments into economically sound next actions — then gives your team a clear receipt for every rupee recovered.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><Link to="/workspace" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[13px] font-700 text-primary-foreground shadow-brand transition hover:-translate-y-0.5">Open the command center <ArrowRight size={15} /></Link><Link to="/queue" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/85 px-5 py-3 text-[13px] font-700 text-ink shadow-card backdrop-blur transition hover:border-brand hover:text-brand">See recovery queue</Link></div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-600 text-muted"><span className="flex items-center gap-1.5"><Check size={14} className="text-mint" />Policy-aware automation</span><span className="flex items-center gap-1.5"><Check size={14} className="text-mint" />Explainable decisions</span><span className="flex items-center gap-1.5"><Check size={14} className="text-mint" />Audit-ready by default</span></div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface" aria-label="RecoveryOS performance snapshot">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">{stats.map(([value, label]) => <div key={label} className="flex items-baseline gap-3 py-6 sm:px-8 first:sm:pl-0 last:sm:pr-0"><span className="font-display text-[30px] font-800 text-brand">{value}</span><span className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</span></div>)}</div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">The recovery loop</p><h2 className="mt-3 font-display text-[38px] font-800 leading-tight sm:text-[48px]">A smarter layer between failure and follow-up.</h2><p className="mt-4 text-[16px] leading-7 text-muted">Your payment processor tells you what failed. RecoveryOS decides what is worth doing next, with the context and constraints to do it safely.</p></div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{workflow.map(({ icon: Icon, step, title, detail }) => <article key={step} className="border-t-2 border-brand bg-surface px-5 py-6 shadow-card transition hover:-translate-y-1"><div className="flex items-center justify-between"><span className="font-mono text-[11px] font-700 text-brand">{step}</span><Icon size={19} className="text-brand" /></div><h3 className="mt-10 font-display text-[20px] font-800">{title}</h3><p className="mt-2 text-[13px] leading-6 text-muted">{detail}</p></article>)}</div>
      </section>

      <section id="control" className="bg-ink text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-24"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">Control by design</p><h2 className="mt-3 font-display text-[38px] font-800 leading-tight sm:text-[48px]">The agent proposes.<br /><span className="text-mint">Your policy decides.</span></h2><p className="mt-5 max-w-md text-[15px] leading-7 text-primary-foreground/70">Put thresholds, retry limits and customer contact rules in one place. RecoveryOS can move quickly without moving beyond your boundaries.</p><Link to="/policies" className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-[13px] font-700 text-ink transition hover:-translate-y-0.5">Review guardrails <ArrowRight size={15} /></Link></div><div className="grid gap-3 sm:grid-cols-2">{[[CircleDollarSign, "Expected value", "Choose the action with the best economic upside."], [ShieldCheck, "Systemic protection", "Pause outreach when a payment rail is unhealthy."], [FileCheck2, "Decision receipts", "Keep the why behind every automated action."], [TrendingUp, "Incremental revenue", "See what the agent recovered beyond manual retry."]].map(([Icon, title, detail]) => { const FeatureIcon = Icon as typeof CircleDollarSign; return <div key={title as string} className="border border-primary-foreground/15 bg-primary-foreground/5 p-5"><FeatureIcon size={19} className="text-mint" /><h3 className="mt-8 font-display text-[18px] font-800">{title as string}</h3><p className="mt-2 text-[12px] leading-5 text-primary-foreground/60">{detail as string}</p></div>; })}</div></div>
      </section>

      <section className="bg-paper px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 border-t border-line pt-10 sm:flex-row sm:items-end"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">Start with the signal</p><h2 className="mt-3 max-w-xl font-display text-[36px] font-800 leading-tight">Make every failed payment a considered decision.</h2></div><Link to="/workspace" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-3 text-[13px] font-700 text-primary-foreground shadow-brand transition hover:-translate-y-0.5">Enter RecoveryOS <ArrowRight size={15} /></Link></div></section>
      <footer className="border-t border-line bg-surface"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="font-display text-[16px] font-800 text-ink">RecoveryOS</span><span>AI revenue recovery for modern payment teams.</span><span className="font-mono">Built for the decision after decline.</span></div></footer>
    </main>
  );
}