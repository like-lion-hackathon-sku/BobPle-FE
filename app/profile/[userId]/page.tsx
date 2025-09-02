// app/profile/[userId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, MapPin, Calendar, Users, Flag } from "lucide-react";

import { apiRequest, userAPI, reviewAPI } from "@/lib/api";

/* ================= 화면용 타입 ================= */
type UserProfile = {
  id: number | string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  joinDate?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  completedMeals?: number | null;
  hostedMeals?: number | null;
};

type RecentEvent = {
  id: number | string;
  title: string;
  date: string;
  status: "upcoming" | "completed";
  participants?: number | null;
  __raw?: any; // 보강용 원시 데이터 저장
};

type EventParticipant = {
  id: number | string;
  name?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  role?: string | null; // host/guest 등
};

type EventDetailLite = {
  id: number | string;
  title?: string | null;
  participants?: EventParticipant[];
};

type ReceivedReview = {
  id: number | string;
  reviewer: { name: string; avatar?: string | null };
  rating: number;
  comment?: string | null;
  date: string;
  eventTitle?: string | null;
  __raw?: any; // 보강용 원시 데이터 저장
};

/* ================= 매핑 유틸 ================= */
function mapUserFromApi(raw: any): UserProfile {
  return {
    id: raw?.id ?? raw?._id ?? "user",
    name: raw?.nickname ?? raw?.name ?? "이름 없음",
    avatar: raw?.profile_img ?? raw?.avatar ?? null,
    bio: raw?.bio ?? null,
    location: raw?.location ?? null,
    joinDate: raw?.created_at ?? raw?.createdAt ?? null,
    rating: raw?.rating ?? null,
    reviewCount: raw?.reviewCount ?? raw?.reviews_count ?? null,
    completedMeals: raw?.completedMeals ?? raw?.completed_meals ?? null,
    hostedMeals: raw?.hostedMeals ?? raw?.hosted_meals ?? null,
  };
}

function mapEventFromApi(raw: any): RecentEvent {
  const start = raw?.start_at ?? raw?.startAt ?? raw?.date ?? raw?.created_at;
  const end = raw?.end_at ?? raw?.endAt ?? raw?.ended_at;
  const now = Date.now();

  let status: "upcoming" | "completed" = "upcoming";
  if (raw?.is_completed === true || raw?.completed === true) {
    status = "completed";
  } else {
    try {
      if (end && new Date(end).getTime() < now) status = "completed";
      else if (!end && start && new Date(start).getTime() < now) status = "completed";
    } catch {
      status = "upcoming";
    }
  }

  return {
    id: raw?.id ?? raw?._id ?? Math.random().toString(36).slice(2),
    title: raw?.title ?? raw?.name ?? "제목 없음",
    date: typeof start === "string" ? start : new Date().toISOString(),
    status,
    participants:
      raw?.current_participants ??
      raw?.participantsCount ??
      raw?.participants_count ??
      raw?.participants ??
      null,
    __raw: raw,
  };
}

function mapReviewFromApi(raw: any): ReceivedReview {
  const dt = raw?.created_at ?? raw?.createdAt ?? raw?.date ?? new Date().toISOString();

  const reviewerName =
    raw?.reviewer?.nickname ??
    raw?.reviewer?.name ??
    raw?.fromUser?.nickname ??
    raw?.fromUser?.name ??
    raw?.user?.nickname ??
    raw?.user?.name ??
    "익명";

  const reviewerAvatar =
    raw?.reviewer?.avatar ??
    raw?.reviewer?.profile_img ??
    raw?.fromUser?.avatar ??
    raw?.fromUser?.profile_img ??
    raw?.user?.avatar ??
    null;

  const eventTitle =
    raw?.event?.title ??
    raw?.event_title ??
    raw?.eventName ??
    raw?.meal?.title ??
    raw?.meeting?.title ??
    null;

  return {
    id: raw?.id ?? raw?._id ?? Math.random().toString(36).slice(2),
    reviewer: { name: reviewerName, avatar: reviewerAvatar },
    rating: Number(raw?.score ?? raw?.rating ?? 0),
    comment: raw?.comment ?? raw?.content ?? null,
    date: typeof dt === "string" ? dt : new Date().toISOString(),
    eventTitle: eventTitle ?? null,
    __raw: raw,
  };
}

function asArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.success?.lists)) return data.success.lists;
  return [];
}

/* ================= 보강 유틸 ================= */
const eventCache = new Map<string, Promise<EventDetailLite | null>>();

const getDisplayName = (u?: { name?: string | null; nickname?: string | null }) =>
  u?.nickname || u?.name || null;

async function getEventWithParticipants(eventId: number | string): Promise<EventDetailLite | null> {
  const key = String(eventId);
  if (!eventCache.has(key)) {
    eventCache.set(
      key,
      (async () => {
        try {
          // 타입 A: 참가자 포함해서 한 번에
          const evA = await apiRequest(
            `/api/events/${encodeURIComponent(key)}?include=participants`
          ).catch(() => null);
          if (evA?.id || evA?._id) {
            return {
              id: evA.id ?? evA._id,
              title: evA.title ?? evA.name ?? null,
              participants:
                evA.participants ?? evA.members ?? evA.attendees ?? evA.users ?? [],
            };
          }

          // 타입 B: 본문 + /participants 분리
          const ev = await apiRequest(`/api/events/${encodeURIComponent(key)}`).catch(() => null);
          let parts: EventParticipant[] = [];
          try {
            const p = await apiRequest(
              `/api/events/${encodeURIComponent(key)}/participants`
            ).catch(() => null);
            parts = (Array.isArray(p) ? p : p?.participants ?? p?.items ?? []) as EventParticipant[];
          } catch {}
          return {
            id: ev?.id ?? key,
            title: ev?.title ?? ev?.name ?? null,
            participants: parts,
          };
        } catch {
          return null;
        }
      })()
    );
  }
  return eventCache.get(key)!;
}

/** 날짜 문자열을 YYYY-MM-DD 키로 */
const dayKey = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

/**
 * 프론트에서 리뷰를 보강한다.
 *  - reviewerId가 보이면: userAPI로 닉네임/아바타 채우기
 *  - eventId가 보이면: 이벤트 상세 참가자에서 '프로필 대상자'가 아닌 사람을 리뷰어로 추정
 *  - eventId도 없으면: 날짜 근접 매칭(±1일)으로 이벤트 제목 추정
 */
async function enrichReviews(
  reviews: ReceivedReview[],
  recentEvents: RecentEvent[],
  profileId: number | string
): Promise<ReceivedReview[]> {
  const userCache = new Map<string, Promise<any>>();
  const getUser = (id: number | string) => {
    const k = String(id);
    if (!userCache.has(k)) userCache.set(k, userAPI.getUserProfile(Number(id)));
    return userCache.get(k)!;
  };

  return Promise.all(
    reviews.map(async (rv) => {
      const raw = rv.__raw || {};
      let name = rv.reviewer.name;
      let avatar = rv.reviewer.avatar ?? null;
      let eventTitle = rv.eventTitle ?? null;

      // 1) reviewer id 후보들
      const reviewerId =
        raw?.reviewer_id ??
        raw?.from_user_id ??
        raw?.writer_id ??
        raw?.author_id ??
        raw?.creator_id ??
        raw?.user_id ??
        null;

      if ((!avatar || name === "익명") && reviewerId != null) {
        try {
          const u = await getUser(reviewerId);
          name = getDisplayName(u) ?? name;
          avatar = u?.profile_img ?? u?.avatar ?? avatar ?? null;
        } catch {}
      }

      // 2) 이벤트에서 추정
      const eventId = raw?.event_id ?? raw?.meal_id ?? raw?.meeting_id ?? null;
      if (!eventTitle && eventId != null) {
        try {
          const ev = await getEventWithParticipants(eventId);
          eventTitle = ev?.title ?? eventTitle;

          if (name === "익명" || !avatar) {
            const candidates = (ev?.participants ?? []).filter(
              (p) => String(p.id) !== String(profileId)
            );
            // host 제외 우선, 없으면 첫번째
            const hostIdx = candidates.findIndex(
              (c) => (c.role || "").toLowerCase() === "host"
            );
            const reviewer =
              (hostIdx >= 0
                ? candidates.filter((_, i) => i !== hostIdx)[0]
                : candidates[0]) || null;

            if (reviewer) {
              name = getDisplayName(reviewer) ?? name;
              avatar = reviewer.avatar ?? avatar ?? null;
            }
          }
        } catch {}
      }

      // 3) 날짜 근접 매칭
      if (!eventTitle) {
        const rvTs = new Date(rv.date).getTime();
        const near = recentEvents
          .map((e) => ({ title: e.title, ts: new Date(e.date).getTime() }))
          .filter((x) => Number.isFinite(x.ts) && Math.abs(x.ts - rvTs) <= 24 * 60 * 60 * 1000)
          .sort((a, b) => Math.abs(a.ts - rvTs) - Math.abs(b.ts - rvTs))[0];
        if (near) eventTitle = near.title || null;
      }

      return {
        ...rv,
        reviewer: { name, avatar },
        eventTitle: eventTitle ?? "-",
      };
    })
  );
}

/* ================= 페이지 ================= */
export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const uidRaw = String(params?.userId ?? "").trim();

  const uidNum = Number(uidRaw);
  const uidArg: number | string = Number.isFinite(uidNum) ? uidNum : uidRaw;

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        /* ① 사용자 기본 정보 */
        const user = await userAPI
          .getUserProfile(Number.isFinite(uidNum) ? uidNum : Number(uidRaw))
          .catch(() => null);
        const mapped = user ? mapUserFromApi(user) : null;
        if (!canceled) setProfile(mapped);

        /* ② 최근 밥약 (보강 후보군을 넉넉히 가져온다) */
        const evRes = await apiRequest(
          `/api/events?userId=${encodeURIComponent(String(uidRaw))}&page=1&limit=20`
        ).catch(() => null);
        const evs = asArray(evRes).map(mapEventFromApi);
        if (!canceled) setRecentEvents(evs.slice(0, 10));

        /* ③ 받은 리뷰 원본 → 매핑 */
        const userReviews = await reviewAPI
          .getUserReviews(uidArg as any, 1, 20)
          .catch(() => ({ data: [] }));
        const mappedReviews = asArray(userReviews).map(mapReviewFromApi);

        /* ④ 프론트 보강(enrich) */
        const enriched = await enrichReviews(
          mappedReviews,
          evs,
          mapped?.id ?? uidArg
        );

        if (!canceled) setReviews(enriched.slice(0, 10));
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "프로필을 불러오지 못했습니다.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [uidRaw]);

  const joined = useMemo(() => {
    if (!profile?.joinDate) return "-";
    try {
      return (
        new Date(profile.joinDate).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
        }) + " 가입"
      );
    } catch {
      return "-";
    }
  }, [profile?.joinDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">
                {profile?.name ?? "프로필"}
              </h1>
            </div>
            <Button variant="ghost" size="sm" title="신고">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 프로필 카드 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {err && (
              <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {err}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {(profile?.name ?? "N")[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.name ?? "이름 없음"}
                </h2>

                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile?.location ?? "-"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {joined}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="font-semibold">
                        {profile?.rating ?? "-"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(profile?.reviewCount ?? reviews.length)}개 리뷰
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {profile?.completedMeals ?? 0}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      완료한 밥약
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {profile?.hostedMeals ?? 0}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      주최한 밥약
                    </span>
                  </div>
                </div>

                {profile?.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최근 밥약 / 받은 리뷰 */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">최근 밥약</TabsTrigger>
            <TabsTrigger value="reviews">받은 리뷰</TabsTrigger>
          </TabsList>

          {/* 최근 밥약 */}
          <TabsContent value="events" className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">최근 밥약이 없습니다.</div>
            ) : (
              recentEvents.map((ev) => (
                <Card key={ev.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{ev.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{new Date(ev.date).toLocaleDateString("ko-KR")}</span>
                          {ev.participants != null && (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {ev.participants}명 참여
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={ev.status === "completed" ? "secondary" : "default"}>
                        {ev.status === "completed" ? "완료" : "예정"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 받은 리뷰 */}
          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">받은 리뷰가 없습니다.</div>
            ) : (
              reviews.map((rv) => (
                <Card key={rv.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={rv.reviewer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{rv.reviewer.name?.[0] ?? "U"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        {/* 닉네임 + 이벤트 제목 */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium">{rv.reviewer.name}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {rv.eventTitle ?? "-"}
                          </span>
                        </div>

                        {/* 별점 + 날짜 */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (rv.rating || 0)
                                    ? "fill-current text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(rv.date).toLocaleDateString("ko-KR")}
                          </span>
                        </div>

                        {rv.comment && (
                          <p className="text-sm text-muted-foreground">{rv.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
