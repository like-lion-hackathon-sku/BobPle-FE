"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, MapPin, Clock, Phone, Heart, Share, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

// Mock restaurant detail data
const mockRestaurantDetail = {
  id: 1,
  name: "라 트라토리아",
  category: "이탈리안",
  rating: 4.8,
  reviewCount: 127,
  priceRange: "₩₩₩",
  location: "서울 강남구 역삼동 123-45",
  distance: "0.3km",
  images: [
    "/italian-restaurant-interior.png",
    "/delicious-pasta-dish.png",
    "/pizza-margherita.png",
    "/cozy-restaurant.png",
  ],
  tags: ["파스타", "피자", "와인", "데이트", "분위기좋은", "주차가능"],
  openHours: {
    weekday: "11:00 - 22:00",
    weekend: "11:00 - 23:00",
    holiday: "휴무",
  },
  phone: "02-1234-5678",
  description:
    "정통 이탈리안 요리를 선보이는 아늑한 레스토랑입니다. 신선한 재료로 만든 파스타와 피자, 그리고 엄선된 와인을 즐기실 수 있습니다.",
  menu: [
    { name: "마르게리타 피자", price: "18,000원", description: "토마토, 모짜렐라, 바질" },
    { name: "까르보나라", price: "16,000원", description: "베이컨, 달걀, 파마산 치즈" },
    { name: "알리오 올리오", price: "14,000원", description: "마늘, 올리브오일, 페페론치노" },
    { name: "리조또", price: "19,000원", description: "버섯 리조또 또는 해산물 리조또" },
  ],
  isFavorite: false,
  reviews: [
    {
      id: 1,
      user: {
        name: "김민수",
        avatar: "/placeholder.svg?height=32&width=32",
        reviewCount: 23,
      },
      rating: 5,
      content: "정말 맛있었어요! 파스타가 특히 인상적이었고 분위기도 너무 좋았습니다. 데이트 코스로 추천합니다.",
      images: ["/delicious-pasta-dish.png"],
      date: "2024-01-15",
      helpful: 12,
    },
    {
      id: 2,
      user: {
        name: "이지은",
        avatar: "/placeholder.svg?height=32&width=32",
        reviewCount: 45,
      },
      rating: 4,
      content: "피자가 정말 맛있고 직원분들도 친절해요. 다만 웨이팅이 좀 있어서 예약하고 가시는 걸 추천드려요.",
      images: [],
      date: "2024-01-10",
      helpful: 8,
    },
  ],
}

export default function RestaurantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [restaurant, setRestaurant] = useState(mockRestaurantDetail)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, content: "" })

  const toggleFavorite = () => {
    setRestaurant((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
  }

  const handleSubmitReview = async () => {
    if (!newReview.content.trim()) return

    try {
      const review = {
        id: Date.now(),
        user: {
          name: "현재 사용자",
          avatar: "/placeholder.svg?height=32&width=32",
          reviewCount: 1,
        },
        rating: newReview.rating,
        content: newReview.content,
        images: [],
        date: new Date().toISOString().split("T")[0],
        helpful: 0,
      }

      setRestaurant((prev) => ({
        ...prev,
        reviews: [review, ...prev.reviews],
        reviewCount: prev.reviewCount + 1,
      }))

      setNewReview({ rating: 5, content: "" })
      setShowReviewDialog(false)
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  const createMealEvent = () => {
    router.push(`/create?restaurant=${restaurant.name}&location=${restaurant.location}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleFavorite}>
                <Heart className={`w-4 h-4 ${restaurant.isFavorite ? "fill-current text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Images */}
        <div className="mb-6">
          <div className="relative mb-4">
            <img
              src={restaurant.images[selectedImageIndex] || "/placeholder.svg"}
              alt={restaurant.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {restaurant.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${restaurant.name} ${index + 1}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 ${
                  selectedImageIndex === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-current text-yellow-500" />
                    <span className="font-semibold text-lg">{restaurant.rating}</span>
                    <span className="text-muted-foreground">({restaurant.reviewCount}개 리뷰)</span>
                  </div>
                  <Badge variant="outline">{restaurant.category}</Badge>
                  <span className="text-muted-foreground">{restaurant.priceRange}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">{restaurant.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.location}</span>
                <span className="text-sm text-muted-foreground">• {restaurant.distance}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  평일 {restaurant.openHours.weekday} • 주말 {restaurant.openHours.weekend}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={createMealEvent}>
                <Plus className="w-4 h-4 mr-2" />이 식당에서 밥약 만들기
              </Button>
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    리뷰 작성
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{restaurant.name} 리뷰 작성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">평점</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer ${
                              star <= newReview.rating ? "fill-current text-yellow-500" : "text-gray-300"
                            }`}
                            onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">리뷰 내용</label>
                      <Textarea
                        placeholder="식당에 대한 솔직한 후기를 남겨주세요"
                        value={newReview.content}
                        onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowReviewDialog(false)}
                      >
                        취소
                      </Button>
                      <Button className="flex-1" onClick={handleSubmitReview} disabled={!newReview.content.trim()}>
                        리뷰 작성
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="menu" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">메뉴</TabsTrigger>
            <TabsTrigger value="reviews">리뷰 ({restaurant.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>대표 메뉴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurant.menu.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="font-semibold text-primary">{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {restaurant.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{review.user.name}</span>
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
                      <p className="text-sm mb-3">{review.content}</p>
                      {review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg"}
                              alt={`리뷰 이미지 ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>도움됨 {review.helpful}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                          도움돼요
                        </Button>
                      </div>
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
