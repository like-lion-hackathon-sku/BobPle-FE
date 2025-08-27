// app/page.tsx
"use client";

import { useState, useEffect } from "react"; // ← useMemo 제거
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Users, Plus, MessageCircle, Search } from "lucide-react";
import { eventAPI } from "@/lib/api";

// ===== Types =====
type EventHost = {
  id?: number | string;
  name: string;
  avatar?: string | null;
  rating?: number | null;
};

type EventItem = {
  id: number | string;
  title: string;
  location?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  currentParticipants?: number | null;
  maxParticipants?: number | null;
  description?: string | null;
  restaurant?: string | null;
  host: EventHost;
};

function mapEventFromApi(e: any): EventItem {
  const startISO =
    e?.start_at ?? e?.startAt ?? e?.startDateTime ?? e?.start ?? e?.date ?? new Date().toISOString();
  const endISO =
    e?.end_at ?? e?.endAt ?? e?.endDateTime ?? e?.end ?? null;
  const toHHMM = (v?: string | null) => {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return (String(v).match(/\d{1,2}:\d{2}/)?.[0] ?? null);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return {
    id: e?.id ?? e?.eventId ?? e?._id ?? String(Math.random()),
    title: e?.title ?? "제목 없음",
    location: e?.location ?? e?.place ?? null,
    date: typeof startISO === "string" ? startISO : new Date().toISOString(),
    startTime: toHHMM(startISO),
    endTime: toHHMM(endISO),
    currentParticipants:
      e?.current_participants ?? e?.currentParticipants ?? e?.participants ?? null,
    maxParticipants: e?.max_participants ?? e?.maxParticipants ?? null,
    description: e?.content ?? e?.description ?? null,
    restaurant: e?.restaurant ?? e?.restaurant_name ?? null,
    host: {
      id: e?.host?.id ?? e?.creator?.id ?? "host",
      name: e?.host?.name ?? e?.creator?.name ?? "호스트",
      avatar: e?.host?.avatar ?? e?.creator?.avatar ?? null,
      rating: e?.host?.rating ?? null,
    },
  };
}

function buildMockEvent(): EventItem {
  const s = new Date(Date.now() + 60 * 60 * 1000);
  const e = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return {
    id: "mock-1",
    title: "강남역 맛집 탐방 (목업)",
    location: "강남역 2번 출구",
    date: s.toISOString(),
    startTime: s.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
    endTime: e.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
    currentParticipants: 1,
    maxParticipants: 3,
    description: "백엔드 준비 전 임시로 노출되는 목업 카드입니다.",
    restaurant: "라 트라토리아",
    host: { name: "테스트 호스트", rating: 4.8 },
  };
}

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const flag = localStorage.getItem("isLoggedIn") === "true";
    if (flag) {
      setIsLoggedIn(true);
      void loadEvents();
    } else {
      router.push("/login");
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEvents() {
    try {
      setError("");
      const raw = await eventAPI.getEvents({ search: searchTerm, page: 1, limit: 20 });

      const list: any[] = Array.isArray((raw as any)?.events)
        ? (raw as any).events
        : Array.isArray(raw)
        ? (raw as any)
        : [];

      if (list.length === 0) {
        setEvents([buildMockEvent()]);
      } else {
        setEvents(list.map(mapEventFromApi));
      }
    } catch (e: any) {
      console.error("밥약 목록 로드 실패:", e);
      setError(e?.message || "밥약 목록을 불러오는데 실패했습니다.");
      setEvents([buildMockEvent()]);
    }
  }

  // 검색 디바운스 (훅은 항상 선언, 내부에서 가드)
  useEffect(() => {
    if (!isLoggedIn) return;
    const t = setTimeout(() => void loadEvents(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isLoggedIn]);

  // ✅ 훅이 아니라 단순 변수로 사용 (Hook order 문제 제거)
  const filteredEvents = events;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-foreground">밥플</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/chats")}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8 cursor-pointer" onClick={() => router.push("/profile")}>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>나</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-24 h-24 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">새로운 사람들과 함께하는 식사</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            혼자 먹기 아쉬운 맛집, 새로운 사람들과 함께 나누어보세요. 밥플에서 특별한 식사 경험을 만들어가세요.
          </p>
          <Button size="lg" className="mr-4" onClick={() => router.push("/create")}>
            <Plus className="w-5 h-5 mr-2" />
            밥약 만들기
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/restaurants")}>
            맛집 찾아보기
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="지역, 음식 종류, 레스토랑 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-8">
        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location ?? "장소 미정"}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}{" "}
                        {event.startTime ?? "??:??"}
                        {event.endTime ? `-${event.endTime}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {event.currentParticipants ?? 0}/{event.maxParticipants ?? "-"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{event.host.name?.[0] ?? "H"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{event.host.name}</span>
                    {event.host.rating != null && (
                      <span className="text-xs text-muted-foreground">★ {event.host.rating}</span>
                    )}
                  </div>
                  {event.restaurant && (
                    <Badge variant="outline" className="text-xs">
                      {event.restaurant}
                    </Badge>
                  )}
                </div>

                <Button className="w-full" size="sm" onClick={() => router.push(`/events/${event.id}`)}>
                  참여하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && !error && (
          <div className="text-center py-12">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">검색 결과가 없습니다.</p>
            <p className="text-muted-foreground">다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full shadow-lg" onClick={() => router.push("/create")}>
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
