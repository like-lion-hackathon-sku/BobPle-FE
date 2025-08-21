"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { eventAPI } from "@/lib/api"

// 성별 제한 옵션 정의
const genderOptions = [
  { value: "all", label: "상관없음" },
  { value: "female", label: "여자만" },
  { value: "male", label: "남자만" },
]

/**
 * 밥약 생성 페이지 컴포넌트
 * 사용자가 새로운 밥약을 만들 수 있는 폼을 제공
 */
export default function CreateEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 밥약 생성 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    restaurant: searchParams.get("restaurant") || "",
    location: searchParams.get("location") || "",
    maxParticipants: 2,
    genderRestriction: "all",
  })

  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  /**
   * 밥약 생성 폼 제출 처리 함수
   * 실제 API 호출을 통해 새 밥약을 생성하고 홈페이지로 이동
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !startTime || !endDate || !endTime) return

    setIsSubmitting(true)
    setError("")

    try {
      const eventData = {
        ...formData,
        startDateTime: `${startDate} ${startTime}`,
        endDateTime: `${endDate} ${endTime}`,
      }

      const response = await eventAPI.createEvent(eventData)

      if (response.success) {
        // 밥약 생성 완료 후 홈페이지로 이동
        router.push("/")
      }
    } catch (error) {
      console.error("밥약 생성 실패:", error)
      setError(error instanceof Error ? error.message : "밥약 생성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">밥약 만들기</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {/* 기본 정보 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="예: 강남역 맛집 탐방"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="어떤 식사 모임인지 자세히 설명해주세요"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="restaurant">레스토랑/카페 이름</Label>
                <div className="flex gap-2">
                  <Input
                    id="restaurant"
                    placeholder="예: 라 트라토리아"
                    value={formData.restaurant}
                    onChange={(e) => setFormData((prev) => ({ ...prev, restaurant: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => router.push("/restaurants")}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="location">만날 장소 *</Label>
                <Input
                  id="location"
                  placeholder="예: 강남역 2번 출구"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>날짜 및 시간</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">시작 날짜 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">시작 시간 *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">종료 날짜 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">종료 시간 *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 선택된 시간 범위 미리보기 */}
              {startDate && startTime && endDate && endTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">선택된 일정</p>
                  <p className="font-medium">
                    {startDate} {startTime} - {endDate} {endTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 참여자 설정 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>참여자 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxParticipants">최대 참여자 수 *</Label>
                <Select
                  value={formData.maxParticipants.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, maxParticipants: Number.parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="genderRestriction">성별 제한</Label>
                <Select
                  value={formData.genderRestriction}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, genderRestriction: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 폼 제출 버튼들 */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.location ||
                !startDate ||
                !startTime ||
                !endDate ||
                !endTime
              }
            >
              {isSubmitting ? "생성 중..." : "밥약 만들기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
