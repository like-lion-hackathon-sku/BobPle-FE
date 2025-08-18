"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, MapPin, Calendar, Users, MessageCircle, Flag } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

// Mock other user profile data
const mockOtherProfile = {
  id: 2,
  name: "이지은",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "새로운 맛집 발견하는 것을 좋아하고, 다양한 사람들과 이야기 나누는 것을 즐깁니다.",
  location: "서울 홍대",
  joinDate: "2023-08-20",
  rating: 4.9,
  reviewCount: 31,
  completedMeals: 67,
  hostedMeals: 18,
  preferences: ["브런치", "카페", "이탈리안", "일식"],
  recentEvents: [
    {
      id: 1,
      title: "홍대 브런치 모임",
      date: "2024-01-21",
      status: "upcoming",
      participants: 4,
    },
    {
      id: 2,
      title: "신촌 파스타 맛집",
      date: "2024-01-18",
      status: "completed",
      participants: 3,
    },
  ],
  reviews: [
    {
      id: 1,
      reviewer: {
        name: "김민수",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 5,
      comment: "정말 재미있는 분이시고 맛집 추천도 최고였어요!",
      date: "2024-01-19",
    },
    {
      id: 2,
      reviewer: {
        name: "박준호",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      rating: 5,
      comment: "대화가 즐거웠고 다음에 또 만나고 싶어요.",
      date: "2024-01-12",
    },
  ],
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [profile, setProfile] = useState(mockOtherProfile)

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
              <h1 className="text-xl font-semibold">{profile.name}님의 프로필</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(profile.joinDate).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })} 가입
                  </div>
                </div>

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

                <p className="text-muted-foreground leading-relaxed mb-4">{profile.bio}</p>

                <div className="flex gap-3">
                  <Button>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    메시지 보내기
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
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

        {/* Tabs for Events and Reviews */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">최근 밥약</TabsTrigger>
            <TabsTrigger value="reviews">받은 리뷰</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {profile.recentEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                    <Badge variant={event.status === "completed" ? "secondary" : "default"}>
                      {event.status === "completed" ? "완료" : "예정"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {profile.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{review.reviewer.name}</span>
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
                          {new Date(review.date).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
