/**
 * Server-side bot detection for first-party analytics.
 *
 * The site's own pageview tracker (`trackPageView`) fires from client JS, so it
 * captures anything that executes JavaScript — including the huge population of
 * crawlers, SEO/AI scrapers, uptime monitors and headless browsers that now run
 * a full JS engine. Those inflate "visitors" massively (each starts with a fresh
 * localStorage, so every hit looks like a brand-new person). Google Analytics
 * silently filters this traffic via the IAB/ABC bots-and-spiders list; we had no
 * equivalent, which is the main reason our dashboard read ~10x higher than GA.
 *
 * This is a User-Agent heuristic — deliberately conservative (better to keep a
 * borderline human than to drop one). The raw UA is stored on each row so the
 * rule can be audited and tightened later.
 */

/**
 * Substrings that unambiguously identify non-human traffic. Matched
 * case-insensitively against the User-Agent. Kept broad on purpose: these tokens
 * do not appear in normal Chrome/Safari/Firefox/Edge UAs.
 */
const BOT_UA_TOKENS: string[] = [
  // Generic crawler markers
  "bot",
  "spider",
  "crawl",
  "slurp",
  "scrap",
  "fetch",
  "index",
  "monitor",
  "preview",
  "validator",
  "archiver",
  "wget",
  "curl",
  // HTTP libraries / headless runtimes (scripted traffic)
  "python-requests",
  "python-httpx",
  "aiohttp",
  "okhttp",
  "axios",
  "node-fetch",
  "go-http-client",
  "java/",
  "libwww",
  "httpclient",
  "httpunit",
  "phantomjs",
  "headlesschrome",
  "electron",
  "puppeteer",
  "playwright",
  "selenium",
  "lighthouse",
  "chrome-lighthouse",
  "pagespeed",
  "gtmetrix",
  "pingdom",
  "uptimerobot",
  "statuscake",
  "site24x7",
  // Search / social / AI crawlers (named)
  "googlebot",
  // GoogleOther + the rest of Google's crawler family: these execute JS and ride
  // Google's standard "Nexus 5X; Android 6.0.1 … (compatible; GoogleOther)"
  // reference UA, which carries NO "bot" token — so they were the single largest
  // leak into first-party analytics (measured ~48% of captured traffic).
  "googleother",
  "google-safety",
  "storebot-google",
  "google-read-aloud",
  "feedfetcher-google",
  "google-cloudvertexbot",
  "googleweblight",
  "googleusercontent",
  "google-inspectiontool",
  "adsbot",
  "mediapartners",
  "apis-google",
  "feedfetcher",
  "bingbot",
  "bingpreview",
  "yandexbot",
  "yandex.com/bots",
  "yandeximages",
  "yandexmetrika",
  "duckduckbot",
  "baiduspider",
  "sogou",
  "exabot",
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "telegrambot",
  "whatsapp",
  "vkshare",
  "vkrobot",
  "pinterest",
  "redditbot",
  "discordbot",
  "slackbot",
  "applebot",
  "petalbot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "dataforseo",
  "seznambot",
  "bytespider",
  "amazonbot",
  // AI / LLM crawlers
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "ccbot",
  "claudebot",
  "claude-web",
  "anthropic-ai",
  "perplexitybot",
  "perplexity-user",
  "google-extended",
  "meta-externalagent",
  "cohere-ai",
  "diffbot",
  "imagesiftbot",
  "omgili",
];

/**
 * Returns true when the given User-Agent looks like a bot, crawler, scraper,
 * headless browser, monitor or HTTP library rather than a human browser.
 *
 * An empty/missing UA is treated as a bot: real browsers always send one, while
 * scripted clients frequently omit it.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  // A legitimate browser UA is reasonably long; extremely short UAs are scripts.
  if (ua.length < 12) return true;
  return BOT_UA_TOKENS.some((token) => ua.includes(token));
}
