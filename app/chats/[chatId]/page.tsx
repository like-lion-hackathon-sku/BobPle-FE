"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, LogOut } from "lucide-react";
import { chatAPI, openChatSocket, type ChatMessage } from "@/lib/api";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "1";

export default function ChatRoomPage() {
  const router = useRouter();
  const { chatId } = useParams<{ chatId: string }>();
  const eventId = Number(chatId);

  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const [guardMsg, setGuardMsg] = useState<string | null>(null);

  const meId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // 과거 메시지 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await chatAPI.getChatRoom(eventId).catch((err) => {
          if (DEBUG) console.error("[chatRoom] history load failed:", err);
          return [];
        });
        if (!cancelled) setMessages(Array.isArray(list) ? list : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [eventId]);

  // WS 연결 + 폴링 폴백
  useEffect(() => {
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    const startPolling = () => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        const list = await chatAPI.getChatRoom(eventId).catch(() => null);
        if (!Array.isArray(list)) return;
        setMessages((prev) => {
          if (list.length !== prev.length) return list;
          const a = prev[prev.length - 1]?.content;
          const b = list[list.length - 1]?.content;
          return a === b ? prev : list;
        });
      }, 3500);
    };

    const token =
      (typeof window !== "undefined" &&
        (localStorage.getItem("authToken") || localStorage.getItem("accessToken"))) ||
      "";

    const ws = openChatSocket(eventId, {
      token,
      onOpen: () => {
        setWsReady(true);
        stopPolling();
        if (DEBUG) console.log("[chatRoom] ws open:", eventId);
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
      onMessage: (data) => {
        if (!data) return;
        if (data.type === "message") {
          const m: ChatMessage = {
            id: data.id,
            userId: data.user?.id ?? data.userId ?? null,
            content: data.content ?? "",
            createdAt: data.createdAt ?? new Date().toISOString(),
          };
          if (m.content) setMessages((prev) => [...prev, m]);
        } else if (data.type === "join-ack" && data.ok === false) {
          setGuardMsg("이 채팅방은 참여 신청한 사용자만 입장할 수 있어요.");
        }
      },
    });

    wsRef.current = ws;

    return () => {
      stopPolling();
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, [eventId]);

  const send = () => {
    const content = text.trim();
    if (!content) return;

    // ✅ WS 열렸을 때만 전송 (REST 폴백 없음)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "send", eventId, content }));
      // 낙관적 렌더
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          userId: meId ?? null,
          content,
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
    } else {
      console.warn("실시간 연결이 열리지 않아 메시지를 보낼 수 없습니다.");
    }
  };

  const leave = () => {
    setLeaving(true);
    try {
      wsRef.current?.send(JSON.stringify({ type: "leave", eventId }));
    } catch {}
    setTimeout(() => {
      setLeaving(false);
      router.replace("/chats");
    }, 200);
  };

  if (guardMsg) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="font-semibold flex-1">채팅방 #{chatId}</div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Card className="p-4">
            <div className="text-sm text-destructive">{guardMsg}</div>
            <div className="mt-3">
              <Button onClick={() => router.push(`/events/${chatId}`)}>이벤트로 이동</Button>
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
          <div className="font-semibold flex-1">채팅방 #{chatId}</div>
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

        {/* 입력창 */}
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
