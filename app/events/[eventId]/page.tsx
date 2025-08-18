"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MapPin, Clock, Users, Star, Edit, Trash2, UserPlus, MoreVertical } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

// 밥약 상세 정보 목 데이터 - 실제로는 GET /api/events/{eventId} API 호출로 대체
const mockEventDetail = {
  id: 1,
  title: "강남역 맛집 탐방",
  description:
    "새로 오픈한 이탈리안 레스토랑에서 함께 저녁 드실 분 구해요! 파스타와 피자가 정말 맛있다고 해서 꼭 가보고 싶었어요. 분위기도 좋고 가격도 합리적이라고 들었습니다.",
  location: "강남역 2번 출구",
  datetime: "2024-01-20 19:00",
  maxParticipants: 4,
  currentParticipants: 2,
  genderRestriction: "상관없음", // 성별 제한 정보 추가
  host: {
    id: 1,
    name: "김민수",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4.8,
    reviewCount: 23,
  },
  restaurant: "라 트라토리아",
  tags: ["이탈리안", "신규오픈", "분위기좋은"],
  participants: [
    {
      id: 1,
      name: "김민수",
      avatar: "/placeholder.svg?height=32&width=32",
      isHost: true,
    },
    {
      id: 2,
      name: "이지은",
      avatar: "/placeholder.svg?height=32&width=32",
      isHost: false,
    },
  ],
  comments: [
    {
      id: 1,
      user: {
        name: "박준호",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "저도 참여하고 싶어요! 이탈리안 음식 정말 좋아해서요.",
      createdAt: "2024-01-19 14:30",
    },
  ],
  isUserApplied: false, // 현재 사용자가 이미 신청했는지 여부
  isUserHost: false, // 현재 사용자가 호스트인지 여부
}

/**
 * 밥약 상세 페이지 컴포넌트
 * 특정 밥약의 상세 정보를 보여주고 참여 신청, 댓글 작성 등의 기능을 제공
 */
export default function EventDetailPage() {
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const params = useParams() // URL 파라미터 접근 (eventId)
  const [event, setEvent] = useState(mockEventDetail) // 밥약 상세 정보 상태
  const [newComment, setNewComment] = useState("") // 새 댓글 입력 상태
  const [isApplying, setIsApplying] = useState(false) // 참여 신청 중 상태
  const [showApplyDialog, setShowApplyDialog] = useState(false) // 참여 신청 다이얼로그 표시 여부
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(2) // 대기 중인 신청 개수

  /**
   * 밥약 참여 신청 처리 함수
   * 참여 신청 후 자동으로 채팅방으로 이동
   */
  const handleApply = async () => {
    setIsApplying(true)
    try {
      // Mock API 호출 - 실제로는 POST /api/events/{eventId}/application 엔드포인트 호출
      console.log("Applying to event:", params.eventId)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 참여 신청 성공 시 상태 업데이트
      setEvent((prev) => ({
        ...prev,
        isUserApplied: true,
        currentParticipants: prev.currentParticipants + 1,
      }))
      setShowApplyDialog(false)

      // 참여 신청 후 자동으로 채팅방으로 이동
      router.push(`/chat/${params.eventId}`)
    } catch (error) {
      console.error("Failed to apply:", error)
    } finally {
      setIsApplying(false)
    }
  }

  /**
   * 밥약 참여 신청 취소 처리 함수
   */
  const handleCancelApplication = async () => {
    try {
      // Mock API 호출 - 실제로는 DELETE /api/events/{eventId}/application/{applicationId}/cancel 엔드포인트 호출
      console.log("Canceling application for event:", params.eventId)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 참여 취소 성공 시 상태 업데이트
      setEvent((prev) => ({
        ...prev,
        isUserApplied: false,
        currentParticipants: prev.currentParticipants - 1,
      }))
    } catch (error) {
      console.error("Failed to cancel application:", error)
    }
  }

  /**
   * 새 댓글 추가 처리 함수
   */
  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      // Mock API 호출 - 실제로는 POST /api/events/{eventId}/comments 엔드포인트 호출
      const comment = {
        id: Date.now(),
        user: {
          name: "현재 사용자",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: newComment,
        createdAt: new Date().toISOString(),
      }

      // 댓글 목록에 새 댓글 추가
      setEvent((prev) => ({
        ...prev,
        comments: [...prev.comments, comment],
      }))
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  /**
   * 댓글 삭제 처리 함수
   * @param commentId 삭제할 댓글 ID
   */
  const handleDeleteComment = async (commentId: number) => {
    try {
      // Mock API 호출 - 실제로는 DELETE /api/events/{eventId}/comments/{commentId} 엔드포인트 호출
      console.log("Deleting comment:", commentId)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 댓글 목록에서 해당 댓글 제거
      setEvent((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment.id !== commentId),
      }))
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 뒤로가기 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">밥약 상세</h1>
            </div>
            {/* 호스트만 볼 수 있는 편집/삭제 버튼들 */}
            {event.isUserHost && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 밥약 기본 정보 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* 밥약 제목 */}
                <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                {/* 위치 및 날짜/시간 정보 */}
                <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(event.datetime).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              {/* 참여 인원 정보 */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {event.currentParticipants}/{event.maxParticipants}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 밥약 상세 설명 */}
            <p className="text-foreground mb-4 leading-relaxed">{event.description}</p>

            {/* 레스토랑 정보 (있는 경우) */}
            {event.restaurant && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">레스토랑</span>
                <Badge variant="outline">{event.restaurant}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">참여 대상</span>
              <Badge
                variant={event.genderRestriction === "상관없음" ? "secondary" : "outline"}
                className={event.genderRestriction !== "상관없음" ? "border-primary text-primary" : ""}
              >
                {event.genderRestriction}
              </Badge>
            </div>

            {/* 태그들 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* 호스트 정보 (클릭 시 프로필로 이동) */}
            <div className="flex items-center space-x-3 mb-6">
              <Avatar
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/profile/${event.host.id}`)}
              >
                <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                <AvatarFallback>{event.host.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => router.push(`/profile/${event.host.id}`)}
                  >
                    {event.host.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    호스트
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                  <span>{event.host.rating}</span>
                  <span>({event.host.reviewCount}개 리뷰)</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 (참여하기, 참여 취소, 신청 관리 등) */}
            <div className="flex gap-3">
              {/* 참여 가능한 경우 참여하기 버튼 */}
              {!event.isUserHost && !event.isUserApplied && event.currentParticipants < event.maxParticipants && (
                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <UserPlus className="w-4 h-4 mr-2" />
                      참여하기
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>밥약 참여 신청</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">'{event.title}' 밥약에 참여하시겠습니까?</p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setShowApplyDialog(false)}
                        >
                          취소
                        </Button>
                        <Button className="flex-1" onClick={handleApply} disabled={isApplying}>
                          {isApplying ? "신청 중..." : "참여하기"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* 이미 참여 신청한 경우 참여 취소 버튼 */}
              {event.isUserApplied && (
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancelApplication}>
                  참여 취소
                </Button>
              )}

              {/* 참여 마감된 경우 */}
              {event.currentParticipants >= event.maxParticipants && !event.isUserApplied && (
                <Button disabled className="flex-1">
                  참여 마감
                </Button>
              )}

              {/* 호스트인 경우 신청 관리 버튼 */}
              {event.isUserHost && pendingApplicationsCount > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push(`/events/${params.eventId}/applications`)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  신청 관리 ({pendingApplicationsCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 참여자 목록 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">참여자 ({event.currentParticipants}명)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  {/* 참여자 아바타 (클릭 시 프로필로 이동) */}
                  <Avatar
                    className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/profile/${participant.id}`)}
                  >
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => router.push(`/profile/${participant.id}`)}
                      >
                        {participant.name}
                      </span>
                      {/* 호스트 표시 배지 */}
                      {participant.isHost && (
                        <Badge variant="secondary" className="text-xs">
                          호스트
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">댓글 ({event.comments.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 기존 댓글들 */}
              {event.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {/* 댓글 작성자 아바타 (클릭 시 프로필로 이동) */}
                  <Avatar
                    className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/profile/${comment.user.id || 1}`)}
                  >
                    <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/profile/${comment.user.id || 1}`)}
                        >
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      {/* 댓글 삭제 메뉴 (작성자 또는 호스트만 가능) */}
                      {(comment.user.name === "현재 사용자" || event.isUserHost) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive"
                            >
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              <Separator />

              {/* 새 댓글 작성 영역 */}
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>나</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="댓글을 작성해주세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                    댓글 작성
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
