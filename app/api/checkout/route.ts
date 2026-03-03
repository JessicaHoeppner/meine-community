import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";

const BASE_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const PRICES: Record<string, { amount: number; currency: string; name: string }> = {
  monatlich: { amount: 2900, currency: "eur", name: "Monatlich (29 €)" },
  jaehrlich: { amount: 24900, currency: "eur", name: "Jaehrlich (249 €)" },
  einmalig: { amount: 19900, currency: "eur", name: "Einmalig (199 €)" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preisTyp = (body.preisTyp as string)?.toLowerCase();

    if (!preisTyp || !PRICES[preisTyp]) {
      return NextResponse.json(
        { error: "Ungueltiger preisTyp. Erlaubt: monatlich, jaehrlich, einmalig" },
        { status: 400 }
      );
    }

    const price = PRICES[preisTyp];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: price.currency,
            product_data: {
              name: price.name,
              description: "Mitgliedschaft Meine Community",
            },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/zahlung/erfolg`,
      cancel_url: `${BASE_URL}/zahlung/abbruch`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout-URL konnte nicht erstellt werden." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout fehlgeschlagen" },
      { status: 500 }
    );
  }
}
