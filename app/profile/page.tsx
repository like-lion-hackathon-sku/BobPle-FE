"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Star, MapPin, Users, TrendingUp, LogOut, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

// 사용자 프로필 목 데이터 - 실제로는 GET /api/profile API 호출로 대체
const mockProfile = {
  id: 1,
  name: "김민수",
  email: "minsu@example.com",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "맛있는 음식과 새로운 사람들과의 만남을 좋아합니다. 특히 이탈리안과 한식을 좋아해요!",
  statusMessage: "오늘도 맛있는 하루 되세요! 🍽️", // 사용자 상태메시지
  location: "서울 강남구",
  joinDate: "2023-06-15",
  rating: 4.8, // 평균 평점
  reviewCount: 23, // 받은 리뷰 개수
  completedMeals: 45, // 완료한 밥약 수
  hostedMeals: 12, // 주최한 밥약 수
  preferences: ["이탈리안", "한식", "일식", "카페", "브런치"], // 선호 음식 카테고리
  recentEvents: [
    {
      id: 1,
      title: "강남역 맛집 탐방",
      date: "2024-01-20",
      status: "upcoming", // 예정된 밥약
      participants: 3,
    },
    {
      id: 2,
      title: "홍대 브런치 모임",
      date: "2024-01-15",
      status: "completed", // 완료된 밥약
      participants: 4,
    },
  ],
  reviews: [
    {
      id: 1,
      reviewer: {
        name: "이지은",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 5,
      comment: "정말 친절하시고 대화도 재미있었어요! 다음에 또 함께 식사하고 싶습니다.",
      date: "2024-01-16",
      eventTitle: "홍대 브런치 모임",
    },
    {
      id: 2,
      reviewer: {
        name: "박준호",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 4,
      comment: "맛집 추천도 좋았고 분위기 메이커셨어요. 추천합니다!",
      date: "2024-01-10",
      eventTitle: "이태원 맛집 투어",
    },
    {
      id: 3,
      reviewer: {
        name: "최수진",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 5,
      comment: "시간 약속도 잘 지키시고 매너가 정말 좋으세요. 강력 추천!",
      date: "2024-01-08",
      eventTitle: "강남 이탈리안 디너",
    },
  ],
  recentReviews: [
    {
      id: 4,
      reviewer: {
        name: "정민호",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 5,
      comment: "호스트로서 정말 세심하게 챙겨주셨어요. 덕분에 즐거운 시간이었습니다!",
      date: "2024-01-18",
      eventTitle: "신촌 카페 모임",
      isNew: true, // 새로 받은 리뷰 표시
    },
  ],
}

/**
 * 사용자 프로필 페이지 컴포넌트
 * 현재 로그인한 사용자의 프로필 정보, 참여한 밥약, 받은 리뷰를 표시
 */
export default function ProfilePage() {
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const [profile, setProfile] = useState(mockProfile) // 프로필 데이터 상태

  // 로그인 상태 확인 (localStorage에서 가져옴)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true"
    }
    return false
  })

  /**
   * 새로운 리뷰와 기존 리뷰를 합쳐서 날짜순으로 정렬하는 함수
   * 최신 리뷰가 먼저 표시되도록 내림차순 정렬
   */
  const allReviews = [...profile.recentReviews, ...profile.reviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  /**
   * 로그인/로그아웃 처리 함수
   * 로그인 버튼 클릭 시 로그인 페이지로 이동, 로그아웃 시 상태 초기화 후 로그인 페이지로 이동
   */
  const handleAuthToggle = () => {
    if (isLoggedIn) {
      // 로그아웃 처리: localStorage 데이터 제거 후 로그인 페이지로 이동
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userProfile")
      setIsLoggedIn(false)
      router.push("/login")
    } else {
      // 로그인 페이지로 이동
      router.push("/login")
    }
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
                <Button variant="ghost" size="sm" onClick={() => router.push("/profile/edit")}>
                  <Edit className="w-4 h-4" />
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
            {/* 프로필 헤더 카드 */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* 프로필 아바타 */}
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center md:text-left">
                    {/* 사용자 이름 */}
                    <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                    {/* 상태메시지 (있는 경우) */}
                    {profile.statusMessage && (
                      <p className="text-sm text-muted-foreground mb-3 italic">"{profile.statusMessage}"</p>
                    )}
                    {/* 위치 정보 */}
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </div>
                    </div>

                    {/* 통계 정보 (평점, 완료한 밥약, 주최한 밥약) */}
                    <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          <span className="font-semibold">{profile.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{profile.reviewCount}개 리뷰</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{profile.completedMeals}</div>
                        <span className="text-xs text-muted-foreground">완료한 밥약</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{profile.hostedMeals}</div>
                        <span className="text-xs text-muted-foreground">주최한 밥약</span>
                      </div>
                    </div>

                    {/* 자기소개 */}
                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 새로운 리뷰 알림 카드 (새 리뷰가 있는 경우에만 표시) */}
            {profile.recentReviews.length > 0 && (
              <Card className="mb-6 border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-green-700">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    새로운 리뷰가 도착했어요!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.recentReviews.map((review) => (
                      <div key={review.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{review.reviewer.name}</span>
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
                            <Badge variant="secondary" className="text-xs">
                              NEW
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{review.eventTitle}</p>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 선호하는 음식 카테고리 카드 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>선호하는 음식</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.map((preference, index) => (
                    <Badge key={index} variant="secondary">
                      {preference}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 참여한 밥약과 받은 리뷰 탭 */}
            <Tabs defaultValue="events" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="events">참여한 밥약</TabsTrigger>
                <TabsTrigger value="reviews" className="relative">
                  받은 리뷰
                  {/* 새 리뷰 개수 배지 */}
                  {profile.recentReviews.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {profile.recentReviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* 참여한 밥약 탭 내용 */}
              <TabsContent value="events" className="space-y-4">
                {profile.recentEvents.map((event) => (
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
                              {event.participants}명 참여
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
                ))}
              </TabsContent>

              {/* 받은 리뷰 탭 내용 */}
              <TabsContent value="reviews" className="space-y-4">
                {allReviews.map((review) => (
                  <Card key={review.id} className={review.isNew ? "border-green-200 bg-green-50/30" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{review.reviewer.name}</span>
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
                            {/* 새 리뷰 배지 */}
                            {review.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                NEW
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{review.eventTitle}</p>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
