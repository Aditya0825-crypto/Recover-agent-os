import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Bot, Check, ChevronRight, Clock3, Download, Filter, Pause, Play, RefreshCw, Search, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "../lib/recovery-data";
import { ActionBadge, RecoveryShell, SectionCard, StatusBadge } from "./recovery-shell";
import { api, type RecoveryCaseDTO, type OverviewAnalyticsDTO, type PolicyConfigDTO, type AuditEventDTO, type ActivityFeedDTO } from "../api/client";

const classForTone: Record<string, string> = { mint: "bg-mint", brand: "bg-brand", amber: "bg-amber", sky: "bg-sky", violet: "bg-violet", rose: "bg-rose" };

function PageAction({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" }) {
  return <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-600 transition hover:-translate-y-0.5 cursor-pointer ${variant === "primary" ? "bg-brand text-primary-foreground shadow-brand" : "border border-line bg-surface text-ink hover:border-brand hover:text-brand"}`}>{children}</button>;
}

function SystemicBanner() {
  return <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-soft px-4 py-3 text-[12px] text-ink animate-rise"><span className="grid size-7 place-items-center rounded-xl bg-surface text-amber"><Zap size={15} /></span><div><p className="font-700">Systemic payment issue detected</p><p className="text-muted">HDFC bank · 1,284 payments · ₹8.7L potentially affected · unnecessary contacts avoided: 3,421</p></div><span className="ml-auto rounded-full bg-surface px-2.5 py-1 font-700 text-amber">Outreach paused</span></div>;
}

function RunAgentButton({ onComplete }: { onComplete?: () => void }) {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [step, setStep] = useState(0);
  const steps = ["10,000 transactions", "1,284 at-risk cases", "736 recoverable cases", "428 recovery actions", "42 human escalations", "96 cases automatically stopped", "₹ Revenue Recovered"];

  const handleRun = async () => {
    setStep(0);
    setComplete(false);
    setRunning(true);
    try {
      // Trigger background simulation API
      await api.runSimulation(10000);
    } catch (e) {
      console.warn("Simulation API notice, using UI animation flow:", e);
    }
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setStep((current) => {
      if (current >= steps.length - 1) {
        window.clearInterval(timer);
        setRunning(false);
        setComplete(true);
        if (onComplete) onComplete();
        return current;
      }
      return current + 1;
    }), 420);
    return () => window.clearInterval(timer);
  }, [running, steps.length, onComplete]);

  if (running || complete) return <div className="min-w-64 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-2.5"><div className="flex items-center gap-2 text-[12px] font-700 text-brand"><span className="size-2 rounded-full bg-brand animate-dot-pulse" />{complete ? "Agent run complete" : "Agent is processing failures"}</div><p className="mt-0.5 font-mono text-[10px] text-muted">{steps[step]}</p>{!complete && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${Math.round(((step + 1) / steps.length) * 100)}%` }} /></div>}</div>;
  return <PageAction onClick={handleRun}><Play size={14} fill="currentColor" />Run Recovery Agent</PageAction>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-card"><p className="font-700">{label}</p>{payload.map((entry) => <p key={entry.name} className="text-muted">{entry.name}: <span className="font-mono text-ink">{formatINR(entry.value)}</span></p>)}</div>;
}

export function OverviewPage() {
  const [data, setData] = useState<OverviewAnalyticsDTO | null>(null);
  const [recentCases, setRecentCases] = useState<RecoveryCaseDTO[]>([]);
  const [activity, setActivity] = useState<ActivityFeedDTO | null>(null);

  const refreshData = useCallback(() => {
    api.getOverview().then(setData).catch(console.error);
    api.getCases({ limit: 5 } as any).then(setRecentCases).catch(console.error);
    api.getActivityFeed().then(setActivity).catch(console.error);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const trendData = data?.trend_data || [
    { day: "Mon", recovered: 23800, baseline: 14200 }, { day: "Tue", recovered: 30100, baseline: 16100 },
    { day: "Wed", recovered: 27600, baseline: 15300 }, { day: "Thu", recovered: 38900, baseline: 18400 },
    { day: "Fri", recovered: 42100, baseline: 21100 }, { day: "Sat", recovered: 51800, baseline: 24800 },
    { day: "Sun", recovered: 64700, baseline: 28200 },
  ];

  const failureData = data?.failure_data || [
    { name: "Bank timeout", value: 403000, color: "var(--color-amber)" },
    { name: "Card declined", value: 512000, color: "var(--color-rose)" },
    { name: "Insufficient funds", value: 291000, color: "var(--color-violet)" },
    { name: "Session timeout", value: 178000, color: "var(--color-sky)" },
  ];

  const outcomeData = data?.outcome_data || [
    { name: "Recovered", value: 428, color: "var(--color-mint)" },
    { name: "Pending", value: 184, color: "var(--color-amber)" },
    { name: "Review", value: 42, color: "var(--color-rose)" },
    { name: "Stopped", value: 96, color: "var(--color-muted)" },
  ];

  return <RecoveryShell eyebrow="Overview · Command Center" title="Good morning, Arun — here's your revenue tower." action={<RunAgentButton onComplete={refreshData} />}>
    <SystemicBanner />
    <div className="mt-5 grid grid-cols-12 gap-4">
      <section className="col-span-12 rounded-card bg-gradient-to-br from-brand to-violet p-6 text-primary-foreground shadow-brand lg:col-span-5 animate-rise">
        <div className="flex items-start justify-between"><p className="text-[12px] font-600 text-primary-foreground/80">₹ Revenue Recovered</p><span className="rounded-full bg-surface/20 px-2 py-0.5 font-mono text-[10px]">+18.4% · 7d</span></div>
        <p className="mt-3 font-display text-[44px] font-800 leading-none">{formatINR(data?.revenue_recovered ?? 428960)}</p><p className="mt-2 text-[12px] text-primary-foreground/75">Across recovered cases this month</p>
        <div className="mt-6 flex h-10 items-end gap-1.5">{[35, 52, 44, 68, 88, 100].map((height, index) => <span key={height} className="w-2.5 rounded-full bg-primary-foreground animate-grow-bar" style={{ height: `${height}%`, animationDelay: `${index * 0.08}s` }} />)}</div>
      </section>
      <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-7 xl:grid-cols-3">
        <Metric label="Revenue At Risk" value={formatINR(data?.revenue_at_risk ?? 1284000)} detail="At-risk transaction volume" tone="rose" />
        <Metric label="Expected Recovery" value={formatINR(data?.expected_recovery ?? 872400)} detail="AI predicted value" tone="brand" />
        <Metric label="Recovery Rate" value={data?.recovery_rate ?? "68%"} detail="vs 41% baseline" tone="amber" />
        <Metric label="Incremental Recovery" value={formatINR(data?.incremental_recovery ?? 291300)} detail="beyond manual retry" tone="mint" />
        <SectionCard className="col-span-2 !p-4 xl:col-span-2"><p className="font-mono text-[10px] uppercase tracking-wide text-muted">At-risk by failure type</p><div className="mt-3 space-y-2.5">{failureData.slice(0, 3).map((item, index) => <div key={item.name}><div className="flex justify-between text-[12px]"><span className="font-600">{item.name}</span><span className="font-mono text-muted">{formatINR(item.value)}</span></div><div className="mt-1 h-2 rounded-full bg-paper"><div className={`h-2 rounded-full ${["bg-rose", "bg-amber", "bg-violet"][index % 3]}`} style={{ width: `${[78, 61, 44][index % 3]}%` }} /></div></div>)}</div></SectionCard>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-12 gap-4">
      <SectionCard className="col-span-12 lg:col-span-8"><div className="flex items-center justify-between"><div><h2 className="font-display text-[16px] font-700">Revenue recovery trend</h2><p className="mt-0.5 text-[11px] text-muted">Recovered vs baseline · last 7 days</p></div><div className="flex gap-3 text-[11px] text-muted"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />RecoveryOS</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-line" />Baseline</span></div></div><div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><defs><linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 11 }} /><YAxis hide /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="recovered" name="Recovered" stroke="var(--color-brand)" strokeWidth={3} fill="url(#recoveryFill)" /><Area type="monotone" dataKey="baseline" name="Baseline" stroke="var(--color-line)" strokeWidth={2} fill="none" strokeDasharray="4 4" /></AreaChart></ResponsiveContainer></div></SectionCard>
      <SectionCard className="col-span-12 lg:col-span-4"><h2 className="font-display text-[16px] font-700">Recovery outcome breakdown</h2><div className="mt-2 h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={outcomeData} dataKey="value" innerRadius={52} outerRadius={75} paddingAngle={3} strokeWidth={0}>{outcomeData.map((item) => <Cell key={item.name} fill={item.color || "var(--color-brand)"} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-2 text-[11px]">{outcomeData.map((item) => <div key={item.name} className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}<span className="ml-auto font-mono text-ink">{item.value}</span></div>)}</div></SectionCard>
    </div>
    <div className="mt-4 grid grid-cols-12 gap-4"><RecentCases cases={recentCases} /><ActivityCard activity={activity} /></div>
  </RecoveryShell>;
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <SectionCard className="!p-4"><p className={`font-mono text-[10px] uppercase tracking-wide text-${tone}`}>{label}</p><p className="mt-2 font-display text-[26px] font-800 leading-none">{value}</p><p className="mt-1 text-[11px] text-muted">{detail}</p></SectionCard>; }

function RecentCases({ cases }: { cases: RecoveryCaseDTO[] }) {
  const displayCases = cases.length > 0 ? cases.slice(0, 5) : [];
  return <SectionCard className="col-span-12 lg:col-span-8"><div className="flex items-center justify-between"><h2 className="font-display text-[16px] font-700">Recent recovery cases</h2><Link to="/queue" className="text-[12px] font-600 text-brand">View queue <ArrowUpRight size={14} className="inline" /></Link></div><div className="mt-3 rounded-2xl bg-paper px-3 py-2 text-[12px]"><span className="font-700 text-amber">Systemic guard:</span> <span className="text-muted">outreach paused for HDFC cluster · 1,284 affected</span></div><div className="mt-2 divide-y divide-line">{displayCases.map((item) => <Link key={item.id} to="/cases/$caseId" params={{ caseId: item.id }} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-paper"><StatusBadge status={item.status} /><div className="w-32 shrink-0"><p className="text-[13px] font-600 leading-tight">{item.customer}</p><p className="font-mono text-[10px] text-muted">{item.id}</p></div><span className="w-24 font-mono text-[12px]">{formatINR(item.amount)}</span><ActionBadge action={item.action} /><span className="ml-auto font-mono text-[11px] text-muted">{item.created}</span></Link>)}</div></SectionCard>;
}

export function ActivityCard({ activity }: { activity?: ActivityFeedDTO | null }) {
  const counters = activity?.counters || { cases_analyzed: 736, actions_taken: 428, human_escalations: 42 };
  const events = activity?.events || [
    { label: "Payment recovered", detail: "RC-20418 · ₹24,999", tone: "mint" },
    { label: "Retry executed", detail: "RC-20418 · policy approved", tone: "brand" },
    { label: "Root cause identified", detail: "bank timeout · 94% confidence", tone: "amber" },
    { label: "Payment link generated", detail: "RC-20415 · ₹8,450", tone: "sky" },
    { label: "Probability calculated", detail: "736 cases · avg 82%", tone: "violet" },
    { label: "Outreach paused", detail: "systemic guard · 3,421 avoided", tone: "rose" },
  ];

  return <SectionCard className="col-span-12 lg:col-span-4"><div className="flex items-center gap-2"><span className="relative flex size-2.5"><span className="absolute inset-0 rounded-full bg-mint animate-dot-pulse" /><span className="relative size-2.5 rounded-full bg-mint" /></span><h2 className="font-display text-[16px] font-700">Live agent activity</h2></div><div className="mt-3 grid grid-cols-3 gap-2 text-center">{[[String(counters.cases_analyzed), "analyzed"], [String(counters.actions_taken), "actions"], [String(counters.human_escalations), "escalated"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-paper py-2"><p className="font-display text-[18px] font-800">{value}</p><p className="font-mono text-[9px] uppercase text-muted">{label}</p></div>)}</div><ol className="mt-4 space-y-3 text-[12px]">{events.map((event, index) => <li key={`${event.label}-${index}`} className="flex gap-2.5"><span className={`mt-1 size-2 shrink-0 rounded-full ${classForTone[event.tone] || "bg-brand"}`} /><span><b className="font-600">{event.label}</b> <span className="text-muted">· {event.detail}</span></span></li>)}</ol></SectionCard>;
}

function QueueToolbar({ search, setSearch, status, setStatus, priority, setPriority }: { search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; priority: string; setPriority: (value: string) => void }) { return <div className="mt-5 flex flex-wrap gap-2"><label className="flex min-w-64 flex-1 items-center rounded-2xl border border-line bg-surface px-3 text-sm text-muted"><Search size={15} className="mr-2" /><input aria-label="Search recovery cases" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cases or customers" className="w-full bg-transparent py-2.5 outline-none placeholder:text-muted" /></label><label className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 text-sm text-muted"><Filter size={14} /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="bg-transparent py-2.5 outline-none"><option value="All">All statuses</option>{["Recovered", "Pending", "Human Review", "Recoverable", "Stopped"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="flex items-center rounded-2xl border border-line bg-surface px-3 text-sm text-muted"><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="bg-transparent py-2.5 outline-none"><option value="All">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select></label></div>; }

export function QueuePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [cases, setCases] = useState<RecoveryCaseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCases({ status, priority, search })
      .then((res) => {
        setCases(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [status, priority, search]);

  return <RecoveryShell eyebrow="Operations · Recovery Queue" title="Recoverable revenue, routed with intent." action={<PageAction variant="secondary"><Download size={14} />Export queue</PageAction>}><QueueToolbar {...{ search, setSearch, status, setStatus, priority, setPriority }} /><div className="mt-4 flex items-center justify-between text-[12px] text-muted"><span><b className="text-ink">{cases.length}</b> visible cases · sorted by expected recovery</span><span className="hidden sm:inline">Policy engine active · live sync</span></div><SectionCard className="mt-3 overflow-hidden !p-0"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-[12px]"><thead className="border-b border-line bg-paper text-[10px] uppercase tracking-wide text-muted"><tr>{["Case", "Customer", "Amount", "Failure reason", "Recovery", "Action", "Priority", "Status", "Last action", "Created"].map((head) => <th key={head} className="px-4 py-3 font-600">{head}</th>)}</tr></thead><tbody className="divide-y divide-line">{cases.map((item) => <QueueRow key={item.id} item={item} />)}</tbody></table></div>{cases.length === 0 && !loading && <div className="p-10 text-center text-sm text-muted">No cases match these filters.</div>}{loading && <div className="p-10 text-center text-sm text-muted">Loading cases from RecoveryOS backend...</div>}</SectionCard></RecoveryShell>;
}

function QueueRow({ item }: { item: RecoveryCaseDTO }) { return <tr className="group transition-colors hover:bg-paper"><td className="px-4 py-3"><Link to="/cases/$caseId" params={{ caseId: item.id }} className="font-mono font-600 text-brand">{item.id}</Link><p className="mt-0.5 text-[10px] text-muted">{item.method}</p></td><td className="px-4 py-3 font-600">{item.customer}</td><td className="px-4 py-3 font-mono">{formatINR(item.amount)}</td><td className="px-4 py-3 text-muted">{item.reason}</td><td className="px-4 py-3"><span className="font-700 text-ink">{item.probability}%</span><p className="font-mono text-[10px] text-muted">{formatINR(item.expected)}</p></td><td className="px-4 py-3"><ActionBadge action={item.action} /></td><td className="px-4 py-3 text-muted">{item.priority}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3 text-muted">{item.lastAction}</td><td className="px-4 py-3 font-mono text-[10px] text-muted">{item.created}</td></tr>; }

export function CasesPage() {
  const [cases, setCases] = useState<RecoveryCaseDTO[]>([]);
  useEffect(() => {
    api.getCases().then(setCases).catch(console.error);
  }, []);

  const totalCases = cases.length || 1284;
  const recoverableCount = cases.filter((c) => c.status === "Recoverable" || c.status === "Recovered").length || 736;
  const recoveredCount = cases.filter((c) => c.status === "Recovered").length || 428;
  const humanReviewCount = cases.filter((c) => c.status === "Human Review").length || 42;

  return <RecoveryShell eyebrow="Operations · Recovery Cases" title="Every case, explained end to end." action={<PageAction variant="secondary"><Search size={14} />Find a customer</PageAction>}><div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{([[String(totalCases), "Total cases", "rose"], [String(recoverableCount), "Recoverable", "brand"], [String(recoveredCount), "Recovered", "mint"], [String(humanReviewCount), "Human review", "amber"]] as const).map(([value, label, tone]) => <Metric key={label} label={label} value={value} detail="this batch" tone={tone} />)}</div><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{cases.slice(0, 20).map((item) => <CaseCard key={item.id} item={item} />)}</div></RecoveryShell>;
}

function CaseCard({ item }: { item: RecoveryCaseDTO }) { return <Link to="/cases/$caseId" params={{ caseId: item.id }} className="group rounded-card bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-brand"><div className="flex items-start justify-between"><div><p className="font-mono text-[11px] text-brand">{item.id}</p><h2 className="mt-1 font-display text-[19px] font-700">{item.customer}</h2><p className="text-[12px] text-muted">{item.reason}</p></div><StatusBadge status={item.status} /></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4"><div><p className="font-mono text-[10px] uppercase text-muted">At risk</p><p className="mt-1 font-display text-[18px] font-800">{formatINR(item.amount)}</p></div><div><p className="font-mono text-[10px] uppercase text-muted">Probability</p><p className="mt-1 font-display text-[18px] font-800 text-brand">{item.probability}%</p></div><div><p className="font-mono text-[10px] uppercase text-muted">Expected</p><p className="mt-1 font-display text-[18px] font-800">{formatINR(item.expected)}</p></div></div><div className="mt-4 flex items-center justify-between text-[12px]"><ActionBadge action={item.action} /><span className="flex items-center gap-1 text-muted transition group-hover:text-brand">Open case <ChevronRight size={14} /></span></div></Link>; }

function PolicyCheck({ label, enabled = true }: { label: string; enabled?: boolean }) { return <div className={`flex items-center gap-2 text-[12px] ${enabled ? "text-ink" : "text-muted"}`}><span className={`grid size-5 place-items-center rounded-full ${enabled ? "bg-mint-soft text-mint" : "bg-paper text-muted"}`}>{enabled ? <Check size={13} /> : <X size={13} />}</span>{label}</div>; }

export function CaseDetailPage() {
  const { caseId } = useParams({ from: "/cases/$caseId" });
  const [item, setItem] = useState<RecoveryCaseDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.getCaseDetail(caseId).then(setItem).catch((e) => {
      console.warn("Case detail fetch notice:", e);
    });
  }, [caseId]);

  const handleAction = async (actionName: string) => {
    if (!item) return;
    setActionLoading(true);
    try {
      await api.executeCaseAction(item.id, actionName);
      const updated = await api.getCaseDetail(item.id);
      setItem(updated);
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setActionLoading(false);
    }
  };

  if (!item) return <RecoveryShell eyebrow="Operations · Recovery Case" title="Loading case details..."><Link to="/queue" className="mt-5 inline-flex items-center gap-2 text-sm text-brand"><ArrowLeft size={15} />Back to recovery queue</Link></RecoveryShell>;

  const timeline = ["Payment failed", "Failure diagnosed", "Recovery probability calculated", `AI selected ${item.action.toLowerCase()}`, "Policy approved action", item.status === "Recovered" ? "Payment successful" : "Next action queued", item.status === "Recovered" ? `${formatINR(item.recoveredAmount ?? item.amount)} recovered` : "Awaiting outcome"];

  const checks = item.policy_checks || {
    retry_limit_not_exceeded: item.retryCount < 3,
    customer_eligible: true,
    amount_within_threshold: item.amount < 50000 || item.action === "Human Review",
    no_systemic_issue: item.status !== "Pending" || item.reason !== "Temporary bank failure",
    action_permitted: item.action !== "Human Review" || item.amount >= 50000,
  };

  return <RecoveryShell eyebrow={`Operations · ${item.id}`} title={`${formatINR(item.amount)} · Payment failed`} action={<div className="flex gap-2"><Link to="/queue" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-600 text-ink hover:border-brand hover:text-brand"><ArrowLeft size={14} />Back to queue</Link>{item.status === "Human Review" && <PageAction onClick={() => handleAction("Approve Retry")}>{actionLoading ? "Executing..." : "Approve Recovery Action"}</PageAction>}</div>}>
    <div className="mt-5 flex flex-wrap items-center gap-2"><StatusBadge status={item.status} /><ActionBadge action={item.action} /><span className="text-[12px] text-muted">Created {item.created} · {item.method}</span></div>
    <div className="mt-4 grid grid-cols-12 gap-4">
      <SectionCard className="col-span-12 lg:col-span-7">
        <div className="flex items-center gap-2"><Sparkles size={16} className="text-brand" /><h2 className="font-display text-[17px] font-700">AI diagnosis & SHAP Attribution</h2></div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-paper p-4"><p className="font-mono text-[10px] uppercase text-muted">Root cause</p><p className="mt-2 font-display text-[20px] font-800">{item.diagnosis}</p><p className="mt-1 text-[12px] leading-5 text-muted">{item.diagnosisDetail}</p></div>
          <div className="rounded-2xl bg-brand-soft p-4"><p className="font-mono text-[10px] uppercase text-brand">Confidence</p><p className="mt-2 font-display text-[34px] font-800 text-brand">{item.confidence}%</p><p className="mt-1 text-[12px] text-muted">Based on payment and issuer signals</p></div>
        </div>

        {/* SHAP Explainability factors */}
        {item.shap_factors && item.shap_factors.length > 0 && (
          <div className="mt-4 rounded-2xl bg-paper p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Model Explainability (SHAP Values)</p>
            <div className="mt-2 space-y-1.5 text-[12px]">
              {item.shap_factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-ink/90 font-500">{factor.feature}</span>
                  <span className={`font-mono font-700 ${factor.impact === "positive" ? "text-mint" : "text-rose"}`}>
                    {factor.impact === "positive" ? "+" : ""}{factor.shap_value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4"><Bot size={17} className="text-brand" /><span className="text-[12px] font-700">Recovery Intelligence</span><span className="ml-auto rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-700 text-mint">{item.probability}% likely recoverable</span></div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div><p className="font-mono text-[10px] uppercase text-muted">Recovery probability</p><p className="mt-1 font-display text-[27px] font-800 text-brand">{item.probability}%</p></div>
          <div><p className="font-mono text-[10px] uppercase text-muted">Expected recovery</p><p className="mt-1 font-display text-[27px] font-800">{formatINR(item.expected)}</p><p className="text-[11px] text-muted">Amount × probability</p></div>
        </div>
      </SectionCard>
      <SectionCard className="col-span-12 lg:col-span-5"><div className="flex items-center gap-2"><Zap size={16} className="text-amber" /><h2 className="font-display text-[17px] font-700">AI decision</h2></div><div className="mt-4 rounded-2xl bg-brand-soft p-4"><p className="font-mono text-[10px] uppercase text-brand">Best next action</p><p className="mt-2 font-display text-[24px] font-800 text-brand">{item.action === "Wait" ? "WAIT 90 MINUTES" : item.action.toUpperCase()}</p><p className="mt-2 text-[12px] leading-5 text-muted">{item.rationale}</p></div><div className="mt-5"><p className="font-mono text-[10px] uppercase tracking-wide text-muted">Policy check</p><div className="mt-3 space-y-2.5"><PolicyCheck label="Retry limit not exceeded" enabled={checks.retry_limit_not_exceeded} /><PolicyCheck label="Customer eligible" enabled={checks.customer_eligible} /><PolicyCheck label="Amount within automated threshold" enabled={checks.amount_within_threshold} /><PolicyCheck label="No active systemic payment issue" enabled={checks.no_systemic_issue} /><PolicyCheck label="Action permitted by policy" enabled={checks.action_permitted} /></div></div></SectionCard>
    </div>
    <div className="mt-4 grid grid-cols-12 gap-4"><SectionCard className="col-span-12 lg:col-span-7"><h2 className="font-display text-[17px] font-700">Timeline & audit trail</h2><div className="mt-5 space-y-0">{timeline.map((event, index) => <div key={event} className="flex gap-3"><div className="flex w-6 shrink-0 flex-col items-center"><span className={`grid size-6 place-items-center rounded-full ${index < 5 || item.status === "Recovered" ? "bg-mint-soft text-mint" : "bg-paper text-muted"}`}>{index < 5 || item.status === "Recovered" ? <Check size={13} /> : <Clock3 size={13} />}</span>{index < timeline.length - 1 && <span className="h-8 w-px bg-line" />}</div><div className="pb-4"><p className="text-[13px] font-600">{event}</p><p className="mt-0.5 text-[11px] text-muted">{index === 0 ? item.created : index === timeline.length - 1 && item.status === "Recovered" ? "Verified by Razorpay webhook" : "RecoveryOS decision record"}</p></div></div>)}</div></SectionCard><SectionCard className="col-span-12 lg:col-span-5"><h2 className="font-display text-[17px] font-700">Payment information</h2><div className="mt-4 space-y-3">{[["Customer", item.customer], ["Email", item.email], ["Amount", formatINR(item.amount)], ["Payment method", item.method], ["Retry count", `${item.retryCount} of 3`], ["Failure status", "Payment failed"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-line pb-2.5 text-[12px]"><span className="text-muted">{label}</span><span className="font-600">{value}</span></div>)}</div><div className="mt-5 rounded-2xl bg-mint-soft p-3"><p className="text-[11px] font-700 text-mint">{item.status === "Recovered" ? "Verified recovery" : "Next state"}</p><p className="mt-1 text-[12px] text-ink/80">{item.status === "Recovered" ? `${formatINR(item.recoveredAmount ?? item.amount)} recorded as recovered revenue.` : `${item.action} is queued within the active policy window.`}</p></div></SectionCard></div>
  </RecoveryShell>;
}

export function ActivityPage() {
  const [activity, setActivity] = useState<ActivityFeedDTO | null>(null);

  useEffect(() => {
    api.getActivityFeed().then(setActivity).catch(console.error);
    const interval = window.setInterval(() => {
      api.getActivityFeed().then(setActivity).catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const counters = activity?.counters || {
    cases_analyzed: 736,
    actions_taken: 428,
    human_escalations: 42,
    cases_stopped: 96,
    revenue_recovered: "₹4.29L",
  };

  const events = activity?.events || [
    { label: "Payment recovered", detail: "RC-20418 · ₹24,999", tone: "mint" },
    { label: "Retry executed", detail: "RC-20418 · policy approved", tone: "brand" },
    { label: "Root cause identified", detail: "bank timeout · 94% confidence", tone: "amber" },
    { label: "Payment link generated", detail: "RC-20415 · ₹8,450", tone: "sky" },
    { label: "Probability calculated", detail: "736 cases · avg 82%", tone: "violet" },
    { label: "Outreach paused", detail: "systemic guard · 3,421 avoided", tone: "rose" },
  ];

  return <RecoveryShell eyebrow="Operations · Agent Activity" title="A live view of the recovery agent." action={<PageAction variant="secondary"><Pause size={14} />Pause agent</PageAction>}><div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">{[[String(counters.cases_analyzed), "Cases analyzed"], [String(counters.actions_taken), "Actions taken"], [String(counters.human_escalations), "Human escalations"], [String(counters.cases_stopped), "Cases stopped"], [counters.revenue_recovered, "Revenue recovered"]].map(([value, label], index) => <Metric key={label} label={label} value={value} detail={index === 4 ? "this month" : "today"} tone={index === 4 ? "mint" : "brand"} />)}</div><div className="mt-4 grid grid-cols-12 gap-4"><SectionCard className="col-span-12 lg:col-span-8"><div className="flex items-center justify-between"><div><h2 className="font-display text-[17px] font-700">Agent event stream</h2><p className="text-[12px] text-muted">Decisions appear here as the agent moves cases through policy.</p></div><span className="flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1.5 text-[11px] font-700 text-mint"><span className="size-2 rounded-full bg-mint animate-dot-pulse" />Recovery Agent · Active</span></div><div className="mt-5 space-y-3">{events.map((event, index) => <div key={`${event.label}-${index}`} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 animate-rise" style={{ animationDelay: `${index * 0.05}s` }}><span className={`grid size-8 place-items-center rounded-xl bg-surface ${classForTone[event.tone]?.replace("bg-", "text-") || "text-brand"}`}><Sparkles size={15} /></span><div><p className="text-[13px] font-600">{event.label}</p><p className="text-[11px] text-muted">{event.detail}</p></div><span className="ml-auto font-mono text-[10px] text-muted">{index < 2 ? "now" : `${index + 1}m ago`}</span></div>)}</div></SectionCard><SectionCard className="col-span-12 lg:col-span-4"><h2 className="font-display text-[17px] font-700">Agent operating model</h2><div className="mt-5 space-y-4">{["Detect payment event", "Diagnose root cause", "Predict recovery value", "Check policy guardrails", "Execute best intervention", "Verify and record ₹ recovered"].map((label, index) => <div key={label} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-brand-soft font-mono text-[10px] font-700 text-brand">0{index + 1}</span><span className="text-[12px] font-600">{label}</span>{index < 5 && <span className="ml-auto text-line">↓</span>}</div>)}</div><div className="mt-6 rounded-2xl bg-amber-soft p-3 text-[12px]"><p className="font-700 text-amber">Safeguard in motion</p><p className="mt-1 text-muted">Systemic HDFC issue is holding customer outreach until the rail is healthy.</p></div></SectionCard></div></RecoveryShell>;
}

export function AnalyticsPage() {
  const [data, setData] = useState<OverviewAnalyticsDTO | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error);
  }, []);

  const trendData = data?.trend_data || [
    { day: "Mon", recovered: 23800, baseline: 14200 }, { day: "Tue", recovered: 30100, baseline: 16100 },
    { day: "Wed", recovered: 27600, baseline: 15300 }, { day: "Thu", recovered: 38900, baseline: 18400 },
    { day: "Fri", recovered: 42100, baseline: 21100 }, { day: "Sat", recovered: 51800, baseline: 24800 },
    { day: "Sun", recovered: 64700, baseline: 28200 },
  ];

  const health = data?.operating_health || {
    recovery_rate: "68%",
    recovery_rate_detail: "vs 41% baseline",
    avg_time_to_recovery: "2h 18m",
    avg_time_detail: "14% faster",
    human_escalation_rate: "5.7%",
    escalation_detail: "within policy target",
    stopped_cases: 96,
    stopped_detail: "3,421 contacts avoided",
  };

  const performance = data?.failure_performance || [
    { label: "Temporary bank failure", rate: "89%", value: "₹3.58L", tone: "mint" },
    { label: "Card declined", rate: "64%", value: "₹1.84L", tone: "brand" },
    { label: "Session timeout", rate: "81%", value: "₹92K", tone: "sky" },
    { label: "Insufficient funds", rate: "47%", value: "₹74K", tone: "amber" },
  ];

  return <RecoveryShell eyebrow="Business impact · Analytics" title="RecoveryOS creates incremental revenue." action={<PageAction variant="secondary"><Download size={14} />Download report</PageAction>}><div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{[[formatINR(data?.revenue_at_risk ?? 1284000), "Revenue at risk", "rose"], [formatINR(data?.expected_recovery ?? 872400), "Expected recovery", "brand"], [formatINR(data?.revenue_recovered ?? 428960), "Actual recovery", "mint"], [formatINR(data?.incremental_recovery ?? 291300), "Incremental revenue", "amber"]].map(([value, label, tone]) => <Metric key={label} label={label} value={value} detail="last 30 days" tone={tone} />)}</div><div className="mt-4 grid grid-cols-12 gap-4"><SectionCard className="col-span-12 lg:col-span-8"><div className="flex items-center justify-between"><div><h2 className="font-display text-[17px] font-700">Baseline recovery vs RecoveryOS</h2><p className="text-[12px] text-muted">The value of deciding when to act — and when not to.</p></div><span className="rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-700 text-mint">+27 pts recovery lift</span></div><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData} barGap={5}><CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 11 }} /><YAxis hide /><Tooltip content={<ChartTooltip />} /><Bar dataKey="baseline" name="Baseline" fill="var(--color-line)" radius={[5, 5, 0, 0]} /><Bar dataKey="recovered" name="RecoveryOS" fill="var(--color-brand)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></SectionCard><SectionCard className="col-span-12 lg:col-span-4"><h2 className="font-display text-[17px] font-700">Operating health</h2><div className="mt-4 space-y-4">{[["Recovery rate", health.recovery_rate, health.recovery_rate_detail, "brand"], ["Avg. time to recovery", health.avg_time_to_recovery, health.avg_time_detail, "mint"], ["Human escalation rate", health.human_escalation_rate, health.escalation_detail, "amber"], ["Stopped cases", String(health.stopped_cases), health.stopped_detail, "muted"]].map(([label, value, detail, tone]) => <div key={label} className="border-b border-line pb-3"><div className="flex items-end justify-between"><p className="text-[12px] text-muted">{label}</p><p className={`font-display text-[24px] font-800 text-${tone}`}>{value}</p></div><p className="mt-1 text-right text-[10px] text-muted">{detail}</p></div>)}</div></SectionCard></div><SectionCard className="mt-4"><div className="flex items-center justify-between"><h2 className="font-display text-[17px] font-700">Recovery performance by failure type</h2><span className="font-mono text-[10px] text-muted">30D · INR</span></div><div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">{performance.map((item) => <div key={item.label} className="rounded-2xl bg-paper p-4"><p className="text-[12px] font-600">{item.label}</p><p className={`mt-3 font-display text-[28px] font-800 text-${item.tone}`}>{item.rate}</p><p className="font-mono text-[11px] text-muted">{item.value} recovered</p><div className="mt-3 h-2 rounded-full bg-surface"><div className={`h-2 rounded-full bg-${item.tone}`} style={{ width: item.rate }} /></div></div>)}</div></SectionCard></RecoveryShell>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) { return <button aria-pressed={value} aria-label={value ? "Enabled" : "Disabled"} onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition ${value ? "bg-brand" : "bg-line"}`}><span className={`absolute top-1 size-4 rounded-full bg-surface transition ${value ? "left-6" : "left-1"}`} /></button>; }

export function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyConfigDTO>({
    max_automated_retries: 2,
    max_customer_reminders: 2,
    high_value_threshold: 50000,
    stop_after_repeated_failures: true,
    stop_after_successful_payment: true,
    pause_during_systemic_failure: true,
    human_review_low_confidence: true,
    confidence_threshold: 75,
    allowed_actions: ["Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"],
  });

  useEffect(() => {
    api.getPolicies().then(setPolicies).catch(console.error);
  }, []);

  const updateSetting = (key: keyof PolicyConfigDTO, value: any) => {
    const updated = { ...policies, [key]: value };
    setPolicies(updated);
    api.updatePolicies({ [key]: value }).catch(console.error);
  };

  return <RecoveryShell eyebrow="Control plane · Policies & Guardrails" title="The agent proposes. Policy decides." action={<PageAction><ShieldCheck size={14} />Policy engine active</PageAction>}><div className="mt-5 rounded-2xl bg-brand-soft p-4"><div className="flex items-start gap-3"><span className="grid size-8 place-items-center rounded-xl bg-surface text-brand"><ShieldCheck size={16} /></span><div><p className="text-[13px] font-700 text-brand">Safe automation, with an explicit boundary.</p><p className="mt-1 text-[12px] text-muted">RecoveryOS can diagnose and recommend an action, but no recovery action runs until these merchant policies allow it.</p></div></div></div><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"><PolicyCard title="Retry limits" detail="Prevent repeated issuer pressure and duplicate attempts."><PolicyRow label="Maximum automated retries" detail="Per payment" control={<input aria-label="Maximum automated retries" value={policies.max_automated_retries} onChange={(e) => updateSetting("max_automated_retries", parseInt(e.target.value) || 2)} className="w-16 rounded-xl border border-line bg-paper px-3 py-2 text-center text-sm font-700 outline-none focus:border-brand" />} /><PolicyRow label="Stop after repeated failures" detail="After 3 failed attempts" control={<Toggle value={policies.stop_after_repeated_failures} onChange={(v) => updateSetting("stop_after_repeated_failures", v)} />} /><PolicyRow label="Stop after successful payment" detail="Always enabled" control={<Toggle value={policies.stop_after_successful_payment} onChange={(v) => updateSetting("stop_after_successful_payment", v)} />} /></PolicyCard><PolicyCard title="Value protection" detail="Escalate decisions where the downside deserves a human check."><PolicyRow label="High-value payment threshold" detail="Human approval required above" control={<div className="flex items-center gap-1"><span className="text-muted">₹</span><input aria-label="High-value payment threshold" value={policies.high_value_threshold} onChange={(e) => updateSetting("high_value_threshold", parseFloat(e.target.value) || 50000)} className="w-24 rounded-xl border border-line bg-paper px-3 py-2 text-center text-sm font-700 outline-none focus:border-brand" /></div>} /><PolicyRow label="Human review when AI confidence is low" detail="Below 75% confidence" control={<Toggle value={policies.human_review_low_confidence} onChange={(v) => updateSetting("human_review_low_confidence", v)} />} /></PolicyCard><PolicyCard title="Customer contact" detail="Keep outreach useful, timely and respectful."><PolicyRow label="Maximum customer reminders" detail="Per payment" control={<input aria-label="Maximum customer reminders" value={policies.max_customer_reminders} onChange={(e) => updateSetting("max_customer_reminders", parseInt(e.target.value) || 2)} className="w-16 rounded-xl border border-line bg-paper px-3 py-2 text-center text-sm font-700 outline-none focus:border-brand" />} /><PolicyRow label="Outreach during systemic failure" detail="Pause automatically" control={<Toggle value={policies.pause_during_systemic_failure} onChange={(v) => updateSetting("pause_during_systemic_failure", v)} />} /></PolicyCard><PolicyCard title="Agent permissions" detail="The intervention set stays intentionally focused."><div className="grid grid-cols-2 gap-2">{policies.allowed_actions.map((action) => <div key={action} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-[12px] font-600"><Check size={14} className="text-mint" />{action}</div>)}</div><div className="mt-4 rounded-xl bg-mint-soft p-3 text-[11px] text-ink/80"><span className="font-700 text-mint">Live guardrail:</span> Systemic payment protection is {policies.pause_during_systemic_failure ? "on" : "off"}. {policies.pause_during_systemic_failure ? "Customer outreach will pause when failure clusters are detected." : "Review before re-enabling automated outreach."}</div></PolicyCard></div></RecoveryShell>;
}

function PolicyCard({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) { return <SectionCard><h2 className="font-display text-[17px] font-700">{title}</h2><p className="mt-1 text-[12px] text-muted">{detail}</p><div className="mt-4">{children}</div></SectionCard>; }
function PolicyRow({ label, detail, control }: { label: string; detail: string; control: React.ReactNode }) { return <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0"><div><p className="text-[12px] font-600">{label}</p><p className="mt-0.5 text-[10px] text-muted">{detail}</p></div>{control}</div>; }

export function AuditPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditEventDTO[]>([]);

  useEffect(() => {
    api.getAuditLogs(search).then(setAudits).catch(console.error);
  }, [search]);

  return <RecoveryShell eyebrow="Governance · Audit Log" title="Every AI decision leaves a receipt." action={<PageAction variant="secondary"><Download size={14} />Export log</PageAction>}><div className="mt-5 flex flex-wrap gap-3"><label className="flex min-w-72 flex-1 items-center rounded-2xl border border-line bg-surface px-3 text-sm text-muted"><Search size={15} className="mr-2" /><input aria-label="Search audit log" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search decisions, cases or reasons" className="w-full bg-transparent py-2.5 outline-none placeholder:text-muted" /></label><div className="flex items-center gap-2 rounded-2xl bg-mint-soft px-3 py-2 text-[12px] font-700 text-mint"><ShieldCheck size={15} />Immutable decision records</div></div><SectionCard className="mt-4 overflow-hidden !p-0"><div className="divide-y divide-line">{audits.map((event) => <div key={event.id}><button onClick={() => setSelected(selected === event.id ? null : event.id)} className="grid w-full grid-cols-[100px_1fr_110px_110px] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-paper cursor-pointer"><span className="font-mono text-[10px] text-muted">{event.time}<br />{event.id}</span><span><span className="block text-[13px] font-700">{event.what}</span><span className="mt-0.5 block text-[11px] text-muted">{event.caseId} · {event.why}</span></span><span className="text-[11px] text-muted">{event.outcome}</span><span className="text-right font-mono text-[12px] font-700 text-mint">{event.recovered ? formatINR(event.recovered) : "—"}</span></button>{selected === event.id && <div className="grid gap-4 bg-paper px-5 pb-5 pt-1 text-[12px] md:grid-cols-4"><div><p className="font-mono text-[10px] uppercase text-muted">What happened?</p><p className="mt-1 font-600">{event.what}</p></div><div><p className="font-mono text-[10px] uppercase text-muted">Why?</p><p className="mt-1 text-muted">{event.why}</p></div><div><p className="font-mono text-[10px] uppercase text-muted">Policy decision</p><p className="mt-1 text-muted">{event.policy}</p></div><div><p className="font-mono text-[10px] uppercase text-muted">Outcome</p><p className="mt-1 font-600">{event.outcome}</p></div></div>}</div>)}</div></SectionCard></RecoveryShell>;
}