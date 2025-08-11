import yahooFinance from "yahoo-finance2";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) {
    return new Response(JSON.stringify({ error: "Missing symbol" }), {
      status: 400,
    });
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    return new Response(JSON.stringify(quote), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
