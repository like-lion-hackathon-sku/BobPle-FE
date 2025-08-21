import { type NextRequest, NextResponse } from "next/server"

// Mock 댓글 데이터
const mockComments = {
  1: [
    {
      id: 1,
      eventId: 1,
      userId: 3,
      user: {
        id: 3,
        name: "박준호",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "저도 참여하고 싶어요! 이탈리안 음식 정말 좋아해서요.",
      createdAt: "2024-01-19T14:30:00Z",
      updatedAt: "2024-01-19T14:30:00Z",
    },
    {
      id: 2,
      eventId: 1,
      userId: 4,
      user: {
        id: 4,
        name: "최유진",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "분위기 좋은 곳이네요! 다음에 또 모임 있으면 알려주세요.",
      createdAt: "2024-01-19T16:15:00Z",
      updatedAt: "2024-01-19T16:15:00Z",
    },
  ],
}

/**
 * 댓글 리스트 가져오기 API 엔드포인트
 * GET /api/events/{eventId}/comments
 */
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const eventId = Number.parseInt(params.eventId)

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "유효하지 않은 밥약 ID입니다." }, { status: 400 })
    }

    // 쿼리 파라미터에서 페이지네이션 정보 추출
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const comments = mockComments[eventId as keyof typeof mockComments] || []

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedComments = comments.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      comments: paginatedComments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(comments.length / limit),
        totalComments: comments.length,
        hasNext: endIndex < comments.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("댓글 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 댓글 작성 API 엔드포인트
 * POST /api/events/{eventId}/comments
 */
export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
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

    // 요청 본문에서 댓글 내용 추출
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "댓글 내용이 필요합니다." }, { status: 400 })
    }

    if (content.trim().length > 500) {
      return NextResponse.json({ error: "댓글은 500자 이내로 작성해주세요." }, { status: 400 })
    }

    // 새 댓글 생성
    const newComment = {
      id: Date.now(),
      eventId,
      userId,
      user: {
        id: userId,
        name: userId === 1 ? "김민수" : "이지은",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 실제 구현에서는 데이터베이스에 댓글 저장
    console.log("새 댓글 저장:", newComment)

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: "댓글이 성공적으로 작성되었습니다.",
    })
  } catch (error) {
    console.error("댓글 작성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
