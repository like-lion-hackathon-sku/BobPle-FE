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
  id: number | string;       // chatId (= eventId)
  title: string;
  lastMessage?: string | null;
  lastAt?: string | null;    // ISO
  participants?: number | null;
  startISO?: string | null;  // 추가
  endISO?: string | null;    // 추가
};

const MOCK_CHAT: ChatPreview = {
  id: "mock-1",
  title: "샘플 채팅방",
  lastMessage: "연결되면 실제 데이터가 표시됩니다.",
  lastAt: new Date().toISOString(),
  participants: 2,
  startISO: null,
  endISO: null,
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
function getEventId(app: any): number | null {
  const v = app?.eventId ?? app?.id ?? app?.event_id ?? app?.event?.id ?? app?.event?.eventId ?? null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function getEventTitle(obj: any): string | null {
  return (
    obj?.title ??
    obj?.eventTitle ??
    obj?.subject ??
    obj?.name ??
    obj?.event_name ??
    obj?.eventName ??
    obj?.roomTitle ??
    obj?.chatTitle ??
    obj?.event?.title ??
    obj?.event?.name ??
    obj?.restaurant?.name ??
    null
  );
}
function getEventTimes(obj: any): { startISO?: string | null; endISO?: string | null } {
  const startISO = obj?.startISO ?? obj?.startAt ?? obj?.start_at ?? obj?.event?.startAt ?? obj?.event?.start_at ?? null;
  const endISO   = obj?.endISO   ?? obj?.endAt   ?? obj?.end_at   ?? obj?.event?.endAt   ?? obj?.event?.end_at   ?? null;
  return { startISO: startISO ? String(startISO) : null, endISO: endISO ? String(endISO) : null };
}

export default function ChatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChatPreview[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  // ▼ 추가: 현재/지난 탭
  const [view, setView] = useState<"current" | "past">("current");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setUsedMock(false);
      try {
        const appsRes: any = await (eventAPI as any).getMyEvents();
        const myApps = asArray(appsRes);
        if (DEBUG && myApps[0]) console.log("[chats] myApps sample keys:", Object.keys(myApps[0]));

        if (myApps.length === 0) {
          if (!cancelled) {
            setError("참여 중인 채팅방(밥약)이 없습니다.");
            setItems([MOCK_CHAT]);
            setUsedMock(true);
          }
          return;
        }

        const top = myApps.slice(0, 20);
        const results = await Promise.allSettled(
          top.map(async (app: any) => {
            const eventId = getEventId(app);
            if (!eventId) {
              if (DEBUG) console.warn("[chats] eventId 없음:", app);
              return null;
            }

            // 제목/시간 추출
            let title = getEventTitle(app);
            let { startISO, endISO } = getEventTimes(app);

            // 상세로 보강
            if ((!title || (!startISO && !endISO)) && typeof (eventAPI as any).getEvent === "function") {
              try {
                const detail = await (eventAPI as any).getEvent(eventId);
                title = title || getEventTitle(detail) || detail?.title || detail?.name || null;
                const t = getEventTimes(detail);
                startISO = startISO || t.startISO || null;
                endISO = endISO || t.endISO || null;
              } catch (e) {
                if (DEBUG) console.error("[chats] getEvent 실패:", eventId, e);
              }
            }

            // 최근 메시지 1건
            let lastMessage: string | null = null;
            let lastAt: string | null = null;
            try {
              const hist = await chatAPI.getChatRoom(eventId, { size: 1 });
              const last = asArray(hist?.items).slice(-1)[0] ?? null;
              lastMessage = last?.content ?? null;
              lastAt = (last?.createdAt as string) ?? null;
            } catch (err) {
              if (DEBUG) console.error("[chats] getChatRoom 실패:", eventId, err);
            }

            const participants =
              app?.participantsCount ??
              app?.participants_count ??
              app?.current_participants ??
              app?.currentParticipants ??
              (Array.isArray(app?.participants) ? app.participants.length : null) ??
              null;

            return {
              id: eventId,
              title: title || `밥약 #${eventId}`,
              lastMessage,
              lastAt,
              participants,
              startISO: startISO ?? null,
              endISO: endISO ?? null,
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
            // 기본 정렬: 최근 대화 우선
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
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    // 검색
    let arr = usedMock ? items : !q.trim() ? items : items.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));

    // 현재/지난 필터
    if (!usedMock) {
      const now = Date.now();
      arr = arr.filter(i => {
        const end = i.endISO ? Date.parse(i.endISO) : NaN;
        const start = i.startISO ? Date.parse(i.startISO) : NaN;
        const pivot = Number.isFinite(end) ? end : (Number.isFinite(start) ? start : 0);
        const isPast = pivot !== 0 && pivot < now;
        return view === "past" ? isPast : !isPast;
      });
    }
    return arr;
  }, [items, q, usedMock, view]);

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

        {/* 검색 + 탭 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="채팅방 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={usedMock}
            />
          </div>

          {/* 현재/지난 토글 */}
          <div className="flex shrink-0 rounded-md border">
            <Button
              variant={view === "current" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setView("current")}
            >
              현재 밥약 보기
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={view === "past" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setView("past")}
            >
              지난 밥약 보기
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />

        {loading ? (
          <div className="text-sm text-muted-foreground">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">표시할 채팅방이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const isMock = typeof c.id === "string" && (c.id as string).startsWith("mock-");
              return (
                <Card
                  key={c.id}
                  className={`transition-shadow ${isMock ? "opacity-90" : "hover:shadow-sm cursor-pointer"}`}
                  onClick={() => {
                    if (!isMock) router.push(`/chats/${c.id}?t=${encodeURIComponent(c.title)}`);
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
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">{formatTime(c.lastAt)}</div>
                        {/* 선택: 종료일 표시 */}
                        {c.endISO && (
                          <div className="text-[10px] text-muted-foreground/70 mt-1">
                            종료: {new Date(c.endISO).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                          </div>
                        )}
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
