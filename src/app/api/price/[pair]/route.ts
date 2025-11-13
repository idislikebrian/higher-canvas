export async function GET(
  req: Request,
  context: { params: Promise<{ pair: string }> }
) {
  const { pair } = await context.params;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/base/${pair}`,
      { next: { revalidate: 15 } }
    );

    const data = await res.json();

    if (!data.pair) {
      return Response.json(
        { error: "Pair not found", priceUsd: null },
        { status: 404 }
      );
    }

    const p = data.pair;

    return Response.json({
      priceUsd: Number(p.priceUsd),
      symbol: p.baseToken.symbol,
    });
  } catch {
    return Response.json({ error: "API error", priceUsd: null }, { status: 500 });
  }
}
