"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, X, Search } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useRouter, useSearchParams } from "next/navigation"

// 성별 제한 옵션 정의
const genderOptions = [
  { value: "all", label: "상관없음" },
  { value: "female", label: "여자만" },
  { value: "male", label: "남자만" },
]

// 시간 선택 옵션 (30분 단위로 09:00부터 22:00까지)
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

/**
 * 밥약 생성 페이지 컴포넌트
 * 사용자가 새로운 밥약을 만들 수 있는 폼을 제공
 */
export default function CreateEventPage() {
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const searchParams = useSearchParams() // URL 쿼리 파라미터 접근

  // 밥약 생성 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: "", // 밥약 제목
    description: "", // 밥약 설명
    restaurant: searchParams.get("restaurant") || "", // 레스토랑명 (URL 파라미터에서 가져올 수 있음)
    location: searchParams.get("location") || "", // 만날 장소 (URL 파라미터에서 가져올 수 있음)
    maxParticipants: 2, // 최대 참여자 수 (기본값 2명)
    genderRestriction: "all", // 성별 제한 (all: 상관없음, female: 여자만, male: 남자만)
    tags: [] as string[], // 태그 목록
    customTag: "", // 사용자가 입력 중인 새 태그
  })

  const [selectedDate, setSelectedDate] = useState<Date>() // 선택된 날짜
  const [startTime, setStartTime] = useState("") // 시작 시간
  const [endTime, setEndTime] = useState("") // 종료 시간
  const [isSubmitting, setIsSubmitting] = useState(false) // 폼 제출 중 상태
  const [showRestaurantSearch, setShowRestaurantSearch] = useState(false) // 레스토랑 검색 모달 표시 여부

  /**
   * 시작 시간에 따라 선택 가능한 종료 시간 목록을 반환
   * 시작 시간 이후의 시간들만 선택 가능
   */
  const getAvailableEndTimes = () => {
    if (!startTime) return []
    const startIndex = timeSlots.indexOf(startTime)
    return timeSlots.slice(startIndex + 1)
  }

  /**
   * 새 태그를 추가하는 함수
   * 중복 태그는 추가하지 않음
   */
  const handleAddTag = () => {
    if (formData.customTag.trim() && !formData.tags.includes(formData.customTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.customTag.trim()],
        customTag: "",
      }))
    }
  }

  /**
   * 태그를 제거하는 함수
   * @param tagToRemove 제거할 태그명
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  /**
   * 밥약 생성 폼 제출 처리 함수
   * API 호출을 통해 새 밥약을 생성하고 홈페이지로 이동
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !startTime || !endTime) return

    setIsSubmitting(true)

    // Mock API 호출 - 실제로는 POST /api/events/creation 엔드포인트 호출
    try {
      const eventData = {
        ...formData,
        datetime: `${format(selectedDate, "yyyy-MM-dd")} ${startTime} - ${endTime}`,
        startTime,
        endTime,
        tags: formData.tags.filter(Boolean),
      }

      console.log("Creating event:", eventData)

      // API 호출 시뮬레이션 (1초 지연)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 밥약 생성 완료 후 홈페이지로 이동
      router.push("/")
    } catch (error) {
      console.error("Failed to create event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {/* 뒤로가기 버튼 */}
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">밥약 만들기</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 밥약 제목 입력 */}
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

              {/* 밥약 설명 입력 */}
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

              {/* 레스토랑/카페 이름 입력 */}
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
                  {/* 레스토랑 검색 페이지로 이동하는 버튼 */}
                  <Button type="button" variant="outline" onClick={() => router.push("/restaurants")}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 만날 장소 입력 */}
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

          {/* 날짜 및 시간 선택 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>날짜 및 시간</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 날짜 선택 (캘린더 팝오버) */}
              <div>
                <Label>날짜 선택 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()} // 과거 날짜는 선택 불가
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 시작 시간과 종료 시간 선택 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>시작 시간 *</Label>
                  <Select
                    value={startTime}
                    onValueChange={(value) => {
                      setStartTime(value)
                      // 시작 시간이 변경되면 종료 시간이 시작 시간보다 이전인 경우 초기화
                      if (endTime && timeSlots.indexOf(value) >= timeSlots.indexOf(endTime)) {
                        setEndTime("")
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="시작 시간" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>종료 시간 *</Label>
                  <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="종료 시간" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 시작 시간 이후의 시간들만 표시 */}
                      {getAvailableEndTimes().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 선택된 시간 범위 미리보기 */}
              {startTime && endTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">선택된 시간</p>
                  <p className="font-medium">
                    {startTime} - {endTime}
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
              {/* 최대 참여자 수 선택 (2-4명) */}
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

              {/* 성별 제한 선택 */}
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

          {/* 태그 추가 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>태그</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 새 태그 입력 및 추가 */}
              <div className="flex gap-2">
                <Input
                  placeholder="태그 추가 (예: 분위기좋은, 신규오픈)"
                  value={formData.customTag}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customTag: e.target.value }))}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  추가
                </Button>
              </div>

              {/* 추가된 태그들 표시 (제거 가능) */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
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
                isSubmitting || !formData.title || !formData.location || !selectedDate || !startTime || !endTime
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
