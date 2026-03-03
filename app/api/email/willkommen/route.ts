import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/src/lib/resend";

const FROM = "onboarding@resend.dev";
const PLATTFORM_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getWelcomeHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: system-ui, -apple-system, sans-serif; background-color: #F5F2EE;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px;">
    <div style="background-color: #FFFFFF; border: 1px solid #E8E4E0; border-radius: 16px; padding: 32px 24px;">
      <h1 style="margin: 0 0 16px 0; font-size: 1.5rem; font-weight: 700; color: #2E2E2E;">
        Willkommen in unserer Community!
      </h1>
      <p style="margin: 0 0 16px 0; font-size: 1rem; line-height: 1.6; color: #2E2E2E;">
        Schön, dass du dabei bist. Bei uns findest du Kurse, Austausch mit anderen Mitgliedern und Support – alles an einem Ort.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 1rem; line-height: 1.6; color: #2E2E2E;">
        Stöbere in den Kursen, stelle Fragen im Community-Feed und werde Teil der Gruppe.
      </p>
      <p style="margin: 0;">
        <a href="${PLATTFORM_URL}" style="display: inline-block; padding: 12px 24px; border-radius: 999px; background-color: #8B3A3A; color: #FFFFFF; font-weight: 600; font-size: 1rem; text-decoration: none;">
          Zur Plattform
        </a>
      </p>
    </div>
    <p style="margin-top: 16px; font-size: 0.85rem; color: #6B6562; text-align: center;">
      Meine Community
    </p>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = typeof body.to === "string" ? body.to.trim() : null;

    if (!to) {
      return NextResponse.json(
        { error: "E-Mail-Adresse (to) fehlt." },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json({ success: true });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: "Willkommen in unserer Community!",
      html: getWelcomeHtml(),
    });

    if (error) {
      console.error("Resend willkommen error:", error);
      return NextResponse.json(
        { error: error.message ?? "E-Mail konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id, success: true });
  } catch (err) {
    console.error("Willkommen email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "E-Mail fehlgeschlagen" },
      { status: 500 }
    );
  }
}
