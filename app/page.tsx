"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Users, Plus, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { eventAPI } from "@/lib/api"

/**
 * 메인 홈페이지 컴포넌트
 * 밥약 목록을 보여주고 검색 기능을 제공
 */
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  /**
   * 컴포넌트 마운트 시 로그인 상태 확인 및 밥약 목록 로드
   */
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginStatus = localStorage.getItem("isLoggedIn")
      if (loginStatus === "true") {
        setIsLoggedIn(true)
        await loadEvents()
      } else {
        router.push("/login")
      }
      setIsLoading(false)
    }

    checkLoginStatus()
  }, [router])

  /**
   * 밥약 목록을 API에서 로드하는 함수
   */
  const loadEvents = async () => {
    try {
      const response = await eventAPI.getEvents({
        search: searchTerm,
        page: 1,
        limit: 20,
      })

      if (response.success) {
        setEvents(response.events)
      }
    } catch (error) {
      console.error("밥약 목록 로드 실패:", error)
      setError("밥약 목록을 불러오는데 실패했습니다.")
    }
  }

  // 검색어 변경 시 밥약 목록 다시 로드
  useEffect(() => {
    if (isLoggedIn) {
      const debounceTimer = setTimeout(() => {
        loadEvents()
      }, 300)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchTerm, isLoggedIn])

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
   * 밥약 목록 필터링 함수 - 검색어만 사용 (API에서 필터링 처리)
   */
  const filteredEvents = events

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

                {/* 참여하기 버튼 */}
                <Button className="w-full" size="sm" onClick={() => router.push(`/events/${event.id}`)}>
                  참여하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 결과 없음 메시지 */}
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
  )
}
