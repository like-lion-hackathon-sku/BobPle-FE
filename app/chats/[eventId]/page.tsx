// app/chats/[eventId]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, LogOut } from "lucide-react";

import { apiRequest } from "@/lib/api";
import { chatAPI, openChatSocket, type ChatMessage } from "@/lib/api";

const POLL_MS = 3500;

const isAuthError = (err: any) => {
  const s = Number(err?.status || err?.response?.status || err?.code || 0);
  const code = err?.payload?.error?.errorCode;
  const msg = String(err?.payload?.error?.reason || err?.message || "").toLowerCase();
  return s === 401 || s === 403 || code === "U003" || msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("로그인");
};

// 낙관 추가/에코 중복 방지용
const isDup = (a: ChatMessage, b: ChatMessage) => {
  const ta = new Date(a.createdAt || "").getTime();
  const tb = new Date(b.createdAt || "").getTime();
  const secSame = Number.isFinite(ta) && Number.isFinite(tb) && Math.abs(ta - tb) < 1000;
  return String(a.userId) === String(b.userId) && a.content === b.content && secSame;
};

export default function ChatRoomPage() {
  const router = useRouter();
  // ✅ 폴더명이 [eventId]이므로 여기서도 eventId로 받아야 함
  const { eventId: eventIdParam } = useParams<{ eventId: string }>();
  const search = useSearchParams();
  const titleFromQuery = search?.get("title") || "";

  const eventId = useMemo(() => {
    const n = Number(eventIdParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [eventIdParam]);

  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [wsReady, setWsReady] = useState(false);
  const [guardMsg, setGuardMsg] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  // 스크롤 항상 하단
  useEffect(() => {
    const id = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    return () => clearTimeout(id);
  }, [messages]);

  // 초기 히스토리(스펙: 최초엔 cursor 미전송, size만)
  useEffect(() => {
    if (eventId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { items } = await chatAPI.getChatRoom(eventId, { size: 30 });
        if (!cancelled) setMessages(items);
      } catch (e1) {
        try {
          const raw = await apiRequest(`/api/chats/${eventId}?size=30`);
          const d = (raw as any)?.data ?? raw;
          const list: any[] = Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [];
          if (!cancelled) setMessages(list as ChatMessage[]);
        } catch (err) {
          if (isAuthError(err)) setGuardMsg("이 채팅방은 참여 신청한 사용자만 입장할 수 있어요.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // 폴링 (최신 페이지만 갱신: cursor 없이 size만)
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  const startPolling = () => {
    stopPolling();
    if (eventId == null) return;
    pollRef.current = setInterval(async () => {
      try {
        const { items: next } = await chatAPI.getChatRoom(eventId, { size: 30 });
        setMessages((prev) => {
          if (next.length !== prev.length) return next;
          const a = prev[prev.length - 1]?.content;
          const b = next[next.length - 1]?.content;
          return a === b ? prev : next;
        });
      } catch (err) {
        if (isAuthError(err)) {
          setGuardMsg("이 채팅방은 참여 신청한 사용자만 입장할 수 있어요.");
          stopPolling();
        }
      }
    }, POLL_MS);
  };

  // WS 연결 + 폴백
  useEffect(() => {
    if (eventId == null) return;
    const token =
      (typeof window !== "undefined" &&
        (localStorage.getItem("authToken") || localStorage.getItem("accessToken"))) ||
      "";

    const ws = openChatSocket(eventId, {
      token,
      onOpen: () => {
        setWsReady(true);
        stopPolling();
      },
      onClose: () => {
        setWsReady(false);
        startPolling();
      },
      onError: () => {
        setWsReady(false);
        try { ws.close(); } catch {}
        startPolling();
      },
      onMessage: (data: any) => {
        if (!data) return;
        if (data.type === "message") {
          const m: ChatMessage = {
            id: data.id,
            userId: data.userId ?? data.user?.id ?? null,
            content: data.content ?? data.message ?? data.text ?? "",
            createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
          };
          if (m.content) {
            setMessages((prev) => (prev.some((x) => isDup(x, m)) ? prev : [...prev, m]));
          }
        } else if (data.type === "join-ack" && data.ok === false) {
          setGuardMsg("이 채팅방은 참여 신청한 사용자만 입장할 수 있어요.");
        }
      },
    });

    wsRef.current = ws;
    const fallbackTimer = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) startPolling();
    }, 1200);

    return () => {
      clearTimeout(fallbackTimer);
      stopPolling();
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, [eventId]);

  // 전송 (WS 우선, 실패 시 POST 폴백)
  const send = async () => {
    if (eventId == null) return;
    const content = text.trim();
    if (!content) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "send", eventId, content }));
      setMessages((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, userId: meId ?? null, content, createdAt: new Date().toISOString() },
      ]);
      setText("");
      return;
    }

    try {
      await chatAPI.sendMessage(eventId, { content });
      setText("");
      const { items } = await chatAPI.getChatRoom(eventId, { size: 30 });
      setMessages(items);
    } catch (e) {
      console.warn("메시지 전송 실패:", e);
    }
  };

  // 나가기
  const leave = async () => {
    if (eventId == null) return;
    setLeaving(true);
    try {
      await chatAPI.leaveChat(eventId);
      try { wsRef.current?.close(); } catch {}
      router.replace("/chats");
    } catch (e) {
      console.error("[chatRoom] leave failed:", e);
      router.replace(`/events/${eventId}`);
    } finally {
      setLeaving(false);
    }
  };

  if (eventId == null) {
    return (
      <div className="min-h-screen grid place-items-center text-destructive">
        유효하지 않은 채팅방 ID입니다.
      </div>
    );
  }

  if (guardMsg) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="font-semibold flex-1">{titleFromQuery || `채팅방 #${eventIdParam}`}</div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Card className="p-4">
            <div className="text-sm text-destructive">{guardMsg}</div>
            <div className="mt-3">
              <Button onClick={() => router.push(`/events/${eventIdParam}`)}>이벤트로 이동</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="font-semibold flex-1">{titleFromQuery || `채팅방 #${eventIdParam}`}</div>
          <Button variant="outline" size="sm" onClick={leave} disabled={leaving}>
            {leaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
            나가기
          </Button>
        </div>
      </div>

      {/* 본문 */}
      <div className="container mx-auto flex-1 px-4 py-4 w-full max-w-3xl">
        <Card className="h-[68vh] overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">대화를 시작해보세요.</div>
          ) : (
            messages.map((m, idx) => {
              const mine = meId != null && String(m.userId ?? "") === String(meId);
              return (
                <div key={String(m.id ?? idx)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                    title={m.createdAt ? new Date(m.createdAt).toLocaleString("ko-KR") : ""}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </Card>

        {/* 입력 */}
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            placeholder="메시지를 입력하세요…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button type="submit" disabled={!text.trim()}>
            <Send className="w-4 h-4 mr-1" />
            보내기
          </Button>
        </form>

        {!wsReady && (
          <div className="mt-2 text-xs text-muted-foreground">
            실시간 연결이 꺼져 있어 주기적으로 새 메시지를 불러오고 있어요.
          </div>
        )}
      </div>
    </div>
  );
}
