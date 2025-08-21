import { type NextRequest, NextResponse } from "next/server"

/**
 * 밥약 수정 API 엔드포인트
 * PUT /api/events/{eventId}/edit
 */
export async function PUT(request: NextRequest, { params }: { params: { eventId: string } }) {
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

    // 요청 본문에서 수정할 데이터 추출
    const updateData = await request.json()

    // 수정 가능한 필드만 허용
    const allowedFields = [
      "title",
      "description",
      "location",
      "restaurant",
      "startDateTime",
      "endDateTime",
      "maxParticipants",
      "genderRestriction",
    ]

    const filteredUpdateData: any = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field]
      }
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      return NextResponse.json({ error: "수정할 데이터가 없습니다." }, { status: 400 })
    }

    // Mock 밥약 데이터에서 해당 밥약 찾기
    // 실제 구현에서는 데이터베이스에서 조회 및 권한 확인

    return NextResponse.json({
      success: true,
      message: "밥약이 성공적으로 수정되었습니다.",
      updatedFields: Object.keys(filteredUpdateData),
    })
  } catch (error) {
    console.error("밥약 수정 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
