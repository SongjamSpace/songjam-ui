export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Define patterns for AI agents and crawlers
  const aiBots = [/GPTBot/i, /ChatGPT-User/i, /ClaudeBot/i, /PerplexityBot/i, /Meta-ExternalAgent/i];
  const isAI = aiBots.some((bot) => bot.test(userAgent));

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
