import { type NextRequest, NextResponse } from "next/server"

/**
 * 댓글 삭제 API 엔드포인트
 * DELETE /api/events/{eventId}/comments/{commentId}
 */
export async function DELETE(request: NextRequest, { params }: { params: { eventId: string; commentId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const eventId = Number.parseInt(params.eventId)
    const commentId = Number.parseInt(params.commentId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(eventId) || isNaN(commentId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 })
    }

    // 실제 구현에서는 데이터베이스에서 댓글 조회 및 권한 확인
    // 댓글 작성자 또는 밥약 호스트만 삭제 가능

    // Mock 권한 확인 로직
    const canDelete = true // 실제로는 댓글 작성자 또는 호스트 여부 확인

    if (!canDelete) {
      return NextResponse.json({ error: "댓글을 삭제할 권한이 없습니다." }, { status: 403 })
    }

    // 실제 구현에서는 데이터베이스에서 댓글 삭제
    console.log(`댓글 ${commentId} 삭제됨 (밥약: ${eventId}, 사용자: ${userId})`)

    return NextResponse.json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
    })
  } catch (error) {
    console.error("댓글 삭제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
