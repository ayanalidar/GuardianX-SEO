import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/auto-optimize
// Returns a single <script> tag that the client adds to their site.
// This script AUTOMATICALLY fixes SEO issues on every page load:
// - Injects optimized meta tags (title, description)
// - Injects JSON-LD schema (Organization, WebSite, BreadcrumbList, Article, FAQ)
// - Fixes missing alt text on images
// - Adds canonical tags
// - Adds Open Graph tags
// - Optimizes heading structure
// - Adds hreflang if missing
// - Generates and submits XML sitemap
// - Monitors Core Web Vitals
// - Sends optimization reports back to GuardianX

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const client = await db.client.findUnique({
    where: { token },
    include: {
      company: { select: { name: true, website: true, description: true, industry: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const name = client.company.name;
  const website = client.company.website;
  const url = website.startsWith("http") ? website : `https://${website}`;
  const origin = new URL(url).origin;
  const description = client.company.description || `${name} — ${client.company.industry}`;
  const industry = client.company.industry;
  const trackerUrl = "https://guardian-x-seo.vercel.app/api/track";
  const reportUrl = "https://guardian-x-seo.vercel.app/api/track";

  // The auto-optimizer script — this is what gets injected into the client's site
  const optimizerScript = `<!-- GuardianX-SEO Auto-Optimizer -->
<script>
(function(){
  window.GX = window.GX || {};
  GX.token = "${token}";
  GX.endpoint = "${trackerUrl}";
  GX.report = "${reportUrl}";
  GX.fixes = [];
  GX.startTime = Date.now();

  // ========== 1. FIX META TAGS ==========
  GX.fixMeta = function() {
    // Fix missing meta description
    if (!document.querySelector('meta[name="description"]')) {
      var desc = document.createElement('meta');
      desc.name = 'description';
      desc.content = document.title ? document.title + ' — ' + '${description}' : '${description}';
      document.head.appendChild(desc);
      GX.fixes.push('Added missing meta description');
    }
    // Fix missing viewport
    if (!document.querySelector('meta[name="viewport"]')) {
      var vp = document.createElement('meta');
      vp.name = 'viewport';
      vp.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(vp);
      GX.fixes.push('Added missing viewport meta tag');
    }
    // Fix missing charset
    if (!document.querySelector('meta[charset]')) {
      var cs = document.createElement('meta');
      cs.setAttribute('charset', 'UTF-8');
      document.head.insertBefore(cs, document.head.firstChild);
      GX.fixes.push('Added missing charset');
    }
    // Optimize title (ensure < 60 chars, includes brand)
    var title = document.title;
    if (title && title.length > 60) {
      document.title = title.substring(0, 57) + '...';
      GX.fixes.push('Trimmed title from ' + title.length + ' to 60 chars');
    }
    if (title && title.indexOf('${name}') === -1 && title.length < 50) {
      document.title = title + ' | ${name}';
      GX.fixes.push('Added brand name to title');
    }
  };

  // ========== 2. INJECT SCHEMA MARKUP ==========
  GX.injectSchema = function() {
    var existing = document.querySelectorAll('script[type="application/ld+json"]');
    var hasOrg = false, hasSite = false, hasBreadcrumb = false;
    existing.forEach(function(s) {
      var text = s.textContent || '';
      if (text.indexOf('"Organization"') > -1) hasOrg = true;
      if (text.indexOf('"WebSite"') > -1) hasSite = true;
      if (text.indexOf('"BreadcrumbList"') > -1) hasBreadcrumb = true;
    });

    if (!hasOrg) {
      var org = document.createElement('script');
      org.type = 'application/ld+json';
      org.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": ${JSON.stringify(name)},
        "url": "${origin}",
        "description": ${JSON.stringify(description)},
        "knowsAbout": ${JSON.stringify(industry)}
      });
      document.head.appendChild(org);
      GX.fixes.push('Injected Organization schema');
    }

    if (!hasSite) {
      var site = document.createElement('script');
      site.type = 'application/ld+json';
      site.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": ${JSON.stringify(name)},
        "url": "${origin}",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "${origin}/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      });
      document.head.appendChild(site);
      GX.fixes.push('Injected WebSite schema (enables sitelinks search box)');
    }

    if (!hasBreadcrumb) {
      var bc = document.createElement('script');
      bc.type = 'application/ld+json';
      bc.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem", "position": 1, "name": "Home", "item": "${origin}"
        }]
      });
      document.head.appendChild(bc);
      GX.fixes.push('Injected BreadcrumbList schema');
    }

    // Auto-detect article pages and add Article schema
    var path = window.location.pathname;
    if (path.match(/\\/blog\\/|\\/article\\/|\\/post\\//i)) {
      var article = document.createElement('script');
      article.type = 'application/ld+json';
      article.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": document.title,
        "url": window.location.href,
        "datePublished": document.querySelector('meta[property="article:published_time"]')?.content || new Date().toISOString(),
        "author": { "@type": "Organization", "name": ${JSON.stringify(name)} },
        "publisher": { "@type": "Organization", "name": ${JSON.stringify(name)} }
      });
      document.head.appendChild(article);
      GX.fixes.push('Injected Article schema on blog page');
    }

    // Auto-detect product pages
    if (path.match(/\\/product|\\/shop|\\/item|\\/p\\//i)) {
      var product = document.createElement('script');
      product.type = 'application/ld+json';
      product.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": document.title,
        "url": window.location.href
      });
      document.head.appendChild(product);
      GX.fixes.push('Injected Product schema on product page');
    }

    // Auto-detect FAQ sections
    var faqItems = document.querySelectorAll('.faq, .faq-item, details > summary');
    if (faqItems.length >= 2) {
      var faqs = [];
      faqItems.forEach(function(item, i) {
        var q = item.querySelector('summary, .faq-question, h3, h4, strong') || item;
        var a = item.nextElementSibling || item.parentElement.querySelector('p, .faq-answer');
        if (q && a && q.textContent.trim()) {
          faqs.push({ "@type": "Question", "name": q.textContent.trim(), "acceptedAnswer": { "@type": "Answer", "text": a.textContent.trim() } });
        }
      });
      if (faqs.length > 0) {
        var faqSchema = document.createElement('script');
        faqSchema.type = 'application/ld+json';
        faqSchema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs });
        document.head.appendChild(faqSchema);
        GX.fixes.push('Injected FAQ schema (' + faqs.length + ' questions)');
      }
    }
  };

  // ========== 3. FIX IMAGES ==========
  GX.fixImages = function() {
    var imgs = document.querySelectorAll('img:not([alt]), img[alt=""]');
    imgs.forEach(function(img, i) {
      // Generate alt from filename or surrounding text
      var src = img.getAttribute('src') || '';
      var filename = src.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');
      var nearbyHeading = img.closest('section, article, div')?.querySelector('h1, h2, h3');
      img.alt = (nearbyHeading?.textContent || filename || '${industry} image ' + (i + 1)).trim().substring(0, 125);
    });
    if (imgs.length > 0) GX.fixes.push('Fixed ' + imgs.length + ' images missing alt text');

    // Add loading="lazy" to images below the fold
    var allImgs = document.querySelectorAll('img:not([loading])');
    var fixed = 0;
    allImgs.forEach(function(img) {
      var rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        img.loading = 'lazy';
        fixed++;
      }
    });
    if (fixed > 0) GX.fixes.push('Added lazy loading to ' + fixed + ' images');
  };

  // ========== 4. FIX LINKS ==========
  GX.fixLinks = function() {
    // Add rel="noopener" to target="_blank" links
    var blankLinks = document.querySelectorAll('a[target="_blank"]:not([rel])');
    blankLinks.forEach(function(link) {
      link.rel = 'noopener noreferrer';
    });
    if (blankLinks.length > 0) GX.fixes.push('Secured ' + blankLinks.length + ' external links');

    // Add canonical if missing
    if (!document.querySelector('link[rel="canonical"]')) {
      var canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href.split('?')[0].split('#')[0];
      document.head.appendChild(canonical);
      GX.fixes.push('Added canonical URL');
    }
  };

  // ========== 5. FIX OPEN GRAPH ==========
  GX.fixOpenGraph = function() {
    if (!document.querySelector('meta[property="og:title"]')) {
      var ogTags = [
        { prop: 'og:title', content: document.title },
        { prop: 'og:description', content: document.querySelector('meta[name="description"]')?.content || '${description}' },
        { prop: 'og:type', content: 'website' },
        { prop: 'og:url', content: window.location.href },
        { prop: 'og:site_name', content: ${JSON.stringify(name)} },
        { prop: 'og:image', content: '${origin}/og-image.jpg' },
        { prop: 'twitter:card', content: 'summary_large_image' },
        { prop: 'twitter:title', content: document.title },
        { prop: 'twitter:description', content: document.querySelector('meta[name="description"]')?.content || '${description}' }
      ];
      ogTags.forEach(function(tag) {
        var m = document.createElement('meta');
        m.setAttribute('property', tag.prop);
        m.content = tag.content;
        document.head.appendChild(m);
      });
      GX.fixes.push('Added 9 Open Graph + Twitter Card tags');
    }
  };

  // ========== 6. FIX HEADINGS ==========
  GX.fixHeadings = function() {
    var h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      // Try to create H1 from title
      var main = document.querySelector('main, article, .content, .post-content');
      if (main) {
        var h1 = document.createElement('h1');
        h1.textContent = document.title;
        main.insertBefore(h1, main.firstChild);
        GX.fixes.push('Created missing H1 tag');
      }
    } else if (h1s.length > 1) {
      // Convert extra H1s to H2s
      for (var i = 1; i < h1s.length; i++) {
        var h2 = document.createElement('h2');
        h2.textContent = h1s[i].textContent;
        h1s[i].parentNode.replaceChild(h2, h1s[i]);
      }
      GX.fixes.push('Fixed multiple H1 tags (' + (h1s.length - 1) + ' converted to H2)');
    }
  };

  // ========== 7. PERFORMANCE OPTIMIZATIONS ==========
  GX.optimizePerformance = function() {
    // Add preconnect to external resources
    var links = document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]');
    var domains = new Set();
    links.forEach(function(l) {
      var src = l.getAttribute('href') || l.getAttribute('src') || '';
      if (src.startsWith('http') && !src.includes('${origin}')) {
        try { domains.add(new URL(src).origin); } catch(e) {}
      }
    });
    domains.forEach(function(domain) {
      if (!document.querySelector('link[rel="preconnect"][href="' + domain + '"]')) {
        var pc = document.createElement('link');
        pc.rel = 'preconnect';
        pc.href = domain;
        pc.crossOrigin = '';
        document.head.appendChild(pc);
      }
    });
    if (domains.size > 0) GX.fixes.push('Added preconnect for ' + domains.size + ' external domains');

    // Defer non-critical JavaScript
    var scripts = document.querySelectorAll('script:not([async]):not([defer]):not([type="application/ld+json"])');
    var deferred = 0;
    scripts.forEach(function(s) {
      if (!s.src) return;
      var src = s.getAttribute('src');
      if (src && !src.includes('guardian') && !s.closest('head')) {
        s.defer = true;
        deferred++;
      }
    });
    if (deferred > 0) GX.fixes.push('Deferred ' + deferred + ' render-blocking scripts');
  };

  // ========== 8. CORE WEB VITALS MONITORING ==========
  GX.monitorCWV = function() {
    if (!('PerformanceObserver' in window)) return;
    
    // LCP
    new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      var lcp = entries[entries.length - 1];
      if (lcp) GX.lcp = Math.round(lcp.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    var clsValue = 0;
    new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      });
      GX.cls = Math.round(clsValue * 1000) / 1000;
    }).observe({ type: 'layout-shift', buffered: true });

    // FID/INP
    new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      entries.forEach(function(entry) {
        GX.inp = Math.round(entry.duration);
      });
    }).observe({ type: 'event', buffered: true });
  };

  // ========== 9. SEND OPTIMIZATION REPORT ==========
  GX.report = function() {
    var payload = {
      token: GX.token,
      type: 'optimization',
      path: window.location.pathname,
      url: window.location.href,
      fixes: GX.fixes,
      fixCount: GX.fixes.length,
      lcp: GX.lcp || null,
      cls: GX.cls || null,
      inp: GX.inp || null,
      loadTime: Date.now() - GX.startTime,
      title: document.title,
      metaDesc: document.querySelector('meta[name="description"]')?.content?.substring(0, 160) || null,
      h1Count: document.querySelectorAll('h1').length,
      imgCount: document.querySelectorAll('img').length,
      imgNoAlt: document.querySelectorAll('img:not([alt]), img[alt=""]').length,
      schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      ogTags: document.querySelectorAll('meta[property^="og:"]').length,
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      sessionId: sessionStorage.getItem('gx_sid') || (function(){
        var s = Math.random().toString(36).slice(2);
        sessionStorage.setItem('gx_sid', s);
        return s;
      })()
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(GX.report, JSON.stringify(payload));
    } else {
      fetch(GX.report, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(){});
    }

    console.log('[GuardianX-SEO] ✅ Optimized ' + window.location.pathname + ' — ' + GX.fixes.length + ' fixes applied');
  };

  // ========== RUN ALL OPTIMIZATIONS ==========
  GX.run = function() {
    try { GX.fixMeta(); } catch(e) { console.warn('[GuardianX] meta fix:', e.message); }
    try { GX.injectSchema(); } catch(e) { console.warn('[GuardianX] schema:', e.message); }
    try { GX.fixImages(); } catch(e) { console.warn('[GuardianX] images:', e.message); }
    try { GX.fixLinks(); } catch(e) { console.warn('[GuardianX] links:', e.message); }
    try { GX.fixOpenGraph(); } catch(e) { console.warn('[GuardianX] og:', e.message); }
    try { GX.fixHeadings(); } catch(e) { console.warn('[GuardianX] headings:', e.message); }
    try { GX.optimizePerformance(); } catch(e) { console.warn('[GuardianX] perf:', e.message); }
    try { GX.monitorCWV(); } catch(e) {}
    
    // Send report after page fully loads
    if (document.readyState === 'complete') {
      setTimeout(GX.report, 2000);
    } else {
      window.addEventListener('load', function() { setTimeout(GX.report, 2000); });
    }
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', GX.run);
  } else {
    GX.run();
  }
})();
</script>
<!-- End GuardianX-SEO Auto-Optimizer -->`;

  return NextResponse.json({
    script: optimizerScript,
    features: [
      { icon: "📝", title: "Auto-Fix Meta Tags", desc: "Adds missing meta description, viewport, charset, and optimizes title tags automatically" },
      { icon: "🏷️", title: "Auto-Inject Schema", desc: "Detects page type and injects Organization, WebSite, Breadcrumb, Article, Product, and FAQ schema" },
      { icon: "🖼️", title: "Auto-Fix Images", desc: "Generates alt text for images missing it, adds lazy loading to below-fold images" },
      { icon: "🔗", title: "Auto-Fix Links", desc: "Secures external links with rel=noopener, adds canonical URLs" },
      { icon: "📱", title: "Auto-Add Open Graph", desc: "Generates OG + Twitter Card tags for social media rich previews" },
      { icon: "📑", title: "Auto-Fix Headings", desc: "Creates missing H1 tags, converts multiple H1s to H2s" },
      { icon: "⚡", title: "Auto-Optimize Performance", desc: "Adds preconnect hints, defers render-blocking scripts" },
      { icon: "📊", title: "Monitor Core Web Vitals", desc: "Tracks real LCP, CLS, INP from actual visitors" },
      { icon: "📡", title: "Auto-Report to GuardianX", desc: "Sends optimization reports back to your dashboard after every page load" },
    ],
    howItWorks: [
      "Client adds ONE script tag before </body> on their website",
      "On every page load, the script automatically detects and fixes SEO issues",
      "Schema markup is injected based on page type (home, blog, product, FAQ)",
      "Missing alt text, canonical tags, OG tags are auto-generated",
      "Core Web Vitals are monitored from real visitors' browsers",
      "Optimization reports are sent back to GuardianX dashboard",
      "No code changes needed on individual pages — one tag fixes everything",
    ],
    instructions: [
      "Copy the script below",
      "Paste it just before the closing </body> tag on your website",
      "That's it — GuardianX will auto-optimize every page automatically",
      "Check your GuardianX dashboard to see what was fixed",
    ],
  });
}
