import { NextResponse } from "next/server";

function formatPriceForDisplay(price: number): string {
  if (!price || price >= 0.01) {
    return price.toFixed(6);
  }

  const str = price.toFixed(12);
  const match = str.match(/^0\.0+(?=[1-9])/);

  if (!match) {
    return price.toFixed(6);
  }

  const zeroCount = match[0].length - 2;
  const rest = str.slice(match[0].length, match[0].length + 5); // only take 5 digits

  return `0.0<span class="sub">${zeroCount}</span>${rest}`;
}


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

    const formattedPrice = formatPriceForDisplay(priceUsd);

    return NextResponse.json({
      symbol,
      priceUsd,
      percentChange24h,
      formattedPrice,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
