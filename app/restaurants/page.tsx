"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MapPin, Star, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock restaurant data
const mockRestaurants = [
  {
    id: 1,
    name: "라 트라토리아",
    category: "양식",
    rating: 4.8,
    reviewCount: 127,
    priceRange: "₩₩₩",
    location: "강남구 역삼동",
    distance: "0.3km",
    image: "/italian-restaurant-interior.png",
    tags: ["파스타", "피자", "와인", "데이트"],
    openHours: "11:00 - 22:00",
    phone: "02-1234-5678",
    description: "정통 이탈리안 요리를 선보이는 아늑한 레스토랑",
    isRecommended: true,
  },
  {
    id: 2,
    name: "브런치 카페 델리",
    category: "양식",
    rating: 4.6,
    reviewCount: 89,
    priceRange: "₩₩",
    location: "마포구 홍대입구",
    distance: "1.2km",
    image: "/brunch-cafe-interior.png",
    tags: ["브런치", "커피", "디저트", "인스타"],
    openHours: "09:00 - 21:00",
    phone: "02-2345-6789",
    description: "맛있는 브런치와 커피를 즐길 수 있는 감성 카페",
    isRecommended: true,
  },
  {
    id: 3,
    name: "전통 한정식",
    category: "한식",
    rating: 4.9,
    reviewCount: 203,
    priceRange: "₩₩₩₩",
    location: "중구 을지로3가",
    distance: "2.1km",
    image: "/korean-traditional-restaurant.png",
    tags: ["한정식", "전통", "접대", "고급"],
    openHours: "12:00 - 21:30",
    phone: "02-3456-7890",
    description: "전통 한식의 진수를 맛볼 수 있는 고급 한정식집",
    isRecommended: false,
  },
  {
    id: 4,
    name: "스시 오마카세",
    category: "일식",
    rating: 4.7,
    reviewCount: 156,
    priceRange: "₩₩₩₩",
    location: "강남구 청담동",
    distance: "1.8km",
    image: "/sushi-omakase.png",
    tags: ["스시", "오마카세", "신선", "고급"],
    openHours: "18:00 - 23:00",
    phone: "02-4567-8901",
    description: "신선한 재료로 만드는 프리미엄 스시 오마카세",
    isRecommended: true,
  },
  {
    id: 5,
    name: "차이나타운",
    category: "중식",
    rating: 4.5,
    reviewCount: 98,
    priceRange: "₩₩₩",
    location: "중구 명동",
    distance: "1.5km",
    image: "/chinese-restaurant-interior.png",
    tags: ["짜장면", "탕수육", "딤섬", "가족"],
    openHours: "11:30 - 21:00",
    phone: "02-5678-9012",
    description: "정통 중화요리를 맛볼 수 있는 전통 중식당",
    isRecommended: false,
  },
]

export default function RestaurantsPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState(mockRestaurants)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const categories = ["전체", "한식", "일식", "중식", "양식"]

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "전체" || restaurant.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">식당 찾기</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="식당 이름, 음식 종류, 지역으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-6 bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">카테고리</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm font-medium"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Directly display restaurant list */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/restaurants/${restaurant.id}`)}
              >
                {restaurant.isRecommended && (
                  <div className="p-2">
                    <Badge className="inline-block">추천</Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          {restaurant.category}
                        </Badge>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-muted-foreground">({restaurant.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{restaurant.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {restaurant.location} • {restaurant.distance}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {restaurant.openHours}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {restaurant.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {restaurant.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{restaurant.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">검색 결과가 없습니다.</p>
              <p className="text-muted-foreground">다른 키워드로 검색해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
