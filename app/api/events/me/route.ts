import { type NextRequest, NextResponse } from "next/server"

/**
 * 내가 신청한 밥약 조회 API 엔드포인트
 * GET /api/events/me
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // Mock 데이터: 사용자가 참여한 밥약들
    const userEvents = [
      {
        id: 1,
        title: "강남역 맛집 탐방",
        description: "새로 오픈한 이탈리안 레스토랑에서 함께 저녁 드실 분 구해요!",
        location: "강남역 2번 출구",
        date: "2024-01-20",
        startTime: "19:00",
        endTime: "21:00",
        restaurant: "라 트라토리아",
        status: "upcoming", // upcoming, completed, cancelled
        role: userId === 1 ? "host" : "participant", // host 또는 participant
        applicationStatus: "approved", // pending, approved, rejected (participant인 경우)
      },
      {
        id: 4,
        title: "신사동 스시 오마카세",
        description: "고급 스시 오마카세를 함께 즐기실 분들을 찾습니다!",
        location: "신사역 8번 출구",
        date: "2024-01-23",
        startTime: "18:30",
        endTime: "20:30",
        restaurant: "스시 하나미",
        status: "upcoming",
        role: "participant",
        applicationStatus: "approved",
      },
    ]

    return NextResponse.json({
      success: true,
      events: userEvents,
      totalCount: userEvents.length,
    })
  } catch (error) {
    console.error("내 밥약 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
