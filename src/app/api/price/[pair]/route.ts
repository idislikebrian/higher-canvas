import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ pair: string }> }
) {
  const { pair } = await context.params;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/base/${pair}`,
      { next: { revalidate: 10 } }
    );
    const json = await res.json();

    const p = json?.pairs?.[0] ?? {};
    const priceUsd = Number(p?.priceUsd ?? 0);
    const symbol = String(p?.baseToken?.symbol ?? "").toUpperCase();
    const percentChange24h = Number(p?.priceChange?.h24 ?? 0);

    return NextResponse.json({
      symbol,
      priceUsd,
      percentChange24h,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
