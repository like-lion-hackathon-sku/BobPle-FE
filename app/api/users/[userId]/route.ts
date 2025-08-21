import { type NextRequest, NextResponse } from "next/server"

/**
 * 다른 사용자 프로필 조회 API 엔드포인트
 * GET /api/users/{userId}
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "유효하지 않은 사용자 ID입니다." }, { status: 400 })
    }

    // Mock 사용자 데이터
    const mockUsers = [
      {
        id: 1,
        name: "김민수",
        profileImage: "/abstract-profile.png",
        statusMessage: "맛있는 음식과 좋은 사람들과 함께!",
        location: "강남구",
        grade: "3학년",
        gender: "남성",
        bio: "음식을 사랑하는 대학생입니다.",
        rating: 4.8,
        reviewCount: 23,
        joinDate: "2023-06-01",
      },
      {
        id: 2,
        name: "이지은",
        profileImage: "/abstract-profile.png",
        statusMessage: "새로운 사람들과의 만남을 기대해요",
        location: "홍대입구",
        grade: "2학년",
        gender: "여성",
        bio: "다양한 음식을 좋아해요!",
        rating: 4.6,
        reviewCount: 18,
        joinDate: "2023-08-15",
      },
      {
        id: 3,
        name: "박준호",
        profileImage: "/abstract-profile.png",
        statusMessage: "좋은 사람들과 맛있는 식사를!",
        location: "신촌",
        grade: "4학년",
        gender: "남성",
        bio: "졸업 전에 많은 사람들과 만나고 싶어요.",
        rating: 4.7,
        reviewCount: 31,
        joinDate: "2023-03-10",
      },
    ]

    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("사용자 프로필 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
