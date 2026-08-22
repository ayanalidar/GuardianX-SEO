// Shared RankForge types (mirror of Prisma models used on the client)

export type Domain = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
};

export type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoText: string;
  industry: string;
  location: string;
  description: string;
  employees: string;
  foundedYear: number;
  latest: SeoMetric | null;
  kwCount: number;
  blCount: number;
  issueCount: number;
  trafficDelta: number;
};

export type DomainWithCompanies = Domain & {
  companies: CompanySummary[];
};

export type SeoMetric = {
  id: string;
  companyId: string;
  date: string; // ISO
  organicTraffic: number;
  keywordsRanked: number;
  backlinks: number;
  referringDomains: number;
  domainAuthority: number;
  pageAuthority: number;
  avgPosition: number;
  visibilityScore: number;
  organicClicks: number;
  impressions: number;
  ctr: number;
  bounceRate: number;
  avgLoadTime: number;
};

export type Keyword = {
  id: string;
  companyId: string;
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  url: string;
  trend: string; // JSON
};

export type Backlink = {
  id: string;
  companyId: string;
  sourceDomain: string;
  sourceUrl: string;
  anchorText: string;
  domainAuthority: number;
  linkType: string;
  status: string;
  firstSeen: string;
  traffic: number;
};

export type Competitor = {
  id: string;
  companyId: string;
  name: string;
  domain: string;
  domainAuthority: number;
  organicTraffic: number;
  commonKeywords: number;
  trafficOverlap: number;
  backlinks: number;
};

export type TechnicalIssue = {
  id: string;
  companyId: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  affectedCount: number;
  status: string;
  detectedAt: string;
};

export type ContentGap = {
  id: string;
  companyId: string;
  keyword: string;
  competitorRanking: string;
  searchVolume: number;
  difficulty: number;
  opportunity: number;
};

export type SeoInsight = {
  id: string;
  companyId: string;
  type: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
};

export type CoreWebVital = {
  id: string;
  companyId: string;
  url: string;
  device: string; // mobile | desktop
  lcp: number;
  fid: number;
  cls: number;
  inp: number;
  ttfb: number;
  fcp: number;
  score: number;
  status: string; // good | needs-improvement | poor
  updatedAt: string;
};

export type SerpFeature = {
  id: string;
  companyId: string;
  type: string;
  keyword: string;
  url: string;
  captured: boolean;
  competitorOwned: boolean;
  updatedAt: string;
};

export type CompanyDetail = {
  company: CompanySummary & { domainId: string; createdAt: string };
  domain: Domain;
  metrics: SeoMetric[];
  keywords: Keyword[];
  backlinks: Backlink[];
  competitors: Competitor[];
  issues: TechnicalIssue[];
  contentGaps: ContentGap[];
  insights: SeoInsight[];
  webVitals: CoreWebVital[];
  serpFeatures: SerpFeature[];
  latest: SeoMetric | null;
  seoScore: {
    total: number;
    breakdown: { label: string; score: number; weight: number }[];
  };
  trafficDelta: number;
  positionBuckets: number[];
  backlinkStats: {
    dofollow: number;
    nofollow: number;
    newLinks: number;
    lostLinks: number;
    activeLinks: number;
    total: number;
  };
  issueStats: {
    critical: number;
    warning: number;
    info: number;
    resolved: number;
  };
  cwvSummary: {
    avgScore: number;
    good: number;
    needsImprovement: number;
    poor: number;
    mobileScore: number;
    desktopScore: number;
  };
  serpSummary: {
    captured: number;
    competitorOwned: number;
    byType: Record<string, { captured: number; competitorOwned: number }>;
  };
};
