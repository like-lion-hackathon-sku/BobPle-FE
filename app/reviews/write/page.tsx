// app/reviews/write/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ArrowLeft } from "lucide-react";
import { apiRequest, eventAPI, authAPI, reviewAPI } from "@/lib/api";

/* ========= 화면 타입 ========= */
type Participant = {
  id: number | string;
  name: string;
  avatar?: string | null;
};

type EventDetailLite = {
  id: number | string;
  title: string;
  startISO?: string | null;
  endISO?: string | null;
  participants: Participant[];
};

/* ========= 유틸 ========= */
function asArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.participants)) return data.participants;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function mapParticipant(p: any): Participant {
  const id =
    p?.id ?? p?.userId ?? p?.user_id ?? p?.user?.id ?? p?.user?.userId ?? p?.user?.user_id;
  const name = p?.nickname ?? p?.name ?? p?.user?.nickname ?? p?.user?.name ?? "사용자";
  const avatar = p?.avatar ?? p?.profile_img ?? p?.user?.avatar ?? p?.user?.profile_img ?? null;
  return { id, name, avatar };
}

function mapEventDetail(raw: any): EventDetailLite {
  const id = raw?.id ?? raw?.eventId ?? "event";
  const title = raw?.title ?? raw?.name ?? "제목 없음";
  const startISO = raw?.startISO ?? raw?.start_at ?? raw?.startAt ?? null;
  const endISO = raw?.endISO ?? raw?.end_at ?? raw?.endAt ?? null;
  const participants = asArray(raw?.participants).map(mapParticipant);
  return { id, title, startISO, endISO, participants };
}

/* ========= 페이지 ========= */
export default function ReviewWritePage() {
  const router = useRouter();
  const qs = useSearchParams();

  const eventIdStr = qs.get("eventId");      // 필수
  const presetToUserId = qs.get("toUserId"); // 선택

  const [meId, setMeId] = useState<number | string | null>(null);
  const [detail, setDetail] = useState<EventDetailLite | null>(null);

  const [toUserId, setToUserId] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* 내 아이디 */
  useEffect(() => {
    (async () => {
      try {
        const me = await authAPI.getProfile().catch(() => null);
        const id =
          me?.id ??
          me?.userId ??
          me?.user_id ??
          me?.profile?.id ??
          me?.profile?.userId ??
          me?.profile?.user_id ??
          null;
        setMeId(id ?? null);
      } catch {
        setMeId(null);
      }
    })();
  }, []);

  /* 이벤트 상세 */
  useEffect(() => {
    (async () => {
      if (!eventIdStr) {
        setErr("유효하지 않은 접근입니다. eventId가 필요합니다.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const eid = Number.isNaN(Number(eventIdStr)) ? eventIdStr : Number(eventIdStr);
        const raw = await eventAPI.getEvent(eid).catch(() => null);
        if (!raw) throw new Error("이벤트 정보를 불러오지 못했습니다.");
        const mapped = mapEventDetail(raw);
        setDetail(mapped);

        if (presetToUserId) setToUserId(String(presetToUserId));
      } catch (e: any) {
        setErr(e?.message || "페이지 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventIdStr, presetToUserId]);

  const selectableParticipants = useMemo(() => {
    if (!detail) return [];
    return detail.participants.filter((p) => String(p.id) !== String(meId));
  }, [detail, meId]);

  const canSubmit = useMemo(() => {
    const inRange = Number.isFinite(rating) && rating >= 0 && rating <= 5;
    return !!eventIdStr && !!toUserId && inRange && content.trim().length > 0 && !submitting;
  }, [eventIdStr, toUserId, rating, content, submitting]);

  /* 제출 */
  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const payload = {
        // eventId는 BE가 받지 않으면 생략해도 됨. 필요하면 주석 해제
        // eventId: Number.isNaN(Number(eventIdStr)) ? String(eventIdStr) : Number(eventIdStr),
        score: rating,        // ✅ BE 명세: score (0~5)
        content,              // 선택 필드(받으면 전송)
      };

      // reviewAPI 래퍼가 없다면 apiRequest로 직접
      const hasCreate =
        typeof (reviewAPI as any)?.createReview === "function" ||
        typeof (reviewAPI as any)?.write === "function";

      if (hasCreate) {
        const fn = (reviewAPI as any).createReview ?? (reviewAPI as any).write;
        await fn(Number(toUserId) || String(toUserId), payload);
      } else {
        await apiRequest(`/api/reviews/${encodeURIComponent(String(toUserId))}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      router.replace("/profile");
    } catch (e: any) {
      setErr(e?.error?.reason || e?.reason || e?.message || "리뷰 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">불러오는 중…</div>
    );
  }

  if (!eventIdStr) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>리뷰 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive text-sm">eventId 쿼리가 필요합니다.</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                뒤로가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          뒤로
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>리뷰 작성</span>
              {detail && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {detail.title}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {err && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {err}
              </div>
            )}

            {/* 대상 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">리뷰 대상</label>

              {presetToUserId ? (
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  {(() => {
                    const target =
                      selectableParticipants.find((p) => String(p.id) === String(presetToUserId)) ??
                      null;
                    return (
                      <>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={target?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{(target?.name ?? "U").slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {target?.name ?? `사용자 #${presetToUserId}`}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {presetToUserId}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                >
                  <option value="">대상을 선택하세요</option>
                  {selectableParticipants.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 별점 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">평점</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className="p-1"
                    aria-label={`${i}점`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        i <= rating ? "fill-current text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-1">{rating} / 5</span>
              </div>
            </div>

            {/* 코멘트 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">코멘트</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="리뷰 내용을 입력하세요."
                rows={6}
              />
              <div className="text-xs text-muted-foreground text-right">{content.length}자</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">이벤트 ID: {eventIdStr}</span>
              <Button disabled={!canSubmit} onClick={handleSubmit}>
                {submitting ? "저장 중..." : "리뷰 저장"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
