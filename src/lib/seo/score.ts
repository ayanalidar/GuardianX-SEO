// RankForge SEO — composite SEO health score (0-100)
// Weighted blend of visibility, technical health, keyword performance, and backlink authority.

type ScoreInput = {
  latest: {
    visibilityScore: number;
    avgPosition: number;
    domainAuthority: number;
    bounceRate: number;
    avgLoadTime: number;
    ctr: number;
  } | null;
  issues: { severity: string; status: string }[];
  keywords: { position: number }[];
  backlinks: { domainAuthority: number; linkType: string; status: string }[];
};

export function computeSeoScore(input: ScoreInput): {
  total: number;
  breakdown: { label: string; score: number; weight: number }[];
} {
  const { latest, issues, keywords, backlinks } = input;

  // 1. Visibility score (0-100)
  const visibility = latest?.visibilityScore ?? 0;

  // 2. Technical health — penalize open critical/warning issues
  const openCritical = issues.filter((i) => i.severity === "critical" && i.status === "open").length;
  const openWarning = issues.filter((i) => i.severity === "warning" && i.status === "open").length;
  const techHealth = Math.max(
    0,
    100 - openCritical * 12 - openWarning * 4
  );

  // 3. Keyword performance — % of keywords in top 10
  const top10 = keywords.filter((k) => k.position <= 10).length;
  const keywordPerf = keywords.length > 0 ? (top10 / keywords.length) * 100 : 0;

  // 4. Backlink authority — avg DA of active dofollow links (capped 100)
  const activeDofollow = backlinks.filter(
    (b) => b.status === "active" && b.linkType === "dofollow"
  );
  const avgDA =
    activeDofollow.length > 0
      ? activeDofollow.reduce((s, b) => s + b.domainAuthority, 0) / activeDofollow.length
      : 0;
  const backlinkScore = Math.min(100, avgDA * 1.15);

  // 5. Page experience — load time + bounce + ctr composite
  const loadScore = latest
    ? Math.max(0, 100 - Math.max(0, latest.avgLoadTime - 1.5) * 30)
    : 50;
  const bounceScore = latest ? Math.max(0, 100 - (latest.bounceRate - 30) * 1.2) : 50;
  const ctrScore = latest ? Math.min(100, latest.ctr * 12) : 50;
  const experience = (loadScore + bounceScore + ctrScore) / 3;

  const breakdown = [
    { label: "Visibility", score: Math.round(visibility), weight: 0.28 },
    { label: "Technical Health", score: Math.round(techHealth), weight: 0.24 },
    { label: "Keyword Performance", score: Math.round(keywordPerf), weight: 0.2 },
    { label: "Backlink Authority", score: Math.round(backlinkScore), weight: 0.16 },
    { label: "Page Experience", score: Math.round(experience), weight: 0.12 },
  ];

  const total = Math.round(
    breakdown.reduce((sum, b) => sum + b.score * b.weight, 0)
  );

  return { total: Math.min(100, Math.max(0, total)), breakdown };
}

export function scoreGrade(score: number): {
  grade: string;
  label: string;
  color: string;
} {
  if (score >= 85) return { grade: "A+", label: "Excellent", color: "#10b981" };
  if (score >= 75) return { grade: "A", label: "Strong", color: "#22c55e" };
  if (score >= 65) return { grade: "B", label: "Good", color: "#84cc16" };
  if (score >= 50) return { grade: "C", label: "Average", color: "#f59e0b" };
  if (score >= 35) return { grade: "D", label: "Weak", color: "#f97316" };
  return { grade: "F", label: "Critical", color: "#ef4444" };
}
