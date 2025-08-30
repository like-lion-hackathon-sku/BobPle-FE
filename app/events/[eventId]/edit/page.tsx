// app/events/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventAPI } from "@/lib/api"; // getEvent
import { eventAPI_mutation, EditEventDto } from "@/lib/api.routes";

/* datetime-local ↔ ISO 변환 */
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso).slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  } catch {
    return String(iso).slice(0, 16);
  }
};
const toIso = (local: string) => (local ? new Date(local).toISOString() : "");

/** 식당 상세 (레스토랑 페이지가 이미 구현되어 있어도 여기선 한 줄로 보강만) */
async function fetchRestaurantById(restaurantId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "/_be"}/api/restaurants/${encodeURIComponent(restaurantId)}`,
    { credentials: "include" }
  );
  if (!res.ok) return { id: restaurantId, name: `식당 #${restaurantId}`, address: null as string | null };
  const d = await res.json();
  return {
    id: Number(d?.id ?? restaurantId),
    name: d?.name ?? d?.restaurantName ?? `식당 #${restaurantId}`,
    address: d?.address ?? d?.roadAddress ?? null,
  };
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // /events/[id]/edit 또는 /events/[eventId]/edit 모두 대응
  const rawId = (params as any)?.id ?? (params as any)?.eventId;
  const eventId = useMemo(() => (typeof rawId === "string" && rawId.trim() !== "" ? rawId : null), [rawId]);

  // 검색에서 돌아오면 ?restaurantId= 가 붙음
  const selectedRestaurantId = useMemo(() => {
    const v = searchParams?.get("restaurantId");
    return v ? Number(v) : NaN;
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [restaurantId, setRestaurantId] = useState<number>(0);
  const [restaurantName, setRestaurantName] = useState<string>("");

  // 식당 검색 입력창은 더 이상 사용 안 해도 되지만 유지해도 무방
  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState(false);
  const debounceRef = useRef<any>(null);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // 상세 로드
  useEffect(() => {
    (async () => {
      if (!eventId) {
        setError("유효하지 않은 이벤트 ID 입니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const row: any = await eventAPI.getEvent(String(eventId));

        setTitle(row.title ?? "");
        setContent(row.content ?? "");
        setStartAt(toLocalInput(row.start_at ?? row.startISO));
        setEndAt(toLocalInput(row.end_at ?? row.endISO));

        const rid = Number(row.restaurant_id ?? row.restaurantId ?? 0);
        setRestaurantId(Number.isFinite(rid) ? rid : 0);
        if (rid) {
          try {
            const info = await fetchRestaurantById(rid);
            setRestaurantName(info.name + (info.address ? ` / ${info.address}` : ""));
          } catch {
            setRestaurantName(row.restaurant_name ?? row.restaurantName ?? `식당 #${rid}`);
          }
        } else {
          setRestaurantName("");
        }
      } catch (e: any) {
        setError(e?.message || "이벤트 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  // ✅ 식당 조회 페이지에서 “선택하기” 후 복귀 처리
  useEffect(() => {
    (async () => {
      if (Number.isFinite(selectedRestaurantId)) {
        const rid = Number(selectedRestaurantId);
        setRestaurantId(rid);
        try {
          const info = await fetchRestaurantById(rid);
          setRestaurantName(info.name + (info.address ? ` / ${info.address}` : ""));
        } catch {
          setRestaurantName(`식당 #${rid}`);
        }
        // 쿼리스트링 깔끔하게 제거 (한 번만 적용)
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("restaurantId");
          window.history.replaceState({}, "", url.toString());
        }
      }
    })();
  }, [selectedRestaurantId]);

  // 저장
  async function handleSave() {
    if (!eventId) return;
    try {
      setSaving(true);
      const dto: EditEventDto = {
        title: title.trim(),
        content: content.trim(),
        start_at: toIso(startAt),
        end_at: toIso(endAt),
        restaurant_id: restaurantId,
      };
      await eventAPI_mutation.updateEvent(Number(eventId), dto); // 폴백 내장됨
      alert("이벤트가 수정되었습니다.");
      router.push(`/events/${eventId}`);
    } catch (e: any) {
      alert(e?.message || "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  // 식당 검색 페이지로 이동
  function openRestaurantSearch() {
    if (!eventId) return;
    const returnUrl = `/events/${eventId}/edit`;
    router.push(`/restaurants?mode=select&return=${encodeURIComponent(returnUrl)}`);
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">불러오는 중...</div>;
  if (error) return <div className="min-h-screen grid place-items-center text-destructive">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>이벤트 수정</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea id="content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="startAt">시작 시간</Label>
              <Input id="startAt" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="endAt">종료 시간</Label>
              <Input id="endAt" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>

            {/* 식당: 검색 페이지로 이동해서 선택 → 복귀 */}
            <div>
              <Label>식당</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="식당 이름/주소로 검색 (검색 버튼을 눌러 이동)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={openRestaurantSearch}>
                  검색
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                선택됨: {restaurantName ? `${restaurantName} (ID: ${restaurantId || "-"})` : "없음"}
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
