import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/src/lib/resend";

const FROM = "onboarding@resend.dev";

const PLATTFORM_URL =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getCommentNotificationHtml(postTitel: string, commentText: string, postUrl: string): string {
  const safeTitel = postTitel.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeComment = commentText.replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 300);
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
      <h1 style="margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 700; color: #2E2E2E;">
        Neuer Kommentar zu deinem Beitrag
      </h1>
      <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: #6B6562;">
        Beitrag: <strong style="color: #2E2E2E;">${safeTitel}</strong>
      </p>
      <p style="margin: 0 0 20px 0; font-size: 1rem; line-height: 1.6; color: #2E2E2E;">
        ${safeComment}${commentText.length > 300 ? "…" : ""}
      </p>
      <p style="margin: 0;">
        <a href="${postUrl}" style="display: inline-block; padding: 10px 20px; border-radius: 999px; background-color: #8B3A3A; color: #FFFFFF; font-weight: 600; font-size: 0.95rem; text-decoration: none;">
          Beitrag ansehen
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
    const postTitel = typeof body.postTitel === "string" ? body.postTitel.trim() : "Dein Beitrag";
    const commentText = typeof body.commentText === "string" ? body.commentText.trim() : "";
    const postId = typeof body.postId === "string" ? body.postId.trim() : "";
    const postUrl = postId ? `${PLATTFORM_URL}/dashboard/community/${postId}` : PLATTFORM_URL;

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
      subject: "Neuer Kommentar zu deinem Beitrag",
      html: getCommentNotificationHtml(postTitel, commentText, postUrl),
    });

    if (error) {
      console.error("Resend neuer-kommentar error:", error);
      return NextResponse.json(
        { error: error.message ?? "E-Mail konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id, success: true });
  } catch (err) {
    console.error("Neuer Kommentar email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "E-Mail fehlgeschlagen" },
      { status: 500 }
    );
  }
}
