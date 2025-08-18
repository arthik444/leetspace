import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/context/DemoContext";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Layers, BookOpen, Target, ListChecks, Timer, Code2, Sparkles } from "lucide-react";

export default function Landing() {
  const { user, initialized } = useAuth();
  const { isDemo, setDemo } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    if ((initialized && user) || isDemo) {
      navigate("/dashboard", { replace: true });
    }
  }, [initialized, user, navigate, isDemo]);

  if (isDemo) return null;

  return (
    <div className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-900/30 dark:to-zinc-900" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                <Sparkles className="size-4" />
                <span>Journal, not a feed</span>
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">
                A private coding journal for real interview progress.
              </h1>
              <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Log what mattered. Track versions and mistakes. Review fast.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/auth" className="cursor-pointer">
                    Start your journal
                    <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto border border-indigo-300 bg-white/90 text-indigo-700 shadow-sm hover:bg-indigo-50/80 dark:bg-zinc-900/70 dark:text-indigo-200 dark:hover:bg-zinc-800/70">
                  <Link to="/sample/problem" className="cursor-pointer">View sample problem</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { setDemo(true); navigate("/dashboard"); }}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Explore demo workspace
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400 sm:ml-1">Built for serious interview prep</span>
              </div>
            </div>
            <div className="relative">
              <HeroComposite />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <BenefitCard icon={<BookOpen className="size-5" />} title="Selective logging" desc="Capture only high‑signal problems with tags, notes, time, and difficulty." visual={<MiniChipRowVisual />} />
          <BenefitCard icon={<Layers className="size-5" />} title="Multiple solutions" desc="Save Python/JS/Java approaches and record trade‑offs." visual={<MiniDiffBarsVisual />} />
          <BenefitCard icon={<Target className="size-5" />} title="Intentional review" desc={"Use “retry later” and filters for fast, focused review."} visual={<MiniFilterChipsVisual />} />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
        <ol className="mt-6 grid md:grid-cols-3 gap-6">
          <StepCard
            num="1"
            title="Log a problem"
            desc="Add notes, mistakes, and solution versions."
            visual={<StepVisual kind="log" />}
          />
          <StepCard
            num="2"
            title="Tag + retry"
            desc="Tag by topic/difficulty and mark “retry later”."
            visual={<StepVisual kind="tag" />}
          />
          <StepCard
            num="3"
            title="Review with intent"
            desc="Target weak spots using Insights and filters."
            visual={<StepVisual kind="review" />}
          />
        </ol>
      </section>

      {/* Feature deep‑dive */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">What you get</h2>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ListChecks className="size-5" />}
            title="Problem Log"
            desc="Title, link, difficulty, tags, time, notes, mistakes, retry flag."
            visual={<MiniFormVisual />}
          />
          <FeatureCard
            icon={<Code2 className="size-5" />}
            title="Multi‑Version"
            desc="Store alternative solutions; add rationale and complexity notes."
            visual={<MiniCodeDiffVisual />}
          />
          <FeatureCard
            icon={<Target className="size-5" />}
            title="Insights Dashboard"
            desc="Totals, difficulty mix, topic coverage, time invested, mistake patterns."
            visual={<MiniInsightsVisual />}
          />
          <FeatureCard
            icon={<Timer className="size-5" />}
            title="Review Mode"
            desc={"Filters for tag/difficulty and a “retry later” queue."}
            visual={<MiniReviewVisual />}
          />
          <FeatureCard
            icon={<Layers className="size-5" />}
            title="Topic Tagging"
            desc="DS/Algo taxonomy (Arrays, Graphs, DP, Sliding Window, BFS/DFS)."
            visual={<MiniTagGridVisual />}
          />
          <FeatureCard
            icon={<Target className="size-5" />}
            title="Company Focus"
            desc="Group problems by company tag for targeted review sets."
            visual={<MiniCompanyTagsVisual />}
          />
        </div>
        {/* Mid-page CTA */}
        <div className="mt-10 flex items-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth" className="cursor-pointer">Start your journal</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="border border-indigo-300 bg-white/90 text-indigo-700 shadow-sm hover:bg-indigo-50/80 dark:bg-zinc-900/70 dark:text-indigo-200 dark:hover:bg-zinc-800/70">
            <Link to="/sample/problem" className="cursor-pointer">View sample problem</Link>
          </Button>
        </div>
      </section>

      {/* Security & privacy */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Security & privacy</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <BenefitCard icon={<ShieldIcon />} title="Private by default" desc="Your journal is private unless you choose to share (coming soon)." visual={<MiniDocVisual />} />
          <BenefitCard icon={<LockIcon />} title="Trusted auth" desc="Sign in with Firebase Auth; no passwords stored by us." visual={<MiniLinesVisual />} />
          <BenefitCard icon={<DownloadIcon />} title="Export anytime" desc="Export entries to CSV when you need a backup." visual={<MiniLinesVisual />} />
        </div>
      </section>

      {/* Supported languages */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Supported languages</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Chip label="Python" />
          <Chip label="JavaScript" />
          <Chip label="Java" />
          <Chip label="C++" />
          <Chip label="More via plain text" />
        </div>
      </section>

      {/* Visual previews */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold">Algorithm patterns at a glance</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">A visual map of core patterns helps connect concepts across problems.</p>
          </div>
          <PreviewImage src="/pattern-tiles.png" alt="Algorithm pattern tiles" fallback={<PatternTilesGraphic />} />
        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold">Review Mode, built for speed</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Filter by difficulty and topic. Focus on your “retry later” queue.</p>
          </div>
          <PreviewImage src="/review-mode.png" alt="Review mode with filters and retry queue" fallback={<ReviewModeGraphic />} />
        </div>
      </section>

      {/* Sample log snapshot */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Sample log snapshot</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <LogCard
            title="Two Sum"
            meta="Easy • Array, Hashmap • 15m"
            notes="Consider space‑time tradeoff"
            mistakes="Forgot duplicate handling initially"
            versions="Python O(n) hash map; JS two‑pass"
            retry="No"
          />
          <LogCard
            title="Longest Substring Without Repeating"
            meta="Medium • String, Sliding Window • 28m"
            notes="Track window boundaries carefully"
            mistakes="Off‑by‑one on shrink step"
            versions="JS sliding window; Python dict window"
            retry="Yes"
          />
          <LogCard
            title="Course Schedule"
            meta="Medium • Graph, BFS • 34m"
            notes="Kahn’s algorithm for cycle detection"
            mistakes="Missed indegree init edge case"
            versions="Python queue BFS; JS adjacency list"
            retry="Yes"
          />
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Built for your journey</h2>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UseCase title="FAANG prep" desc="Focused log + mistake patterns → confident onsite review." visual={<MiniTimelineVisual />} />
          <UseCase title="CS student" desc="Tags align with course topics → weekly weak‑area review." visual={<MiniTagGridVisual className="max-h-16 overflow-hidden" />} />
          <UseCase title="Bootcamp" desc="Daily 2–3 problem cadence → company‑specific sets." visual={<MiniChecklistVisual />} />
          <UseCase title="Senior dev" desc="Hard problems, multiple approaches → mentoring notes." visual={<MiniDocVisual />} />
        </div>
      </section>

      {/* Why it works */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Why it works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <BenefitCard icon={<BookOpen className="size-5" />} title="Journal, not a feed" desc="Depth over volume. Reflect, don’t grind." visual={<MiniDocVisual />} />
          <BenefitCard icon={<Code2 className="size-5" />} title="Your editorial" desc="Explanations in your words—what you’ll recall under pressure." visual={<MiniLinesVisual />} />
          <BenefitCard icon={<Target className="size-5" />} title="Review triggers" desc={'“Retry later” makes learning sticky and targeted.'} visual={<MiniRetryChipVisual />} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Testimonial quote="Half the time, twice the impact." author="Sarah" role="Backend Engineer" />
          <Testimonial quote="My weak areas were obvious—and fixable." author="Alex" role="CS Student" />
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 p-8 md:p-10 bg-white/80 dark:bg-zinc-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">Ready to practice smarter?</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Start your journal and make every review count.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/auth" className="cursor-pointer">Start your journal</Link>
          </Button>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-4 inset-x-0 px-4 md:hidden z-40">
        <div className="mx-auto max-w-md rounded-full bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 p-2 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">Ready to start?</div>
            <Button asChild size="sm">
              <Link to="/auth" className="cursor-pointer">Start free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroComposite() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const maxTilt = 6; // deg
    const rotateY = ((x - midX) / midX) * maxTilt;
    const rotateX = -((y - midY) / midY) * maxTilt;
    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.01)`);
  };

  const handleLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 overflow-hidden"
      style={{ transform, transition: "transform 150ms ease" }}
    >
      {/* Ambient visuals */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-transparent to-cyan-100/40 dark:from-indigo-900/30 dark:via-transparent dark:to-cyan-900/20" />
      <div className="absolute -inset-24 opacity-40 blur-2xl bg-[radial-gradient(60%_50%_at_50%_50%,theme(colors.indigo.400/.4),transparent)] dark:bg-[radial-gradient(60%_50%_at_50%_50%,theme(colors.indigo.500/.35),transparent)]" />

      {/* In-code UI mock */}
      <div className="relative z-10 h-full w-full p-5 md:p-8">
        <div className="grid grid-cols-2 gap-5 h-full">
          {/* Left: Add Problem panel */}
          <div className="col-span-2 md:col-span-1 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-4">
            <div className="text-[11px] font-mono text-gray-600 dark:text-gray-300"><span className="text-gray-500">Title:</span> Two Sum</div>
            <div className="mt-1 text-[11px] font-mono text-gray-600 dark:text-gray-300"><span className="text-gray-500">URL:</span> leetcode.com/problems/two-sum</div>
            <div className="mt-1 flex gap-2">
              <Chip label="Array" />
              <Chip label="Hashmap" />
              <Chip label="Easy" />
            </div>
            <div className="mt-2 text-[11px] font-mono text-gray-600 dark:text-gray-300"><span className="text-gray-500">Time:</span> 15m</div>
            <div className="mt-2 rounded border border-gray-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-800/60 p-2">
              <div className="text-[11px] font-mono text-gray-700 dark:text-gray-200">Notes: Consider space–time tradeoff.</div>
              <div className="mt-1 text-[11px] font-mono text-gray-700 dark:text-gray-200">Mistakes: Forgot duplicate handling.</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><Check className="size-3" /> Retry later</div>
              <div className="h-8 w-24 rounded-md bg-indigo-600/90" />
            </div>
          </div>

          {/* Right: Insights + Retry list */}
          <div className="hidden md:flex col-span-1 flex-col gap-5">
            <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-4">
              <div className="h-4 w-28 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="mt-4 grid grid-cols-5 items-end gap-2 h-24">
                <Bar h="h-10" />
                <Bar h="h-16" />
                <Bar h="h-7" />
                <Bar h="h-20" />
                <Bar h="h-12" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="mt-3 space-y-2">
                <ListRow title="Two Sum" subtitle="Array • Easy" chip="retry" />
                <ListRow title="Course Schedule" subtitle="Graph • Medium" chip="retry" />
                <ListRow title="Longest Substring" subtitle="String • Medium" chip="retry" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewImage({ src, alt, fallback }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  const move = (e) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const maxTilt = 5;
    const rotateY = ((x - midX) / midX) * maxTilt;
    const rotateX = -((y - midY) / midY) * maxTilt;
    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.01)`);
  };

  const leave = () => setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className="relative rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 overflow-hidden"
      style={{ transform, transition: "transform 150ms ease" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-transparent to-cyan-100/40 dark:from-indigo-900/30 dark:via-transparent dark:to-cyan-900/20" />
      <div className="relative z-10 w-full h-full">
        {fallback}
      </div>
      {!failed && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 z-20 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function PatternTilesGraphic() {
  const cols = 8;
  const rows = 4;
  const tileW = 72;
  const tileH = 36;
  const gap = 16;
  const width = cols * tileW + (cols - 1) * gap;
  const height = rows * tileH + (rows - 1) * gap;
  const tiles = Array.from({ length: rows }).flatMap((_, r) =>
    Array.from({ length: cols }).map((__, c) => ({ x: c * (tileW + gap), y: r * (tileH + gap), key: `${r}-${c}` }))
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="tileGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.45)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0.45)" />
        </linearGradient>
      </defs>
      {/* connections */}
      {tiles.map((t) => (
        <g key={`g-${t.key}`}>
          {t.x + tileW + gap < width && (
            <line x1={t.x + tileW} y1={t.y + tileH / 2} x2={t.x + tileW + gap} y2={t.y + tileH / 2} stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
          )}
          {t.y + tileH + gap < height && (
            <line x1={t.x + tileW / 2} y1={t.y + tileH} x2={t.x + tileW / 2} y2={t.y + tileH + gap} stroke="rgba(34,211,238,0.25)" strokeWidth="1" />
          )}
        </g>
      ))}
      {/* tiles */}
      {tiles.map((t) => (
        <rect key={`r-${t.key}`} x={t.x} y={t.y} rx="8" ry="8" width={tileW} height={tileH} fill="url(#tileGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function ReviewModeGraphic() {
  return (
    <div className="p-5 md:p-6">
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-4">
        <div className="flex flex-wrap gap-2">
          <Chip label="Easy" />
          <Chip label="Medium" />
          <Chip label="Hard" />
          <Chip label="Arrays" />
          <Chip label="Graphs" />
          <Chip label="DP" />
        </div>
        <div className="mt-4 space-y-2">
          <ListRow title="Two Sum" subtitle="Arrays • Easy" chip="retry" />
          <ListRow title="Course Schedule" subtitle="Graphs • Medium" chip="retry" />
          <ListRow title="Longest Substring" subtitle="Strings • Medium" chip="retry" />
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, desc, visual }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">{icon}<span className="sr-only">icon</span></div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
      {visual && <div className="mt-4">{visual}</div>}
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <li className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Step {num}</div>
      <div className="mt-1 text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</div>
    </li>
  );
}

function StepCard({ num, title, desc, visual }) {
  return (
    <li className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Step {num}</div>
      <div className="mt-1 text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</div>
      <div className="mt-4">
        {visual}
      </div>
    </li>
  );
}

function StepVisual({ kind }) {
  if (kind === 'log') {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
        <div className="text-[11px] font-mono text-gray-700 dark:text-gray-200"><span className="text-gray-500">Title:</span> Two Sum</div>
        <div className="mt-1 text-[11px] font-mono text-gray-700 dark:text-gray-200"><span className="text-gray-500">URL:</span> leetcode.com/problems/two-sum</div>
        <div className="mt-2 flex gap-2">
          <Chip label="Array" />
          <Chip label="Hashmap" />
        </div>
        <div className="mt-2 rounded border border-gray-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-800/60 p-2 text-[11px] font-mono text-gray-700 dark:text-gray-200">Notes: Consider space–time tradeoff.</div>
      </div>
    );
  }
  if (kind === 'tag') {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
        <div className="flex flex-wrap gap-2">
          <Chip label="Easy" />
          <Chip label="Medium" />
          <Chip label="Arrays" />
          <Chip label="Graphs" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2"><Check className="size-3" /> Retry later</div>
          <div className="h-6 w-16 rounded bg-indigo-500/80" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
      <div className="flex flex-wrap gap-2">
        <Chip label="Medium" />
        <Chip label="Sliding Window" />
      </div>
      <div className="mt-3 space-y-2">
        <ListRow title="Longest Substring" subtitle="Sliding Window • Medium" chip="retry" />
        <ListRow title="Course Schedule" subtitle="Graph BFS • Medium" chip="retry" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, visual }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">{icon}<span className="sr-only">icon</span></div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
      <div className="mt-4">
        {visual}
      </div>
    </div>
  );
}


function MiniFormVisual() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
      <div className="text-[11px] font-mono text-gray-700 dark:text-gray-200"><span className="text-gray-500">Title:</span> Two Sum</div>
      <div className="mt-1 text-[11px] font-mono text-gray-700 dark:text-gray-200"><span className="text-gray-500">Difficulty:</span> Easy</div>
      <div className="mt-2 flex gap-2">
        <Chip label="Array" />
        <Chip label="Two Pointers" />
      </div>
    </div>
  );
}

function MiniCodeDiffVisual() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50 grid grid-cols-2 gap-3">
      <div className="rounded-md bg-gray-50 dark:bg-zinc-800 p-2">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">Python</div>
        <div className="mt-2 space-y-1">
          <div className="h-2 w-10/12 rounded bg-gray-300 dark:bg-zinc-700" />
          <div className="h-2 w-7/12 rounded bg-gray-300 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="rounded-md bg-gray-50 dark:bg-zinc-800 p-2">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">JavaScript</div>
        <div className="mt-2 space-y-1">
          <div className="h-2 w-11/12 rounded bg-gray-300 dark:bg-zinc-700" />
          <div className="h-2 w-6/12 rounded bg-gray-300 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

function MiniInsightsVisual() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
      <div className="grid grid-cols-5 items-end gap-2 h-16">
        <Bar h="h-6" />
        <Bar h="h-10" />
        <Bar h="h-8" />
        <Bar h="h-12" />
        <Bar h="h-9" />
      </div>
    </div>
  );
}

function MiniReviewVisual() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50">
      <div className="flex flex-wrap gap-2">
        <Chip label="Hard" />
        <Chip label="Graphs" />
      </div>
      <div className="mt-2 space-y-2">
        <ListRow title="Course Schedule" subtitle="Topological Sort • Medium" chip="retry" />
        <ListRow title="Shortest Path" subtitle="Dijkstra • Medium" chip="retry" />
      </div>
    </div>
  );
}

function MiniTagGridVisual({ className = "" }) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50 flex flex-wrap gap-2 ${className}`}>
      <Chip label="DP" />
      <Chip label="Greedy" />
      <Chip label="Stack" />
      <Chip label="Queue" />
      <Chip label="Tree" />
      <Chip label="Binary Search" />
    </div>
  );
}

function MiniCompanyTagsVisual() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 bg-white/60 dark:bg-zinc-800/50 flex flex-wrap gap-2">
      <Chip label="Google" />
      <Chip label="Meta" />
      <Chip label="Amazon" />
      <Chip label="Netflix" />
      <Chip label="Apple" />
    </div>
  );
}

function LogCard({ title, meta, notes, mistakes, versions, retry }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${retry === 'Yes' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{retry === 'Yes' ? 'Retry' : 'Good'}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{meta}</div>
      <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <li className="flex gap-2"><span className="min-w-16 text-gray-500 dark:text-gray-400">Notes</span><span className="flex-1">{notes}</span></li>
        <li className="flex gap-2"><span className="min-w-16 text-gray-500 dark:text-gray-400">Mistakes</span><span className="flex-1">{mistakes}</span></li>
        <li className="flex gap-2"><span className="min-w-16 text-gray-500 dark:text-gray-400">Versions</span><span className="flex-1">{versions}</span></li>
      </ul>
      {/* Mini two-language graphic */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-gray-50 dark:bg-zinc-800 p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">Py</div>
          <div className="mt-1 space-y-1">
            <div className="h-2 w-9/12 rounded bg-gray-300 dark:bg-zinc-700" />
            <div className="h-2 w-7/12 rounded bg-gray-300 dark:bg-zinc-700" />
          </div>
        </div>
        <div className="rounded-md bg-gray-50 dark:bg-zinc-800 p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">JS</div>
          <div className="mt-1 space-y-1">
            <div className="h-2 w-10/12 rounded bg-gray-300 dark:bg-zinc-700" />
            <div className="h-2 w-6/12 rounded bg-gray-300 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

function UseCase({ title, desc, visual }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
      {visual && <div className="mt-4">{visual}</div>}
    </div>
  );
}

function Testimonial({ quote, author, role }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-6 bg-white/80 dark:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-gray-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
        </div>
      </div>
      <p className="mt-3 text-base">“{quote}”</p>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">— {author}, {role}</div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const mql = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined), []);
  const [reduced, setReduced] = useState(mql?.matches || false);
  useEffect(() => {
    if (!mql) return;
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, [mql]);
  return reduced;
}

function SkeletonLine({ w = "w-3/4" }) {
  return <div className={`h-8 ${w} rounded-md bg-gray-100 dark:bg-zinc-800`} />;
}

function Chip({ label }) {
  return (
    <div className="px-2.5 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200/70 dark:border-indigo-700/50">
      {label || 'Tag'}
    </div>
  );
}

function Bar({ h = "h-12" }) {
  return <div className={`w-6 ${h} rounded bg-indigo-400/70 dark:bg-indigo-500/70`} />;
}

function ListRow({ title = "Two Sum", subtitle = "Arrays • Easy", chip }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-700 p-2 bg-white/60 dark:bg-zinc-800/50">
      <div>
        <div className="text-[12px] font-medium text-gray-800 dark:text-gray-100">{title}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</div>
      </div>
      <div className="flex items-center gap-2">
        {chip === 'retry' && (
          <div className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">retry</div>
        )}
      </div>
    </div>
  );
}

function MiniChipRowVisual() {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Array" />
      <Chip label="Hashmap" />
      <Chip label="DP" />
    </div>
  );
}

function MiniDiffBarsVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <div className="h-2 w-10/12 rounded bg-gray-300 dark:bg-zinc-700" />
        <div className="h-2 w-7/12 rounded bg-gray-300 dark:bg-zinc-700" />
      </div>
      <div className="space-y-1">
        <div className="h-2 w-11/12 rounded bg-gray-300 dark:bg-zinc-700" />
        <div className="h-2 w-6/12 rounded bg-gray-300 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

function MiniFilterChipsVisual() {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Medium" />
      <Chip label="Graphs" />
      <Chip label="Retry" />
    </div>
  );
}

function MiniDocVisual() {
  return (
    <div className="rounded-md border border-gray-200 dark:border-zinc-700 p-2 bg-white/50 dark:bg-zinc-800/40 space-y-1">
      <div className="h-2 w-9/12 rounded bg-gray-300 dark:bg-zinc-700" />
      <div className="h-2 w-7/12 rounded bg-gray-300 dark:bg-zinc-700" />
      <div className="h-2 w-8/12 rounded bg-gray-300 dark:bg-zinc-700" />
    </div>
  );
}

function MiniLinesVisual() {
  return (
    <div className="space-y-1">
      <div className="h-2 w-10/12 rounded bg-gray-300 dark:bg-zinc-700" />
      <div className="h-2 w-7/12 rounded bg-gray-300 dark:bg-zinc-700" />
    </div>
  );
}

function MiniRetryChipVisual() {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">retry</div>
      <div className="h-2 w-10 rounded bg-gray-300 dark:bg-zinc-700" />
    </div>
  );
}

function MiniTimelineVisual() {
  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded bg-indigo-300/60 dark:bg-indigo-700/50" />
      <div className="h-2 w-10/12 rounded bg-indigo-300/60 dark:bg-indigo-700/50" />
      <div className="h-2 w-8/12 rounded bg-indigo-300/60 dark:bg-indigo-700/50" />
    </div>
  );
}

function MiniChecklistVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="size-3 rounded bg-green-400" />
        <div className="h-2 w-28 rounded bg-gray-300 dark:bg-zinc-700" />
      </div>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded bg-green-400" />
        <div className="h-2 w-24 rounded bg-gray-300 dark:bg-zinc-700" />
      </div>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded bg-green-400" />
        <div className="h-2 w-32 rounded bg-gray-300 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

function ShieldIcon() {
  return <div className="size-5 rounded bg-indigo-200 dark:bg-indigo-800" />;
}
function LockIcon() {
  return <div className="size-5 rounded bg-cyan-200 dark:bg-cyan-800" />;
}
function DownloadIcon() {
  return <div className="size-5 rounded bg-pink-200 dark:bg-pink-800" />;
}