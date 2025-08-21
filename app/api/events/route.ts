import { type NextRequest, NextResponse } from "next/server"

// Mock 밥약 목록 데이터
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
      id: 1,
      name: "김민수",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
    },
    restaurant: "라 트라토리아",
    category: "양식",
    region: "강남",
    genderRestriction: "상관없음",
    status: "active",
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
      id: 2,
      name: "이지은",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
    restaurant: "브런치 카페 델리",
    category: "양식",
    region: "홍대",
    genderRestriction: "여자만",
    status: "active",
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
      id: 3,
      name: "박준호",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
    },
    restaurant: "전통 한정식",
    category: "한식",
    region: "을지로",
    genderRestriction: "남자만",
    status: "active",
  },
]

/**
 * 밥약 목록 조회 API 엔드포인트
 * GET /api/events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 추출
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const region = searchParams.get("region") || ""
    const genderRestriction = searchParams.get("genderRestriction") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // 필터링 로직
    const filteredEvents = mockEvents.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase()) ||
        event.restaurant.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = !category || event.category === category
      const matchesRegion = !region || event.region === region
      const matchesGender = !genderRestriction || event.genderRestriction === genderRestriction

      return matchesSearch && matchesCategory && matchesRegion && matchesGender
    })

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      events: paginatedEvents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredEvents.length / limit),
        totalEvents: filteredEvents.length,
        hasNext: endIndex < filteredEvents.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("밥약 목록 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
