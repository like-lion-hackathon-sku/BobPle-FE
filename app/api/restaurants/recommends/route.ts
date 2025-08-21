import { type NextRequest, NextResponse } from "next/server"

// Mock 추천 식당 데이터
const mockRecommendedRestaurants = [
  {
    id: 1,
    name: "라 트라토리아",
    category: "이탈리안",
    location: "강남구 역삼동",
    rating: 4.8,
    reviewCount: 127,
    priceRange: "₩₩₩",
    tags: ["데이트", "분위기좋은", "파스타맛집"],
    description: "정통 이탈리안 레스토랑으로 파스타와 피자가 일품입니다.",
    recommendationReason: "최근 밥약에서 높은 만족도를 보인 레스토랑",
    distance: "0.3km",
    estimatedWaitTime: "15-20분",
  },
  {
    id: 2,
    name: "브런치 카페 델리",
    category: "카페/브런치",
    location: "마포구 홍대입구",
    rating: 4.6,
    reviewCount: 89,
    priceRange: "₩₩",
    tags: ["브런치", "카페", "인스타그램"],
    description: "맛있는 브런치와 커피를 즐길 수 있는 감성 카페입니다.",
    recommendationReason: "주말 브런치 모임에 인기가 높은 장소",
    distance: "1.2km",
    estimatedWaitTime: "10-15분",
  },
  {
    id: 3,
    name: "스시 하나미",
    category: "일식",
    location: "강남구 신사동",
    rating: 4.9,
    reviewCount: 203,
    priceRange: "₩₩₩₩",
    tags: ["스시", "오마카세", "고급"],
    description: "신선한 재료로 만든 프리미엄 스시 오마카세 전문점입니다.",
    recommendationReason: "특별한 날 모임으로 추천되는 고급 레스토랑",
    distance: "2.1km",
    estimatedWaitTime: "30-45분",
  },
  {
    id: 4,
    name: "북경반점",
    category: "중식",
    location: "중구 명동",
    rating: 4.4,
    reviewCount: 156,
    priceRange: "₩₩",
    tags: ["중식", "짜장면", "탕수육"],
    description: "전통 중식 요리를 합리적인 가격에 즐길 수 있는 곳입니다.",
    recommendationReason: "점심 모임에 적합한 가성비 좋은 중식당",
    distance: "0.8km",
    estimatedWaitTime: "5-10분",
  },
]

/**
 * 식당 추천 조회 API 엔드포인트
 * GET /api/restaurants/recommends
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출 (선택사항 - 개인화된 추천을 위해)
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    // 쿼리 파라미터에서 필터링 옵션 추출
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const priceRange = searchParams.get("priceRange")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let recommendations = [...mockRecommendedRestaurants]

    // 카테고리별 필터링
    if (category) {
      recommendations = recommendations.filter((restaurant) =>
        restaurant.category.toLowerCase().includes(category.toLowerCase()),
      )
    }

    // 지역별 필터링
    if (location) {
      recommendations = recommendations.filter((restaurant) =>
        restaurant.location.toLowerCase().includes(location.toLowerCase()),
      )
    }

    // 가격대별 필터링
    if (priceRange) {
      recommendations = recommendations.filter((restaurant) => restaurant.priceRange === priceRange)
    }

    // 개수 제한
    recommendations = recommendations.slice(0, limit)

    // 사용자 기반 개인화 (토큰이 있는 경우)
    if (token) {
      const userId = token.includes("mock-jwt-token-1") ? 1 : 2
      // 실제 구현에서는 사용자의 선호도, 과거 방문 기록 등을 고려한 개인화 추천
      console.log(`사용자 ${userId}를 위한 개인화된 추천 적용`)
    }

    return NextResponse.json({
      success: true,
      recommendations,
      totalCount: recommendations.length,
      filters: {
        category,
        location,
        priceRange,
      },
    })
  } catch (error) {
    console.error("식당 추천 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
