"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Star, MapPin, Users, LogOut, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { authAPI, reviewAPI, eventAPI } from "@/lib/api"

/**
 * 사용자 프로필 페이지 컴포넌트
 * 현재 로그인한 사용자의 프로필 정보, 참여한 밥약, 받은 리뷰를 표시
 */
export default function ProfilePage() {
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const [profile, setProfile] = useState(null) // 프로필 데이터 상태
  const [reviews, setReviews] = useState([]) // 리뷰 데이터 상태
  const [recentEvents, setRecentEvents] = useState([]) // 최근 밥약 데이터 상태
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 로그인 상태 확인 (localStorage에서 가져옴)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true"
    }
    return false
  })

  /**
   * 프로필 데이터를 API에서 로드하는 함수
   */
  const loadProfileData = async () => {
    if (!isLoggedIn) {
      setIsLoading(false)
      return
    }

    try {
      setError("")

      const profileResponse = await authAPI.getProfile()
      if (profileResponse.success) {
        setProfile(profileResponse.profile)

        const reviewsResponse = await reviewAPI.getUserReviews(profileResponse.profile.id)
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.reviews)
        }

        const eventsResponse = await eventAPI.getMyEvents()
        if (eventsResponse.success) {
          setRecentEvents(eventsResponse.events)
        }
      }
    } catch (error) {
      console.error("프로필 데이터 로드 실패:", error)
      setError("프로필 정보를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 프로필 데이터 로드
  useEffect(() => {
    loadProfileData()
  }, [isLoggedIn])

  /**
   * 로그인/로그아웃 처리 함수
   * 로그인 버튼 클릭 시 로그인 페이지로 이동, 로그아웃 시 상태 초기화 후 로그인 페이지로 이동
   */
  const handleAuthToggle = async () => {
    if (isLoggedIn) {
      try {
        await authAPI.logout()
        setIsLoggedIn(false)
        setProfile(null)
        setReviews([])
        setRecentEvents([])
        router.push("/login")
      } catch (error) {
        console.error("로그아웃 실패:", error)
        // 로그아웃 실패해도 로컬 상태는 초기화
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
        setIsLoggedIn(false)
        router.push("/login")
      }
    } else {
      // 로그인 페이지로 이동
      router.push("/login")
    }
  }

  // 로딩 중일 때 표시할 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 뒤로가기 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">내 프로필</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* 로그인/로그아웃 토글 버튼 */}
              <Button
                variant={isLoggedIn ? "outline" : "default"}
                size="sm"
                onClick={handleAuthToggle}
                className="flex items-center space-x-1"
              >
                {isLoggedIn ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>로그인</span>
                  </>
                )}
              </Button>
              {/* 프로필 편집 버튼 (로그인 상태에서만 표시) */}
              {isLoggedIn && (
                <Button variant="outline" size="sm" onClick={() => router.push("/profile/edit")}>
                  <Edit className="w-4 h-4 mr-1" />
                  <span>수정</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 로그아웃 상태일 때 로그인 안내 화면 */}
        {!isLoggedIn ? (
          <div className="text-center py-12">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-32 h-32 mx-auto mb-6 animate-bounce" />
            <h2 className="text-2xl font-bold mb-4">로그인이 필요해요!</h2>
            <p className="text-muted-foreground mb-6">밥플에서 새로운 사람들과 맛있는 식사를 함께해보세요</p>
            <Button onClick={handleAuthToggle} size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              로그인하기
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {profile && (
              <>
                {/* 프로필 헤더 카드 */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      {/* 프로필 아바타 */}
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">{profile.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-center md:text-left">
                        {/* 사용자 이름 */}
                        <h2 className="text-2xl font-bold mb-2">{profile.name || "사용자"}</h2>
                        {/* 상태메시지 (있는 경우) */}
                        {profile.statusMessage && (
                          <p className="text-sm text-muted-foreground mb-3 italic">"{profile.statusMessage}"</p>
                        )}
                        {/* 위치 정보 */}
                        <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {profile.location || "위치 정보 없음"}
                          </div>
                        </div>

                        {/* 통계 정보 (평점, 완료한 밥약, 주최한 밥약) */}
                        <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="w-4 h-4 fill-current text-yellow-500" />
                              <span className="font-semibold">{profile.rating || 0}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{reviews.length}개 리뷰</span>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{profile.completedMeals || 0}</div>
                            <span className="text-xs text-muted-foreground">완료한 밥약</span>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{profile.hostedMeals || 0}</div>
                            <span className="text-xs text-muted-foreground">주최한 밥약</span>
                          </div>
                        </div>

                        {/* 자기소개 */}
                        <p className="text-muted-foreground leading-relaxed">{profile.bio || "자기소개가 없습니다."}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 참여한 밥약과 받은 리뷰 탭 */}
                <Tabs defaultValue="events" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="events">참여한 밥약</TabsTrigger>
                    <TabsTrigger value="reviews">받은 리뷰</TabsTrigger>
                  </TabsList>

                  {/* 참여한 밥약 탭 내용 */}
                  <TabsContent value="events" className="space-y-4">
                    {recentEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">참여한 밥약이 없습니다.</p>
                      </div>
                    ) : (
                      recentEvents.map((event) => (
                        <Card
                          key={event.id}
                          className={`transition-shadow ${
                            event.status === "upcoming" ? "cursor-pointer hover:shadow-md" : "opacity-75"
                          }`}
                          onClick={() => {
                            // 예정된 밥약만 클릭 가능 (상세 페이지로 이동)
                            if (event.status === "upcoming") {
                              router.push(`/events/${event.id}`)
                            }
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{event.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>{new Date(event.date).toLocaleDateString("ko-KR")}</span>
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {event.participants || 0}명 참여
                                  </div>
                                </div>
                              </div>
                              {/* 밥약 상태 배지 */}
                              <Badge variant={event.status === "completed" ? "secondary" : "default"}>
                                {event.status === "completed" ? "완료" : "예정"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* 받은 리뷰 탭 내용 */}
                  <TabsContent value="reviews" className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">받은 리뷰가 없습니다.</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.reviewerAvatar || "/placeholder.svg"} />
                                <AvatarFallback>{review.reviewerName?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium">{review.reviewerName}</span>
                                  {/* 별점 표시 */}
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating ? "fill-current text-yellow-500" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{review.eventTitle}</p>
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
