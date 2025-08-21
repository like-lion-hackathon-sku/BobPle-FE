import { type NextRequest, NextResponse } from "next/server"

/**
 * 밥약 생성 API 엔드포인트
 * POST /api/events/creation
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 밥약 데이터 추출
    const eventData = await request.json()

    // 필수 필드 검증
    const requiredFields = ["title", "location", "startDateTime", "endDateTime", "maxParticipants"]
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json({ error: `${field}는 필수 입력 항목입니다.` }, { status: 400 })
      }
    }

    // 토큰에서 사용자 ID 추출 (Mock 로직)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // 새 밥약 생성 (Mock 데이터)
    const newEvent = {
      id: Date.now(), // 실제로는 데이터베이스에서 자동 생성
      ...eventData,
      hostId: userId,
      currentParticipants: 1, // 호스트 포함
      participants: [userId],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 실제 구현에서는 데이터베이스에 저장
    console.log("새 밥약 생성:", newEvent)

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "밥약이 성공적으로 생성되었습니다.",
    })
  } catch (error) {
    console.error("밥약 생성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
