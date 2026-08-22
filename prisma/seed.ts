// RankForge SEO — seed script
// Generates realistic SEO data for 10 domains × 5 companies = 50 companies
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ---------- Domain definitions ----------
const DOMAINS = [
  { name: "E-Commerce", slug: "ecommerce", icon: "ShoppingCart", color: "emerald", accent: "#10b981", description: "Online retail, marketplaces & DTC brands" },
  { name: "Healthcare", slug: "healthcare", icon: "HeartPulse", color: "rose", accent: "#f43f5e", description: "Clinics, telehealth, medical devices & pharma" },
  { name: "SaaS / Tech", slug: "saas", icon: "Cpu", color: "violet", accent: "#8b5cf6", description: "Software, cloud platforms & developer tools" },
  { name: "Real Estate", slug: "real-estate", icon: "Building2", color: "amber", accent: "#f59e0b", description: "Property portals, brokerages & rentals" },
  { name: "Finance", slug: "finance", icon: "Landmark", color: "teal", accent: "#14b8a6", description: "Banking, fintech, investing & insurance" },
  { name: "Hospitality", slug: "hospitality", icon: "Plane", color: "cyan", accent: "#06b6d4", description: "Hotels, travel, booking & experiences" },
  { name: "Legal", slug: "legal", icon: "Scale", color: "stone", accent: "#78716c", description: "Law firms, legal services & compliance" },
  { name: "Education", slug: "education", icon: "GraduationCap", color: "orange", accent: "#f97316", description: "EdTech, courses, universities & e-learning" },
  { name: "Food & Restaurant", slug: "food", icon: "UtensilsCrossed", color: "lime", accent: "#84cc16", description: "Restaurants, delivery, food brands & recipes" },
  { name: "Automotive", slug: "automotive", icon: "Car", color: "sky", accent: "#0ea5e9", description: "Dealers, auto parts, EV & mobility" },
];

// ---------- Companies per domain ----------
const COMPANIES: Record<string, Array<{
  name: string; slug: string; website: string; logo: string; description: string;
  location: string; employees: string; founded: number; industry: string;
  baseTraffic: number; baseDA: number; baseKeywords: number; baseBacklinks: number; basePosition: number;
}>> = {
  ecommerce: [
    { name: "ShopMax", slug: "shopmax", website: "shopmax.com", logo: "SM", description: "Multi-category online marketplace with 2M+ SKUs.", location: "San Francisco, US", employees: "1,200", founded: 2014, industry: "Marketplace", baseTraffic: 4800000, baseDA: 78, baseKeywords: 184000, baseBacklinks: 920000, basePosition: 8.4 },
    { name: "TrendCart", slug: "trendcart", website: "trendcart.io", logo: "TC", description: "DTC fashion & lifestyle store targeting Gen-Z.", location: "Austin, US", employees: "340", founded: 2018, industry: "Fashion DTC", baseTraffic: 980000, baseDA: 54, baseKeywords: 41200, baseBacklinks: 180000, basePosition: 14.2 },
    { name: "BuyVibe", slug: "buyvibe", website: "buyvibe.com", logo: "BV", description: "Home & living marketplace for curated goods.", location: "Berlin, DE", employees: "210", founded: 2016, industry: "Home & Living", baseTraffic: 540000, baseDA: 49, baseKeywords: 22800, baseBacklinks: 142000, basePosition: 18.7 },
    { name: "RetailHub", slug: "retailhub", website: "retailhub.co", logo: "RH", description: "Omnichannel retailer with 400+ physical stores.", location: "Chicago, US", employees: "8,500", founded: 2009, industry: "Omnichannel Retail", baseTraffic: 2100000, baseDA: 71, baseKeywords: 96000, baseBacklinks: 610000, basePosition: 11.3 },
    { name: "NovaKart", slug: "novakart", website: "novakart.shop", logo: "NK", description: "Electronics & gadgets store with fast shipping.", location: "Bengaluru, IN", employees: "520", founded: 2019, industry: "Electronics", baseTraffic: 720000, baseDA: 45, baseKeywords: 31400, baseBacklinks: 96000, basePosition: 21.5 },
  ],
  healthcare: [
    { name: "MediCare Plus", slug: "medicare-plus", website: "medicareplus.com", logo: "MC", description: "Nationwide telehealth & primary care network.", location: "Boston, US", employees: "3,400", founded: 2011, industry: "Telehealth", baseTraffic: 2600000, baseDA: 76, baseKeywords: 88400, baseBacklinks: 540000, basePosition: 7.9 },
    { name: "HealthBridge", slug: "healthbridge", website: "healthbridge.io", logo: "HB", description: "Patient engagement platform for hospitals.", location: "Toronto, CA", employees: "680", founded: 2015, industry: "Health SaaS", baseTraffic: 620000, baseDA: 58, baseKeywords: 26800, baseBacklinks: 210000, basePosition: 13.6 },
    { name: "VitalClinic", slug: "vitalclinic", website: "vitalclinic.com", logo: "VC", description: "Chain of 120 preventive-care clinics.", location: "London, UK", employees: "1,800", founded: 2013, industry: "Clinic Chain", baseTraffic: 880000, baseDA: 62, baseKeywords: 34200, baseBacklinks: 240000, basePosition: 12.1 },
    { name: "CareFirst", slug: "carefirst", website: "carefirst.health", logo: "CF", description: "Health insurance comparison & enrollment.", location: "Sydney, AU", employees: "420", founded: 2017, industry: "Health Insurance", baseTraffic: 410000, baseDA: 51, baseKeywords: 18600, baseBacklinks: 118000, basePosition: 19.4 },
    { name: "MedTrack", slug: "medtrack", website: "medtrack.app", logo: "MT", description: "Wearable health monitoring & analytics app.", location: "Singapore, SG", employees: "190", founded: 2020, industry: "HealthTech", baseTraffic: 320000, baseDA: 44, baseKeywords: 14200, baseBacklinks: 74000, basePosition: 24.8 },
  ],
  saas: [
    { name: "CloudFlow", slug: "cloudflow", website: "cloudflow.com", logo: "CF", description: "Workflow automation platform for modern teams.", location: "Seattle, US", employees: "1,100", founded: 2014, industry: "Workflow SaaS", baseTraffic: 1800000, baseDA: 74, baseKeywords: 64200, baseBacklinks: 480000, basePosition: 8.6 },
    { name: "DevSync", slug: "devsync", website: "devsync.dev", logo: "DS", description: "CI/CD & developer collaboration toolkit.", location: "Remote-first", employees: "240", founded: 2018, industry: "DevTools", baseTraffic: 720000, baseDA: 60, baseKeywords: 28400, baseBacklinks: 196000, basePosition: 12.4 },
    { name: "NexaSoft", slug: "nexasoft", website: "nexasoft.io", logo: "NX", description: "ERP & business operations suite for SMBs.", location: "Dublin, IE", employees: "760", founded: 2012, industry: "ERP", baseTraffic: 540000, baseDA: 56, baseKeywords: 24600, baseBacklinks: 168000, basePosition: 15.2 },
    { name: "FlowStack", slug: "flowstack", website: "flowstack.tech", logo: "FS", description: "Observability & log analytics infrastructure.", location: "Tel Aviv, IL", employees: "180", founded: 2019, industry: "Infra SaaS", baseTraffic: 380000, baseDA: 50, baseKeywords: 16200, baseBacklinks: 102000, basePosition: 17.8 },
    { name: "CodePilot", slug: "codepilot", website: "codepilot.ai", logo: "CP", description: "AI pair-programming assistant for IDEs.", location: "Bengaluru, IN", employees: "120", founded: 2021, industry: "AI DevTools", baseTraffic: 960000, baseDA: 47, baseKeywords: 22800, baseBacklinks: 134000, basePosition: 16.9 },
  ],
  "real-estate": [
    { name: "EstatePrime", slug: "estateprime", website: "estateprime.com", logo: "EP", description: "Luxury property listings across 40 cities.", location: "New York, US", employees: "900", founded: 2010, industry: "Luxury Real Estate", baseTraffic: 1600000, baseDA: 73, baseKeywords: 58400, baseBacklinks: 420000, basePosition: 9.1 },
    { name: "HomeFinder", slug: "homefinder", website: "homefinder.com", logo: "HF", description: "Residential property search & mortgage.", location: "Denver, US", employees: "540", founded: 2014, industry: "Property Portal", baseTraffic: 1100000, baseDA: 66, baseKeywords: 44200, baseBacklinks: 286000, basePosition: 11.7 },
    { name: "PropertyHub", slug: "propertyhub", website: "propertyhub.co", logo: "PH", description: "Commercial real estate marketplace.", location: "Manchester, UK", employees: "310", founded: 2016, industry: "Commercial RE", baseTraffic: 480000, baseDA: 55, baseKeywords: 19800, baseBacklinks: 142000, basePosition: 16.4 },
    { name: "NestQuest", slug: "nestquest", website: "nestquest.io", logo: "NQ", description: "Rental listings & tenant matching service.", location: "Amsterdam, NL", employees: "180", founded: 2018, industry: "Rentals", baseTraffic: 360000, baseDA: 49, baseKeywords: 15600, baseBacklinks: 88000, basePosition: 19.2 },
    { name: "UrbanRealty", slug: "urbanrealty", website: "urbanrealty.com", logo: "UR", description: "Urban apartments & smart-home integration.", location: "Tokyo, JP", employees: "240", founded: 2017, industry: "Urban Living", baseTraffic: 290000, baseDA: 46, baseKeywords: 12400, baseBacklinks: 72000, basePosition: 22.6 },
  ],
  finance: [
    { name: "FinEdge", slug: "finedge", website: "finedge.com", logo: "FE", description: "Digital banking & wealth management platform.", location: "London, UK", employees: "1,600", founded: 2013, industry: "Digital Banking", baseTraffic: 2200000, baseDA: 77, baseKeywords: 72800, baseBacklinks: 560000, basePosition: 7.6 },
    { name: "CapitalWise", slug: "capitalwise", website: "capitalwise.io", logo: "CW", description: "Robo-advisor & automated investing.", location: "Zurich, CH", employees: "320", founded: 2016, industry: "WealthTech", baseTraffic: 680000, baseDA: 59, baseKeywords: 24400, baseBacklinks: 178000, basePosition: 13.9 },
    { name: "WealthForge", slug: "wealthforge", website: "wealthforge.com", logo: "WF", description: "Portfolio analytics for institutional investors.", location: "Hong Kong, HK", employees: "410", founded: 2015, industry: "Asset Management", baseTraffic: 440000, baseDA: 56, baseKeywords: 18600, baseBacklinks: 136000, basePosition: 16.1 },
    { name: "PayNova", slug: "paynova", website: "paynova.app", logo: "PN", description: "Cross-border payments API for businesses.", location: "Singapore, SG", employees: "260", founded: 2019, industry: "Payments", baseTraffic: 540000, baseDA: 52, baseKeywords: 20200, baseBacklinks: 118000, basePosition: 17.3 },
    { name: "InvestPro", slug: "investpro", website: "investpro.com", logo: "IP", description: "Stock research & market intelligence.", location: "Mumbai, IN", employees: "380", founded: 2014, industry: "Investing", baseTraffic: 980000, baseDA: 64, baseKeywords: 38600, baseBacklinks: 254000, basePosition: 10.8 },
  ],
  hospitality: [
    { name: "StayLux", slug: "staylux", website: "staylux.com", logo: "SL", description: "Curated luxury hotel bookings worldwide.", location: "Dubai, AE", employees: "1,200", founded: 2012, industry: "Luxury Hotels", baseTraffic: 1800000, baseDA: 72, baseKeywords: 62400, baseBacklinks: 410000, basePosition: 9.4 },
    { name: "TravelGo", slug: "travelgo", website: "travelgo.com", logo: "TG", description: "Trip planning & multi-modal booking.", location: "Berlin, DE", employees: "780", founded: 2015, industry: "OTA", baseTraffic: 1400000, baseDA: 68, baseKeywords: 52800, baseBacklinks: 338000, basePosition: 10.9 },
    { name: "HotelPrime", slug: "hotelprime", website: "hotelprime.com", logo: "HP", description: "Boutique hotel chain across 18 countries.", location: "Barcelona, ES", employees: "5,400", founded: 2008, industry: "Hotel Chain", baseTraffic: 720000, baseDA: 61, baseKeywords: 28400, baseBacklinks: 198000, basePosition: 13.7 },
    { name: "WanderLust", slug: "wanderlust", website: "wanderlust.io", logo: "WL", description: "Adventure travel & experience marketplace.", location: "Lisbon, PT", employees: "180", founded: 2018, industry: "Experiences", baseTraffic: 420000, baseDA: 50, baseKeywords: 17600, baseBacklinks: 98000, basePosition: 18.5 },
    { name: "BookStay", slug: "bookstay", website: "bookstay.co", logo: "BS", description: "Vacation rental aggregator with smart pricing.", location: "Cape Town, ZA", employees: "140", founded: 2019, industry: "Vacation Rentals", baseTraffic: 310000, baseDA: 47, baseKeywords: 13800, baseBacklinks: 76000, basePosition: 21.2 },
  ],
  legal: [
    { name: "LegalShield", slug: "legalshield", website: "legalshield.com", logo: "LS", description: "Full-service corporate law firm, top-100 ranked.", location: "Washington, US", employees: "1,800", founded: 2007, industry: "Corporate Law", baseTraffic: 980000, baseDA: 70, baseKeywords: 38400, baseBacklinks: 286000, basePosition: 10.4 },
    { name: "LawPro", slug: "lawpro", website: "lawpro.com", logo: "LP", description: "Personal injury & litigation specialists.", location: "Houston, US", employees: "320", founded: 2013, industry: "Litigation", baseTraffic: 540000, baseDA: 58, baseKeywords: 21600, baseBacklinks: 148000, basePosition: 14.6 },
    { name: "JusticeNet", slug: "justicenet", website: "justicenet.io", logo: "JN", description: "Online legal services & document marketplace.", location: "Toronto, CA", employees: "240", founded: 2016, industry: "LegalTech", baseTraffic: 680000, baseDA: 56, baseKeywords: 26400, baseBacklinks: 162000, basePosition: 13.2 },
    { name: "CounselHub", slug: "counselhub", website: "counselhub.co", logo: "CH", description: "In-house counsel network for startups.", location: "Austin, US", employees: "120", founded: 2019, industry: "Startup Legal", baseTraffic: 280000, baseDA: 48, baseKeywords: 11200, baseBacklinks: 68000, basePosition: 19.8 },
    { name: "LexPrime", slug: "lexprime", website: "lexprime.com", logo: "LX", description: "IP & patent law specialists for tech firms.", location: "Munich, DE", employees: "210", founded: 2015, industry: "IP Law", baseTraffic: 340000, baseDA: 53, baseKeywords: 14800, baseBacklinks: 94000, basePosition: 17.1 },
  ],
  education: [
    { name: "EduForge", slug: "eduforge", website: "eduforge.com", logo: "EF", description: "Online courses marketplace, 50k+ courses.", location: "Mountain View, US", employees: "1,400", founded: 2013, industry: "E-Learning", baseTraffic: 2400000, baseDA: 75, baseKeywords: 78400, baseBacklinks: 498000, basePosition: 8.1 },
    { name: "LearnHub", slug: "learnhub", website: "learnhub.io", logo: "LH", description: "Coding bootcamps & career programs.", location: "Remote-first", employees: "320", founded: 2017, industry: "Bootcamp", baseTraffic: 720000, baseDA: 58, baseKeywords: 24800, baseBacklinks: 168000, basePosition: 13.4 },
    { name: "ScholarPath", slug: "scholarpath", website: "scholarpath.com", logo: "SP", description: "University admissions & scholarship search.", location: "Boston, US", employees: "180", founded: 2018, industry: "Admissions", baseTraffic: 540000, baseDA: 54, baseKeywords: 20400, baseBacklinks: 134000, basePosition: 15.7 },
    { name: "SkillBoost", slug: "skillboost", website: "skillboost.app", logo: "SB", description: "Microlearning app for professional skills.", location: "Stockholm, SE", employees: "90", founded: 2020, industry: "Microlearning", baseTraffic: 380000, baseDA: 47, baseKeywords: 15600, baseBacklinks: 82000, basePosition: 18.9 },
    { name: "Academix", slug: "academix", website: "academix.edu", logo: "AX", description: "K-12 supplemental learning platform.", location: "Seoul, KR", employees: "260", founded: 2016, industry: "K-12 EdTech", baseTraffic: 620000, baseDA: 56, baseKeywords: 22400, baseBacklinks: 146000, basePosition: 14.2 },
  ],
  food: [
    { name: "FlavorFleet", slug: "flavorfleet", website: "flavorfleet.com", logo: "FF", description: "Food delivery network across 200 cities.", location: "Chicago, US", employees: "4,200", founded: 2014, industry: "Food Delivery", baseTraffic: 1900000, baseDA: 71, baseKeywords: 64200, baseBacklinks: 398000, basePosition: 9.7 },
    { name: "DishDash", slug: "dishdash", website: "dishdash.io", logo: "DD", description: "Cloud-kitchen & ghost-kitchen operator.", location: "Los Angeles, US", employees: "680", founded: 2018, industry: "Cloud Kitchen", baseTraffic: 480000, baseDA: 52, baseKeywords: 18600, baseBacklinks: 108000, basePosition: 17.4 },
    { name: "BiteBox", slug: "bitebox", website: "bitebox.com", logo: "BB", description: "Meal-kit subscription for home cooks.", location: "Berlin, DE", employees: "420", founded: 2016, industry: "Meal Kits", baseTraffic: 560000, baseDA: 55, baseKeywords: 21400, baseBacklinks: 132000, basePosition: 15.1 },
    { name: "TastyTable", slug: "tastytable", website: "tastytable.com", logo: "TT", description: "Restaurant reservation & discovery platform.", location: "Paris, FR", employees: "240", founded: 2017, industry: "Restaurant Tech", baseTraffic: 680000, baseDA: 59, baseKeywords: 24800, baseBacklinks: 158000, basePosition: 13.8 },
    { name: "MenuMaster", slug: "menumaster", website: "menumaster.app", logo: "MM", description: "Recipe platform & culinary content hub.", location: "Toronto, CA", employees: "140", founded: 2019, industry: "Food Content", baseTraffic: 920000, baseDA: 62, baseKeywords: 38400, baseBacklinks: 214000, basePosition: 11.6 },
  ],
  automotive: [
    { name: "AutoZone Pro", slug: "autozone-pro", website: "autozonepro.com", logo: "AZ", description: "Auto parts marketplace for professionals.", location: "Memphis, US", employees: "2,800", founded: 2010, industry: "Auto Parts", baseTraffic: 1500000, baseDA: 72, baseKeywords: 58400, baseBacklinks: 364000, basePosition: 9.6 },
    { name: "DriveNow", slug: "drivenow", website: "drivenow.com", logo: "DN", description: "New & used car marketplace with financing.", location: "Detroit, US", employees: "920", founded: 2014, industry: "Auto Marketplace", baseTraffic: 1100000, baseDA: 67, baseKeywords: 42600, baseBacklinks: 268000, basePosition: 11.4 },
    { name: "CarConnect", slug: "carconnect", website: "carconnect.io", logo: "CC", description: "Connected-car telematics & data platform.", location: "Stuttgart, DE", employees: "340", founded: 2017, industry: "AutoTech", baseTraffic: 420000, baseDA: 53, baseKeywords: 16800, baseBacklinks: 98000, basePosition: 16.8 },
    { name: "MotorHub", slug: "motorhub", website: "motorhub.com", logo: "MH", description: "EV charging network & station locator.", location: "Oslo, NO", employees: "210", founded: 2019, industry: "EV Infrastructure", baseTraffic: 380000, baseDA: 49, baseKeywords: 14200, baseBacklinks: 84000, basePosition: 18.6 },
    { name: "VroomX", slug: "vroomx", website: "vroomx.app", logo: "VX", description: "Car subscription & flexible ownership service.", location: "Sydney, AU", employees: "160", founded: 2020, industry: "Car Subscription", baseTraffic: 240000, baseDA: 44, baseKeywords: 9800, baseBacklinks: 58000, basePosition: 22.4 },
  ],
};

// ---------- Keyword seed pools per domain ----------
const KEYWORD_POOLS: Record<string, string[]> = {
  ecommerce: ["buy shoes online","best wireless headphones","discount electronics","online clothing store","free shipping deals","gift ideas under 50","black friday offers","home decor sale","smartphone deals","laptop backpack","kitchen appliances","beauty products","toys for kids","fitness equipment","office supplies","gaming chair","smart watch","winter jackets","sneakers sale","skincare set"],
  healthcare: ["telehealth appointment","online doctor consultation","covid testing near me","health insurance plans","symptoms checker","mental health therapy","primary care clinic","prescription delivery","wellness programs","find a specialist","urgent care center","vaccination schedule","blood test lab","dental clinic near me","eye doctor appointment","physical therapy","women's health","pediatrician near me","telemedicine services","chronic care management"],
  saas: ["workflow automation","ci cd pipeline","project management software","crm integration","api monitoring","team collaboration tool","log analytics","customer onboarding","marketing automation","accounting software","time tracking app","knowledge base software","help desk software","feature flag tool","data warehouse","business intelligence","document management","esignature software","survey tool","form builder"],
  "real-estate": ["houses for sale","apartments for rent","luxury homes","real estate agents","mortgage calculator","property management","commercial real estate","new construction homes","waterfront properties","studio apartments","2 bedroom apartment","condo for sale","rent to own homes","foreclosure listings","real estate investment","property valuation","moving services","home inspection","title search","real estate listings"],
  finance: ["online banking","high yield savings","best credit cards","personal loans","investment portfolio","retirement planning","stock trading app","crypto exchange","insurance quotes","mortgage rates","tax filing software","business loans","wealth management","financial advisor","budgeting app","robo advisor","forex trading","etf investing","credit score check","debt consolidation"],
  hospitality: ["hotel deals","cheap flights","vacation packages","luxury resorts","beach rentals","city breaks","all inclusive resorts","car rental deals","cruise bookings","travel insurance","last minute hotels","family vacations","honeymoon destinations","business travel","hostels near me","airport transfers","villa rentals","adventure tours","city tours","restaurant reservations"],
  legal: ["personal injury lawyer","divorce attorney","criminal defense lawyer","business lawyer","estate planning","real estate lawyer","immigration attorney","patent attorney","employment lawyer","bankruptcy attorney","tax lawyer","contract review","incorporation services","trademark registration","class action lawsuit","workers compensation","dui attorney","family law attorney","medical malpractice","civil litigation"],
  education: ["online courses","coding bootcamp","learn python","data science course","mba programs","scholarships 2024","study abroad","language learning","certification programs","free online courses","master degree online","professional development","skill assessment","math tutoring","writing courses","digital marketing course","project management certification","cybersecurity training","ai course","design courses"],
  food: ["food delivery near me","best restaurants","meal kits delivery","vegan recipes","quick dinner recipes","healthy meal prep","restaurant reservations","pizza delivery","sushi near me","brunch spots","catering services","coffee subscription","wine delivery","grocery delivery","baking recipes","keto recipes","gluten free restaurants","food truck near me","fine dining","lunch specials"],
  automotive: ["car parts online","used cars for sale","new car prices","ev charging stations","auto repair near me","car insurance quotes","tire deals","oil change service","car loan calculator","electric vehicles","car accessories","brake repair","transmission service","battery replacement","car detailing","window tinting","wheel alignment","vehicle history report","trade in value","car subscription"],
};

const COMPETITOR_NAMES = ["ApexRival","PrimeContender","NextGen Co.","MarketLeader","TopRank Co.","SummitGroup","PioneerBrands","Vanguard Co.","Horizon Ventures","BeaconCorp","QuantumEdge","StellarWorks","ZenithPartners","NovaSphere","ElevateGroup","PinnacleCo","AscendBrands","Crestline","VertexGroup","MeridianCo"];

const TECH_ISSUE_TYPES = [
  { type: "core-web-vitals", titles: ["LCP above 2.5s on mobile homepage","CLS above 0.1 on product pages","FID exceeding 100ms on checkout","INP regression on category pages"] },
  { type: "crawlability", titles: ["Orphan pages detected in sitemap","Blocked resources in robots.txt","Broken internal links found","Redirect chains over 3 hops","Noindex tags on key landing pages"] },
  { type: "mobile", titles: ["Mobile viewport not configured","Tap targets too small on blog","Mobile font size below 12px","Mobile layout shift on PDP"] },
  { type: "schema", titles: ["Missing Product schema on 142 pages","Breadcrumb schema incomplete","FAQ schema not implemented","Review schema markup errors","Organization schema outdated"] },
  { type: "security", titles: ["Mixed content on secure pages","Outdated TLS certificate","Missing HSTS header"] },
  { type: "indexability", titles: ["Duplicate meta descriptions on 38 pages","Missing title tags on 12 pages","Thin content pages below 100 words","Canonical tag conflicts detected"] },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// generate a 30-day trend with slight upward/downward bias
function generateTrend(base: number, days: number, volatility: number, bias: number) {
  const trend: Array<{ date: string; value: number }> = [];
  let value = base;
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    value = value * (1 + bias / 100 + rand(-volatility, volatility) / 100);
    trend.push({ date: d.toISOString().slice(0, 10), value: Math.max(0, Math.round(value)) });
  }
  return trend;
}

async function main() {
  console.log("🧹 Cleaning existing data...");
  await db.serpFeature.deleteMany();
  await db.coreWebVital.deleteMany();
  await db.seoInsight.deleteMany();
  await db.contentGap.deleteMany();
  await db.technicalIssue.deleteMany();
  await db.competitor.deleteMany();
  await db.backlink.deleteMany();
  await db.keyword.deleteMany();
  await db.seoMetric.deleteMany();
  await db.company.deleteMany();
  await db.domain.deleteMany();

  console.log("🌱 Seeding domains...");
  for (const d of DOMAINS) {
    await db.domain.create({ data: { ...d } });
  }

  console.log("🏢 Seeding companies + metrics...");
  const domains = await db.domain.findMany();

  for (const domain of domains) {
    const companies = COMPANIES[domain.slug];
    if (!companies) continue;
    const keywordPool = KEYWORD_POOLS[domain.slug] || KEYWORD_POOLS.ecommerce;

    for (const c of companies) {
      // bias: 70% of companies trending up, 30% down
      const trendingUp = Math.random() > 0.3;
      const trafficBias = trendingUp ? rand(0.4, 2.2) : rand(-1.6, -0.3);
      const daBias = trendingUp ? rand(0.05, 0.4) : rand(-0.3, -0.05);
      const posBias = trendingUp ? rand(-2.5, -0.4) : rand(0.4, 2.0);

      const company = await db.company.create({
        data: {
          domainId: domain.id,
          name: c.name,
          slug: c.slug,
          website: c.website,
          logoText: c.logo,
          description: c.description,
          location: c.location,
          employees: c.employees,
          foundedYear: c.founded,
          industry: c.industry,
        },
      });

      // ---- Metrics: 30 days ----
      const trafficTrend = generateTrend(c.baseTraffic, 30, 4, trafficBias);
      const daTrend = generateTrend(c.baseDA * 100, 30, 0.5, daBias);
      const kwTrend = generateTrend(c.baseKeywords, 30, 1.5, trafficBias * 0.6);
      const blTrend = generateTrend(c.baseBacklinks, 30, 0.3, trafficBias * 0.4);
      const posTrend = generateTrend(c.basePosition * 100, 30, 2, posBias);
      const refTrend = generateTrend(c.baseBacklinks / 8, 30, 0.4, trafficBias * 0.5);

      for (let i = 0; i < 30; i++) {
        const traffic = trafficTrend[i].value;
        const da = daTrend[i].value / 100;
        const kw = kwTrend[i].value;
        const bl = blTrend[i].value;
        const pos = posTrend[i].value / 100;
        const ref = refTrend[i].value;
        const impressions = Math.round(traffic * rand(2.5, 4.2));
        const clicks = Math.round(traffic * rand(0.4, 0.7));
        const visibility = Math.max(0, 100 - pos * 3.2 + rand(-4, 6));
        await db.seoMetric.create({
          data: {
            companyId: company.id,
            date: new Date(trafficTrend[i].date),
            organicTraffic: traffic,
            keywordsRanked: kw,
            backlinks: bl,
            referringDomains: ref,
            domainAuthority: Math.round(da * 10) / 10,
            pageAuthority: Math.round((da * 0.85) * 10) / 10,
            avgPosition: Math.round(pos * 10) / 10,
            visibilityScore: Math.round(visibility * 10) / 10,
            organicClicks: clicks,
            impressions,
            ctr: Math.round((clicks / impressions) * 1000) / 10,
            bounceRate: Math.round(rand(28, 62) * 10) / 10,
            avgLoadTime: Math.round(rand(0.9, 3.4) * 100) / 100,
          },
        });
      }

      // ---- Keywords: ~22 per company ----
      const usedKeywords = new Set<string>();
      const kwCount = 22;
      for (let i = 0; i < kwCount; i++) {
        const kw = keywordPool[i % keywordPool.length];
        if (usedKeywords.has(kw)) continue;
        usedKeywords.add(kw);
        const position = randInt(1, 60);
        const prev = Math.max(1, position + randInt(-4, 6));
        const trend = generateTrend(position, 14, 8, trendingUp ? -1.5 : 1.2).map((t) => ({ date: t.date, position: t.value }));
        await db.keyword.create({
          data: {
            companyId: company.id,
            keyword: kw,
            position,
            previousPosition: prev,
            searchVolume: randInt(120, 24000),
            difficulty: Math.round(rand(8, 78) * 10) / 10,
            cpc: Math.round(rand(0.4, 12.5) * 100) / 100,
            intent: pick(["commercial", "informational", "transactional", "navigational"]),
            url: `https://${c.website}/${kw.replace(/\s+/g, "-")}`,
            trend: JSON.stringify(trend),
          },
        });
      }

      // ---- Backlinks: ~18 per company ----
      const blCount = 18;
      for (let i = 0; i < blCount; i++) {
        const isDofollow = Math.random() > 0.35;
        const isNew = Math.random() > 0.7;
        const isLost = Math.random() > 0.85;
        await db.backlink.create({
          data: {
            companyId: company.id,
            sourceDomain: `${pick(["blog","news","mag","guide","review","forum","hub"])}.${pick(["growthly","searchwire","contently","mediaworks","digitalinsights","webjournal"])}.com`,
            sourceUrl: `https://example-source-${i}.com/article-${randInt(1, 500)}`,
            anchorText: pick([c.name, `${c.name} review`, `best ${c.industry.toLowerCase()}`, "click here", c.website, `visit ${c.name}`]),
            domainAuthority: Math.round(rand(15, 92) * 10) / 10,
            linkType: isDofollow ? "dofollow" : "nofollow",
            status: isLost ? "lost" : isNew ? "new" : "active",
            firstSeen: new Date(Date.now() - randInt(3, 720) * 86400000),
            traffic: randInt(0, 4200),
          },
        });
      }

      // ---- Competitors: 5 ----
      for (let i = 0; i < 5; i++) {
        await db.competitor.create({
          data: {
            companyId: company.id,
            name: COMPETITOR_NAMES[i],
            domain: `${COMPETITOR_NAMES[i].toLowerCase().replace(/\s+/g, "")}.com`,
            domainAuthority: Math.round((c.baseDA + rand(-12, 14)) * 10) / 10,
            organicTraffic: Math.round(c.baseTraffic * rand(0.3, 1.8)),
            commonKeywords: randInt(800, 9200),
            trafficOverlap: Math.round(rand(0.12, 0.72) * 100) / 100,
            backlinks: Math.round(c.baseBacklinks * rand(0.4, 1.6)),
          },
        });
      }

      // ---- Technical issues: ~12 ----
      const issueCount = 12;
      for (let i = 0; i < issueCount; i++) {
        const issueType = pick(TECH_ISSUE_TYPES);
        await db.technicalIssue.create({
          data: {
            companyId: company.id,
            type: issueType.type,
            severity: pick(["critical", "warning", "info"]),
            title: pick(issueType.titles),
            description: `Detected during automated crawl. Affects search visibility and user experience. Recommended fix prioritized based on impact analysis.`,
            affectedCount: randInt(1, 240),
            status: Math.random() > 0.7 ? "resolved" : "open",
            detectedAt: new Date(Date.now() - randInt(1, 40) * 86400000),
          },
        });
      }

      // ---- Content gaps: ~16 ----
      const gapCount = 16;
      for (let i = 0; i < gapCount; i++) {
        const kw = keywordPool[randInt(0, keywordPool.length - 1)];
        await db.contentGap.create({
          data: {
            companyId: company.id,
            keyword: kw,
            competitorRanking: COMPETITOR_NAMES.slice(0, randInt(1, 3)).join(", "),
            searchVolume: randInt(800, 28000),
            difficulty: Math.round(rand(10, 72) * 10) / 10,
            opportunity: Math.round(rand(38, 96)),
          },
        });
      }

      // ---- Core Web Vitals: ~8 URLs (mobile + desktop) ----
      const cwvUrls = [
        "/", "/products", "/blog", "/checkout", "/account",
        "/search", "/category/featured", "/about",
      ];
      const cwvBias = trendingUp ? 1 : -1; // trending up = better CWV
      for (let i = 0; i < cwvUrls.length; i++) {
        for (const device of ["mobile", "desktop"]) {
          const isMobile = device === "mobile";
          const lcp = Math.max(0.6, rand(1.2, 3.8) + (isMobile ? 0.8 : 0) - cwvBias * 0.3);
          const fid = Math.max(10, rand(20, 280) + (isMobile ? 60 : 0) - cwvBias * 30);
          const cls = Math.max(0.01, rand(0.02, 0.22) - cwvBias * 0.03);
          const inp = Math.max(40, rand(80, 480) + (isMobile ? 120 : 0) - cwvBias * 60);
          const ttfb = Math.max(80, rand(150, 880) + (isMobile ? 100 : 0) - cwvBias * 80);
          const fcp = Math.max(0.5, rand(0.9, 3.2) + (isMobile ? 0.6 : 0) - cwvBias * 0.25);

          // CWV score: weighted blend (0-100)
          const lcpScore = Math.max(0, 100 - Math.max(0, lcp - 2.5) * 40);
          const fidScore = Math.max(0, 100 - Math.max(0, fid - 100) / 3);
          const clsScore = Math.max(0, 100 - cls * 400);
          const inpScore = Math.max(0, 100 - Math.max(0, inp - 200) / 3);
          const score = Math.round((lcpScore * 0.3 + fidScore * 0.15 + clsScore * 0.2 + inpScore * 0.2 + Math.max(0, 100 - (ttfb - 200) / 8) * 0.15));
          const status = score >= 75 ? "good" : score >= 50 ? "needs-improvement" : "poor";

          await db.coreWebVital.create({
            data: {
              companyId: company.id,
              url: `${c.website}${cwvUrls[i]}`,
              device,
              lcp: Math.round(lcp * 100) / 100,
              fid: Math.round(fid),
              cls: Math.round(cls * 1000) / 1000,
              inp: Math.round(inp),
              ttfb: Math.round(ttfb),
              fcp: Math.round(fcp * 100) / 100,
              score,
              status,
            },
          });
        }
      }

      // ---- SERP features: ~10 captured + a few competitor-owned ----
      const SERP_TYPES = [
        "featured-snippet", "sitelinks", "reviews", "faq",
        "video", "image-pack", "local-pack", "top-stories", "people-also-ask",
      ];
      const serpCount = randInt(8, 14);
      for (let i = 0; i < serpCount; i++) {
        const kw = keywordPool[randInt(0, keywordPool.length - 1)];
        const competitorOwned = Math.random() > 0.75;
        await db.serpFeature.create({
          data: {
            companyId: company.id,
            type: pick(SERP_TYPES),
            keyword: kw,
            url: `https://${c.website}/${kw.replace(/\s+/g, "-")}`,
            captured: !competitorOwned,
            competitorOwned,
            updatedAt: new Date(Date.now() - randInt(1, 20) * 86400000),
          },
        });
      }
    }
  }

  console.log("✅ Seed complete!");
  const counts = {
    domains: await db.domain.count(),
    companies: await db.company.count(),
    metrics: await db.seoMetric.count(),
    keywords: await db.keyword.count(),
    backlinks: await db.backlink.count(),
    competitors: await db.competitor.count(),
    issues: await db.technicalIssue.count(),
    gaps: await db.contentGap.count(),
    webVitals: await db.coreWebVital.count(),
    serpFeatures: await db.serpFeature.count(),
  };
  console.log(counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
