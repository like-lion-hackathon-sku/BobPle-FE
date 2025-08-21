import { type NextRequest, NextResponse } from "next/server"

// Mock 밥약 데이터
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
    hostId: 1,
    participants: [1, 2],
    restaurant: "라 트라토리아",
    category: "양식",
    region: "강남",
    genderRestriction: "상관없음",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
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
    hostId: 2,
    participants: [2, 3, 4],
    restaurant: "브런치 카페 델리",
    category: "양식",
    region: "홍대",
    genderRestriction: "여자만",
    status: "active",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },
]

/**
 * 밥약 상세 조회 API 엔드포인트
 * GET /api/events/{eventId}
 */
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const eventId = Number.parseInt(params.eventId)

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "유효하지 않은 밥약 ID입니다." }, { status: 400 })
    }

    const event = mockEvents.find((e) => e.id === eventId)

    if (!event) {
      return NextResponse.json({ error: "밥약을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error) {
    console.error("밥약 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 밥약 삭제 API 엔드포인트
 * DELETE /api/events/{eventId}/cancel
 */
export async function DELETE(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const eventId = Number.parseInt(params.eventId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "유효하지 않은 밥약 ID입니다." }, { status: 400 })
    }

    const event = mockEvents.find((e) => e.id === eventId)

    if (!event) {
      return NextResponse.json({ error: "밥약을 찾을 수 없습니다." }, { status: 404 })
    }

    // 호스트만 삭제 가능
    if (event.hostId !== userId) {
      return NextResponse.json({ error: "밥약을 삭제할 권한이 없습니다." }, { status: 403 })
    }

    // 실제 구현에서는 데이터베이스에서 삭제 또는 상태 변경
    console.log(`밥약 ${eventId} 삭제됨`)

    return NextResponse.json({
      success: true,
      message: "밥약이 성공적으로 삭제되었습니다.",
    })
  } catch (error) {
    console.error("밥약 삭제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
