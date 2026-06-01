import { detectBot } from '@aiedx/fetchlens-core';

export default function middleware(request: Request, event: any) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Use fetchlens-core to detect bots
  const bot = detectBot(userAgent);
  const isAI = bot && bot.category === 'ai';

  // Log the visit to LogSnag asynchronously
  const logPromise = fetch('https://api.logsnag.com/v1/log', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer cf410b022ad002f05f80af9a6c29c4d2', 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      project: "bot-or-human",
      channel: "visits",
      event: bot ? "Bot Visit" : "Human Visit",
      description: bot ? `Bot: ${bot.name} (${bot.provider})` : `User Agent: ${userAgent}`,
      icon: bot ? "🤖" : "👤",
      tags: { 
        category: bot?.category || "human",
        name: bot?.name || "unknown",
        is_ai: isAI ? "true" : "false",
        siteName: "app.songjam.space"
      }
    })
  }).catch(err => console.error("LogSnag Error:", err));

  // Ensure the fetch completes even after the response is sent
  if (event && event.waitUntil) {
    event.waitUntil(logPromise);
  }
  if (isAI) {
    // Return 402 Payment Required for AI agents
    return new Response(
      JSON.stringify({ 
        error: "Payment Required", 
        message: "AI training/scraping access requires a license." 
      }),
      { 
        status: 402, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Returning nothing (undefined) tells Vercel to pass the request through normally
}

export const config = {
  // Only run the middleware on document requests, skip static assets
  matcher: ['/((?!assets|vite\\.svg|favicon\\.ico).*)'],
};
