import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ pair: string }> } // Next 15: params is async
) {
  const { pair } = await context.params;

  try {
    // Dexscreener pair endpoint: chain + pair-address
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/base/${pair}`,
      { next: { revalidate: 10 } } // cache hint is fine
    );
    const json = await res.json();

    const p = json?.pairs?.[0] ?? {};
    const priceUsd = Number(p?.priceUsd ?? 0);
    const symbol = String(p?.baseToken?.symbol ?? "").toUpperCase();
    // 24h percentage change (can be string or number in their API)
    const change24h = Number(p?.priceChange?.h24 ?? 0);

    return NextResponse.json({ symbol, priceUsd, change24h });
  } catch {
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
