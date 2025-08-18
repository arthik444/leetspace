import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeViewer from "@/components/CodeViewer";
import MDEditor from "@uiw/react-md-editor";

export default function SampleProblem() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const problem = {
    title: "LeetSpace Mission: From Chaos to Clarity",
    url: "https://warp.leetspace.dev/missions/chaos-to-clarity",
    difficulty: "Easy",
    date_solved: "2025-02-14",
    retry_later: "Yes",
    tags: [
      "Product Tour",
      "Journal",
      "Multi‑Version",
      "Insights",
      "Review Mode",
      "SRS"
    ],
    notes: `# LeetSpace Mission: From Chaos to Clarity

You used to grind problems and scatter notes across tabs and docs. Today’s mission: **turn raw practice into a private coding journal** that’s fast to review and hard to forget.

## What you’ll do
1. **Log what mattered**
   - Title, link, difficulty, tags, time, notes, mistakes, retry‑later
2. **Track multiple solutions**
   - Save Python/JS/Java with trade‑offs
3. **Review with intent**
   - Use \`retry later\` + filters; get a daily mission
4. **See your patterns**
   - Difficulty mix, topic coverage, time invested, mistake themes

## Why this works
- A **journal, not a feed**: depth > volume
- **Your editorial**: you’ll recall your own words under pressure
- **Review triggers**: revisit at the right time; build long‑term memory

> Pro tip: Keep entries short and honest. Mark “retry later” for anything fuzzy. Small wins compound.

## Example entry (minimal)
- Title: “Sliding Window Max”
- Difficulty: Medium; Tags: [Array, Sliding Window]
- Notes: “Boundaries off by one; track both ends carefully.”
- Mistakes: “Shrank too early; forgot to pop from left when stale.”
- Retry later: Yes

## Self‑check
- Did you log **what you learned** (not everything)?
- Did you add **at least one** alternative solution?
- Did you tag **why** you’ll revisit (retry‑later)?
`,
    solutions: [
      {
        language: "json",
        code: `{
  "title": "Sliding Window Max",
  "url": "https://example.dev/sliding-window-max",
  "difficulty": "Medium",
  "tags": ["Array", "Sliding Window"],
  "timeTakenMin": 28,
  "notes": "Boundaries off by one; track both ends carefully.",
  "mistakes": "Shrank too early; forgot to pop from left when stale.",
  "retryLater": true,
  "versions": [
    { "language": "Python", "rationale": "Deque O(n)" },
    { "language": "JavaScript", "rationale": "Deque O(n)" }
  ]
}`
      },
      {
        language: "python",
        code: `def daily_mission(entries, max_items=3):
    retry = [e for e in entries if e.get("retryLater")]
    if retry:
        return retry[:max_items]
    # otherwise target weakest tags
    tag_count = {}
    for e in entries:
        for t in e.get("tags", []):
            tag_count[t] = tag_count.get(t, 0) + 1
    weakest = sorted(tag_count, key=tag_count.get)[:2]
    picks = [e for e in entries if any(t in weakest for t in e.get("tags", []))]
    return picks[:max_items]`
      },
      {
        language: "javascript",
        code: `function insights(entries){
  const res = {
    byDifficulty: {},
    tagCounts: {},
    totalTimeMin: 0,
  }
  for (const e of entries){
    res.byDifficulty[e.difficulty] = (res.byDifficulty[e.difficulty]||0)+1
    for (const t of (e.tags||[])) res.tagCounts[t]=(res.tagCounts[t]||0)+1
    res.totalTimeMin += e.timeTakenMin||0
  }
  return res
}`
      }
    ]
  };

  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }[problem.difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-black dark:text-white bg-white dark:bg-zinc-900 min-h-screen">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{problem.title}</h1>
            <a href="/oops" title="Demo link" className="text-muted-foreground hover:text-blue-600">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto border border-indigo-300 bg-white/90 text-indigo-700 hover:bg-indigo-50/80 dark:bg-zinc-900/70 dark:text-indigo-200 dark:hover:bg-zinc-800/70">
              <Link to="/" className="cursor-pointer">Back</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto shadow-sm border border-indigo-300">
              <Link to="/auth" className="cursor-pointer">Start your journal</Link>
            </Button>
          </div>
        </div>
        {problem.retry_later === "Yes" && (
          <div className="text-sm text-orange-600 dark:text-orange-300 italic">
            You marked this problem to revisit later.
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor}`}>{problem.difficulty}</span>
          <span className="text-muted-foreground dark:text-gray-400">•</span>
          <span className="text-muted-foreground dark:text-gray-400">Feb 14, 2025</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 rounded-md text-xs bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200">{tag}</span>
        ))}
        <span className="px-2 py-1 rounded-md text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Retry later</span>
      </div>

      <div data-color-mode={theme} className="prose dark:prose-invert max-w-none !bg-white dark:!bg-zinc-900">
        <MDEditor.Markdown
          source={problem.notes}
          className="!bg-white dark:!bg-zinc-900 p-4 rounded-md"
          style={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', padding: '1rem', borderRadius: '0.5rem' }}
        />
      </div>

      <div className="space-y-6">
        {problem.solutions.map((sol, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-muted/40 dark:bg-zinc-900 shadow-sm p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Solution {idx + 1} ({sol.language})</div>
            <div className="overflow-x-auto rounded-md bg-background dark:bg-zinc-800">
              <CodeViewer language={sol.language} code={sol.code} theme={theme} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}