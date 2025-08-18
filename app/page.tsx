"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, Clock, Users, Plus, Filter, Star, MessageCircle, X, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notification-context"
import { Search } from "lucide-react" // Import Search icon

const mockEvents = [
  {
    id: 1,
    title: "강남역 맛집 탐방",
    description: "새로 오픈한 이탈리안 레스토랑에서 함께 저녁 드실 분 구해요!",
    location: "강남역 2번 출구",
    date: "2024-01-20",
    startTime: "19:00",
    endTime: "21:00",
    maxParticipants: 4,
    currentParticipants: 2,
    host: {
      name: "김민수",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
    },
    restaurant: "라 트라토리아",
    tags: ["이탈리안", "신규오픈", "분위기좋은"],
    category: "양식",
    region: "강남",
    genderRestriction: "상관없음", // 성별 제한 정보 추가
  },
  {
    id: 2,
    title: "홍대 브런치 모임",
    description: "주말 브런치 함께 하실 분들 모집합니다. 맛있는 팬케이크와 커피로!",
    location: "홍대입구역 9번 출구",
    date: "2024-01-21",
    startTime: "11:30",
    endTime: "13:30",
    maxParticipants: 4,
    currentParticipants: 3,
    host: {
      name: "이지은",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
    restaurant: "브런치 카페 델리",
    tags: ["브런치", "카페", "주말"],
    category: "양식",
    region: "홍대",
    genderRestriction: "여자만", // 성별 제한 정보 추가
  },
  {
    id: 3,
    title: "회사 근처 점심 메이트",
    description: "을지로 직장인들과 함께하는 점심 식사. 한식 좋아하시는 분 환영!",
    location: "을지로3가역",
    date: "2024-01-22",
    startTime: "12:00",
    endTime: "13:00",
    maxParticipants: 4,
    currentParticipants: 1,
    host: {
      name: "박준호",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
    },
    restaurant: "전통 한정식",
    tags: ["한식", "점심", "직장인"],
    category: "한식",
    region: "을지로",
    genderRestriction: "남자만", // 성별 제한 정보 추가
  },
  {
    id: 4,
    title: "신사동 스시 오마카세",
    description: "고급 스시 오마카세를 함께 즐기실 분들을 찾습니다!",
    location: "신사역 8번 출구",
    date: "2024-01-23",
    startTime: "18:30",
    endTime: "20:30",
    maxParticipants: 4,
    currentParticipants: 2,
    host: {
      name: "최유진",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
    restaurant: "스시 하나미",
    tags: ["스시", "오마카세", "고급"],
    category: "일식",
    region: "강남",
    genderRestriction: "상관없음", // 성별 제한 정보 추가
  },
  {
    id: 5,
    title: "명동 중식당 탐방",
    description: "정통 중식 요리를 맛보러 가실 분들 모집해요!",
    location: "명동역 3번 출구",
    date: "2024-01-24",
    startTime: "12:30",
    endTime: "14:00",
    maxParticipants: 4,
    currentParticipants: 1,
    host: {
      name: "김태현",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
    },
    restaurant: "북경반점",
    tags: ["중식", "짜장면", "탕수육"],
    category: "중식",
    region: "중구",
    genderRestriction: "상관없음", // 성별 제한 정보 추가
  },
]

/**
 * 메인 홈페이지 컴포넌트
 * 밥약 목록을 보여주고 검색/필터링 기능을 제공
 */
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태
  const [isLoading, setIsLoading] = useState(true) // 초기 로딩 상태
  const [events, setEvents] = useState(mockEvents) // 밥약 목록 상태
  const [searchTerm, setSearchTerm] = useState("") // 검색어 상태
  const [selectedRegion, setSelectedRegion] = useState("전체") // 선택된 지역 필터
  const [selectedTimeRange, setSelectedTimeRange] = useState("전체") // 선택된 시간대 필터
  const [selectedGenderRestriction, setSelectedGenderRestriction] = useState("전체") // 선택된 성별 제한 필터
  const [isFilterOpen, setIsFilterOpen] = useState(false) // 필터 패널 열림/닫힘 상태
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const { unreadCount } = useNotifications() // 읽지 않은 알림 개수

  /**
   * 컴포넌트 마운트 시 로그인 상태 확인
   */
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn")
      if (loginStatus === "true") {
        setIsLoggedIn(true)
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push("/login")
      }
      setIsLoading(false)
    }

    checkLoginStatus()
  }, [router])

  // 로딩 중일 때 표시할 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 처리됨)
  if (!isLoggedIn) {
    return null
  }

  /**
   * 밥약 목록 필터링 함수
   * 검색어, 지역, 시간대 조건에 따라 밥약을 필터링
   */
  const filteredEvents = events.filter((event) => {
    // 검색어로 제목, 위치, 레스토랑명 검색
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.restaurant.toLowerCase().includes(searchTerm.toLowerCase())

    // 지역 필터 매칭
    const matchesRegion = selectedRegion === "전체" || event.region === selectedRegion

    // 시간대 필터 매칭 로직
    let matchesTime = true
    if (selectedTimeRange !== "전체") {
      const startHour = Number.parseInt(event.startTime.split(":")[0])
      switch (selectedTimeRange) {
        case "morning":
          matchesTime = startHour >= 6 && startHour < 12 // 아침 시간대
          break
        case "lunch":
          matchesTime = startHour >= 12 && startHour < 15 // 점심 시간대
          break
        case "dinner":
          matchesTime = startHour >= 17 && startHour < 22 // 저녁 시간대
          break
        case "late":
          matchesTime = startHour >= 22 || startHour < 6 // 늦은 시간대
          break
      }
    }

    // 성별 제한 필터 매칭
    const matchesGenderRestriction =
      selectedGenderRestriction === "전체" || event.genderRestriction === selectedGenderRestriction

    return matchesSearch && matchesRegion && matchesTime && matchesGenderRestriction
  })

  /**
   * 모든 필터 초기화 함수
   * 지역, 시간대, 성별 제한 필터를 전체로 리셋
   */
  const clearFilters = () => {
    setSelectedRegion("전체")
    setSelectedTimeRange("전체")
    setSelectedGenderRestriction("전체")
  }

  // 필터 옵션을 위한 고유 지역/성별 제한 목록 생성
  const regions = [...new Set(events.map((event) => event.region))]
  const genderRestrictions = [...new Set(events.map((event) => event.genderRestriction))]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 영역 */}
            <div className="flex items-center space-x-2">
              <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-foreground">밥플</h1>
            </div>
            {/* 네비게이션 아이콘들 */}
            <div className="flex items-center space-x-2">
              {/* 필터 패널 토글 버튼 */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                {/* 필터 사이드 패널 */}
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>필터</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* 지역 필터 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">지역</label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체</SelectItem>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 시간대 필터 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">시간대</label>
                      <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="시간대 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체</SelectItem>
                          <SelectItem value="morning">아침 (06:00-12:00)</SelectItem>
                          <SelectItem value="lunch">점심 (12:00-15:00)</SelectItem>
                          <SelectItem value="dinner">저녁 (17:00-22:00)</SelectItem>
                          <SelectItem value="late">늦은시간 (22:00-06:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 성별 제한 필터 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">성별 제한</label>
                      <Select value={selectedGenderRestriction} onValueChange={setSelectedGenderRestriction}>
                        <SelectTrigger>
                          <SelectValue placeholder="성별 제한 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체</SelectItem>
                          {genderRestrictions.map((genderRestriction) => (
                            <SelectItem key={genderRestriction} value={genderRestriction}>
                              {genderRestriction}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 필터 액션 버튼들 */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        초기화
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                        적용
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              {/* 알림 버튼 (읽지 않은 알림 개수 표시) */}
              <Button variant="ghost" size="sm" className="relative" onClick={() => router.push("/notifications")}>
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
              {/* 식당 추천 페이지 이동 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.push("/restaurants")}>
                <Star className="w-4 h-4" />
              </Button>
              {/* 채팅 목록 페이지 이동 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.push("/chats")}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              {/* 프로필 페이지 이동 아바타 */}
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
          {/* 마스코트 이미지 */}
          <div className="flex justify-center mb-6">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-24 h-24 animate-bounce" />
          </div>
          {/* 메인 제목 및 설명 */}
          <h2 className="text-3xl font-bold text-foreground mb-4">새로운 사람들과 함께하는 식사</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            혼자 먹기 아쉬운 맛집, 새로운 사람들과 함께 나누어보세요. 밥플에서 특별한 식사 경험을 만들어가세요.
          </p>
          {/* 주요 액션 버튼들 */}
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
          {/* 검색 입력 필드 */}
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

        {/* 활성화된 필터 배지들 표시 */}
        {(selectedRegion !== "전체" || selectedTimeRange !== "전체" || selectedGenderRestriction !== "전체") && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedRegion !== "전체" && (
              <Badge variant="default" className="flex items-center gap-1">
                지역: {selectedRegion}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRegion("전체")} />
              </Badge>
            )}
            {selectedTimeRange !== "전체" && (
              <Badge variant="default" className="flex items-center gap-1">
                시간:{" "}
                {selectedTimeRange === "morning"
                  ? "아침"
                  : selectedTimeRange === "lunch"
                    ? "점심"
                    : selectedTimeRange === "dinner"
                      ? "저녁"
                      : "늦은시간"}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTimeRange("전체")} />
              </Badge>
            )}
            {selectedGenderRestriction !== "전체" && (
              <Badge variant="default" className="flex items-center gap-1">
                성별 제한: {selectedGenderRestriction}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGenderRestriction("전체")} />
              </Badge>
            )}
          </div>
        )}
      </section>

      <main className="container mx-auto px-4 pb-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            // 개별 밥약 카드
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 밥약 제목 */}
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    {/* 위치 및 시간 정보 */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {event.startTime}-{event.endTime}
                      </div>
                    </div>
                  </div>
                  {/* 참여 인원 정보 */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {event.currentParticipants}/{event.maxParticipants}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 밥약 설명 */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                {/* 호스트 정보 및 레스토랑 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{event.host.name}</span>
                    <span className="text-xs text-muted-foreground">★ {event.host.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.restaurant}
                  </Badge>
                </div>

                {/* 태그들 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {event.genderRestriction !== "상관없음" && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      {event.genderRestriction}
                    </Badge>
                  )}
                </div>

                {/* 참여하기 버튼 */}
                <Button className="w-full" size="sm" onClick={() => router.push(`/events/${event.id}`)}>
                  참여하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 결과 없음 메시지 */}
        {filteredEvents.length === 0 && (
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
  )
}
