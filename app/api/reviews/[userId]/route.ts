import { type NextRequest, NextResponse } from "next/server"

// Mock 리뷰 데이터
const mockReviews = {
  1: [
    {
      id: 1,
      reviewerId: 2,
      reviewerName: "이지은",
      reviewerAvatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment: "정말 친절하시고 맛집 추천도 좋았어요! 다음에 또 함께하고 싶습니다.",
      eventTitle: "강남역 맛집 탐방",
      createdAt: "2024-01-15T20:30:00Z",
    },
    {
      id: 2,
      reviewerId: 3,
      reviewerName: "박준호",
      reviewerAvatar: "/placeholder.svg?height=32&width=32",
      rating: 4,
      comment: "좋은 시간이었습니다. 음식도 맛있고 대화도 즐거웠어요.",
      eventTitle: "홍대 브런치 모임",
      createdAt: "2024-01-10T14:15:00Z",
    },
  ],
  2: [
    {
      id: 3,
      reviewerId: 1,
      reviewerName: "김민수",
      reviewerAvatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment: "시간 약속도 잘 지키시고 분위기도 좋게 만들어주셨어요!",
      eventTitle: "강남역 맛집 탐방",
      createdAt: "2024-01-15T20:35:00Z",
    },
  ],
}

/**
 * 유저 평가 조회 API 엔드포인트
 * GET /api/reviews/{userId}
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "유효하지 않은 사용자 ID입니다." }, { status: 400 })
    }

    // 쿼리 파라미터에서 페이지네이션 정보 추출
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const userReviews = mockReviews[userId as keyof typeof mockReviews] || []

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReviews = userReviews.slice(startIndex, endIndex)

    // 평균 평점 계산
    const averageRating =
      userReviews.length > 0 ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length : 0

    return NextResponse.json({
      success: true,
      reviews: paginatedReviews,
      statistics: {
        totalReviews: userReviews.length,
        averageRating: Math.round(averageRating * 10) / 10, // 소수점 첫째 자리까지
        ratingDistribution: {
          5: userReviews.filter((r) => r.rating === 5).length,
          4: userReviews.filter((r) => r.rating === 4).length,
          3: userReviews.filter((r) => r.rating === 3).length,
          2: userReviews.filter((r) => r.rating === 2).length,
          1: userReviews.filter((r) => r.rating === 1).length,
        },
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userReviews.length / limit),
        hasNext: endIndex < userReviews.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("리뷰 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 유저 평가 작성 API 엔드포인트
 * POST /api/reviews/{userId}
 */
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const targetUserId = Number.parseInt(params.userId)
    const reviewerId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "유효하지 않은 사용자 ID입니다." }, { status: 400 })
    }

    if (targetUserId === reviewerId) {
      return NextResponse.json({ error: "자신에게는 리뷰를 작성할 수 없습니다." }, { status: 400 })
    }

    // 요청 본문에서 리뷰 데이터 추출
    const { rating, comment, eventId } = await request.json()

    // 필수 필드 검증
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "1-5 사이의 평점이 필요합니다." }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: "밥약 ID가 필요합니다." }, { status: 400 })
    }

    // 댓글 길이 검증 (선택사항)
    if (comment && comment.length > 500) {
      return NextResponse.json({ error: "리뷰는 500자 이내로 작성해주세요." }, { status: 400 })
    }

    // 새 리뷰 생성
    const newReview = {
      id: Date.now(),
      reviewerId,
      reviewerName: reviewerId === 1 ? "김민수" : "이지은",
      reviewerAvatar: "/placeholder.svg?height=32&width=32",
      rating,
      comment: comment || "",
      eventId,
      eventTitle: "밥약 제목", // 실제로는 eventId로 조회
      createdAt: new Date().toISOString(),
    }

    // 실제 구현에서는 데이터베이스에 리뷰 저장
    console.log("새 리뷰 저장:", newReview)

    return NextResponse.json({
      success: true,
      review: newReview,
      message: "리뷰가 성공적으로 작성되었습니다.",
    })
  } catch (error) {
    console.error("리뷰 작성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
