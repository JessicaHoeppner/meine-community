"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type LiveSession = {
  id: string;
  titel: string;
  beschreibung: string | null;
  datum: string;
  status: "geplant" | "live" | "beendet";
  meeting_link: string | null;
};

type ChatMessage = {
  id: string;
  session_id: string;
  nutzer_id: string;
  nachricht: string;
  erstellt_am: string;
  profiles?: { anzeigename: string | null; avatar_url: string | null } | null;
};

export default function LiveSessionDetailPage() {
  return (
    <AuthGuard>
      <LiveDetailInner />
    </AuthGuard>
  );
}

function LiveDetailInner() {
  const params = useParams();
  const sessionId = String(params.id);

  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session + user
  useEffect(() => {
    const load = async () => {
      const [{ data: userData }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("live_sessions")
          .select("id, titel, beschreibung, datum, status, meeting_link")
          .eq("id", sessionId)
          .maybeSingle(),
      ]);

      if (userData.user) {
        setCurrentUserId(userData.user.id);
      }

      setSession(sessionData as LiveSession | null);
      setLoading(false);
    };
    load();
  }, [sessionId]);

  // Load chat messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("session_chat")
        .select("id, session_id, nutzer_id, nachricht, erstellt_am, profiles(anzeigename, avatar_url)")
        .eq("session_id", sessionId)
        .order("erstellt_am", { ascending: true });
      setMessages((data as ChatMessage[]) ?? []);
    };
    loadMessages();
  }, [sessionId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`live-chat-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "session_chat", filter: `session_id=eq.${sessionId}` },
        async (payload) => {
          const row = payload.new as ChatMessage;
          const { data: profile } = await supabase
            .from("profiles")
            .select("anzeigename, avatar_url")
            .eq("id", row.nutzer_id)
            .maybeSingle();
          setMessages((prev) => [
            ...prev,
            { ...row, profiles: profile as { anzeigename: string | null; avatar_url: string | null } | null },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || sending) return;
    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);
    await supabase.from("session_chat").insert({
      session_id: sessionId,
      nutzer_id: currentUserId,
      nachricht: text,
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
        Laden…
      </div>
    );
  }

  if (!session) {
    return (
        <p style={{ color: "#9b8f87", fontSize: "15px" }}>Session nicht gefunden.</p>
        <Link href="/dashboard/live" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>← Zurück</Link>
      </div>
    );
  }

  const isLive = session.status === "live";
  const formattedDate = new Date(session.datum).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = new Date(session.datum).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
        <main style={{ maxWidth: "1020px", margin: "0 auto", padding: "64px 24px 100px" }}>

          <Link href="/dashboard/live" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9b8f87", fontSize: "13px", fontWeight: 500, textDecoration: "none", marginBottom: "36px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
            ← Live Sessions
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>

            {/* Left: Session info */}
            <div>
              {/* Status badge */}
              <div style={{ marginBottom: "20px" }}>
                {isLive && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: "var(--color-primary)", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "4px 12px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff", display: "inline-block", animation: "pulse-live 1.4s ease-in-out infinite" }} />
                    Live
                  </span>
                )}
                {session.status === "geplant" && (
                  <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(60,44,36,0.07)", color: "#7a6d65", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "4px 12px" }}>
                    Geplant
                  </span>
                )}
                {session.status === "beendet" && (
                  <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(60,44,36,0.07)", color: "#9b8f87", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "4px 12px" }}>
                    Beendet
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "40px", fontWeight: 300, color: "var(--color-text)", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "0.01em" }}>
                {session.titel}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9b8f87", fontSize: "14px", marginBottom: "24px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {formattedDate} · {formattedTime} Uhr
              </div>

              {session.beschreibung && (
                <p style={{ color: "#5c514a", fontSize: "16px", lineHeight: 1.75, marginBottom: "36px" }}>
                  {session.beschreibung}
                </p>
              )}

              {/* Join button */}
              {session.meeting_link && session.status !== "beendet" && (
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="join-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    borderRadius: "50px",
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                    textDecoration: "none",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "15px",
                    letterSpacing: "0.02em",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {isLive ? "Jetzt teilnehmen →" : "Zur Session →"}
                </a>
              )}
            </div>

            {/* Right: Chat */}
            <div style={{ backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.08)", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column", height: "560px" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(60,44,36,0.07)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: "var(--color-text)" }}>
                  Live-Chat
                </div>
                {isLive && (
                  <div style={{ fontSize: "12px", color: "#9b8f87", marginTop: "2px" }}>
                    Stell deine Fragen in Echtzeit
                  </div>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {messages.length === 0 ? (
                  <div style={{ color: "#b3a89e", fontSize: "14px", textAlign: "center", marginTop: "40px" }}>
                    Noch keine Nachrichten.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {messages.map((msg) => {
                      const isMine = msg.nutzer_id === currentUserId;
                      const name = msg.profiles?.anzeigename ?? "Mitglied";
                      const avatar = msg.profiles?.avatar_url ?? null;
                      const time = new Date(msg.erstellt_am).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div key={msg.id} style={{ display: "flex", gap: "10px", flexDirection: isMine ? "row-reverse" : "row" }}>
                          <div style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#ede5dc" }}>
                            {avatar ? (
                              <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#9b8f87" }}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div style={{ maxWidth: "75%" }}>
                            <div style={{ fontSize: "11px", color: "#9b8f87", marginBottom: "4px", textAlign: isMine ? "right" : "left" }}>
                              {isMine ? "Du" : name} · {time}
                            </div>
                            <div style={{
                              padding: "10px 14px",
                              borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                              backgroundColor: isMine ? "#b43b32" : "#f0ece6",
                              color: isMine ? "#fff" : "#3c2c24",
                              fontSize: "14px",
                              lineHeight: 1.55,
                              wordBreak: "break-word",
                            }}>
                              {msg.nachricht}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {currentUserId && (
                <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(60,44,36,0.07)", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <textarea
                    className="chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLive ? "Nachricht senden…" : "Chat nur bei laufender Session aktiv"}
                    disabled={!isLive}
                    rows={1}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid rgba(60,44,36,0.12)",
                      backgroundColor: "#fbf8f4",
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--color-text)",
                      resize: "none",
                      lineHeight: 1.5,
                      transition: "border-color 0.2s ease",
                      opacity: isLive ? 1 : 0.5,
                    }}
                  />
                  <button
                    type="button"
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending || !isLive}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "var(--color-primary)",
                      color: "#fff",
                      cursor: newMessage.trim() && !sending && isLive ? "pointer" : "not-allowed",
                      opacity: newMessage.trim() && !sending && isLive ? 1 : 0.45,
                      transition: "background-color 0.2s ease, opacity 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

        </main>
  );
}