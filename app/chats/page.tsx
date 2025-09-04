// app/chats/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search } from "lucide-react";
import { eventAPI, chatAPI } from "@/lib/api";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "1";

type ChatPreview = {
  id: number | string;       // chatId (= eventId 가정)
  title: string;
  lastMessage?: string | null;
  lastAt?: string | null;    // ISO
  participants?: number | null;
};

const MOCK_CHAT: ChatPreview = {
  id: "mock-1",
  title: "샘플 채팅방",
  lastMessage: "연결되면 실제 데이터가 표시됩니다.",
  lastAt: new Date().toISOString(),
  participants: 2,
};

function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  if (Array.isArray(v?.data?.items)) return v.data.items;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.success?.items)) return v.success.items;
  return [];
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ChatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChatPreview[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setUsedMock(false);

      try {
        // 1) 내가 신청/참여한 밥약 목록 (응답형식 정규화!)
        const appsRes = await eventAPI.getMyEvents().catch((e: any) => {
          throw new Error("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        });
        const myApps = asArray(appsRes);

        if (myApps.length === 0) {
          if (!cancelled) {
            setError("참여 중인 채팅방(밥약)이 없습니다.");
            setItems([MOCK_CHAT]);
            setUsedMock(true);
          }
          return;
        }

        // 2) 상위 20개에 대해 최근 메시지 1개 조회
        const top = myApps.slice(0, 20);

        const results = await Promise.allSettled(
          top.map(async (app: any) => {
            const eventId = Number(app?.eventId ?? app?.id);     // ← 채팅방 = 이벤트ID
            const title = app?.title ?? "제목 없음";
            const participants =
              app?.participantsCount ??
              app?.participants_count ??
              app?.current_participants ??
              app?.currentParticipants ??
              null;

            // GET /api/chats/{chatId}
            let msgs: any[] = [];
            try {
              const r = await chatAPI.getChatRoom(eventId);
              msgs = asArray(r);
            } catch (err) {
              if (DEBUG) console.error("[chats] getChatRoom failed:", eventId, err);
            }

            const last = msgs.length ? msgs[msgs.length - 1] : null;
            const lastMessage = last?.content ?? null;
            const lastAt = last?.created_at ?? last?.createdAt ?? null;

            return {
              id: eventId,
              title,
              lastMessage,
              lastAt,
              participants,
            } as ChatPreview;
          })
        );

        const previews = results
          .map((r) => (r.status === "fulfilled" ? r.value : null))
          .filter(Boolean) as ChatPreview[];

        if (!cancelled) {
          if (previews.length === 0) {
            setError("채팅 내역이 없어 샘플 데이터를 보여드려요.");
            setItems([MOCK_CHAT]);
            setUsedMock(true);
          } else {
            // 최근 메시지 시간 기준 정렬(없으면 뒤로)
            previews.sort((a, b) => {
              const ta = a.lastAt ? Date.parse(a.lastAt) : 0;
              const tb = b.lastAt ? Date.parse(b.lastAt) : 0;
              return tb - ta;
            });
            setItems(previews);
          }
        }
      } catch (e: any) {
        if (DEBUG) console.error("[chats] load error:", e);
        setError(e?.message || "데이터를 불러오지 못했습니다.");
        setItems([MOCK_CHAT]);
        setUsedMock(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (usedMock) return items;
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(s));
  }, [items, q, usedMock]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5" />
          <h1 className="text-xl font-semibold">채팅</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-3xl">
        {error && (
          <div className="mb-4 p-3 text-sm rounded-md border border-destructive/30 text-destructive bg-destructive/10">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="채팅방 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={usedMock}
          />
        </div>

        <Separator className="mb-4" />

        {loading ? (
          <div className="text-sm text-muted-foreground">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">표시할 채팅방이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const isMock = typeof c.id === "string" && c.id.startsWith("mock-");
              return (
                <Card
                  key={c.id}
                  className={`transition-shadow ${isMock ? "opacity-90" : "hover:shadow-sm cursor-pointer"}`}
                  onClick={() => {
                    if (!isMock) router.push(`/chats/${c.id}`); // ← /chats/{eventId}
                  }}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          <span className="truncate">{c.title}</span>
                          {isMock && <Badge variant="secondary">목업</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {c.lastMessage ?? "메시지가 없습니다."}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatTime(c.lastAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="mt-6">
            <Button variant="outline" onClick={() => location.reload()}>
              새로고침
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
