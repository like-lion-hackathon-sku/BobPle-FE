"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, CheckCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useNotifications } from "@/components/notification-context"

const mockParticipants = [
  {
    id: 1,
    name: "김민수",
    avatar: "/placeholder.svg?height=40&width=40",
    isHost: true,
  },
  {
    id: 3,
    name: "박준호",
    avatar: "/placeholder.svg?height=40&width=40",
    isHost: false,
  },
]

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const { notifications, deleteNotification } = useNotifications()
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleRatingChange = (userId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], rating },
    }))
  }

  const handleCommentChange = (userId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], comment },
    }))
  }

  const handleSubmitReviews = async () => {
    setIsSubmitting(true)
    try {
      // Mock API call - replace with actual API call to POST /api/reviews/{userId}
      console.log("Submitting reviews:", reviews)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const reviewNotifications = notifications.filter(
        (notif) => notif.type === "review_request" && notif.actionData?.eventId === params.eventId,
      )
      reviewNotifications.forEach((notif) => deleteNotification(notif.id))

      setIsCompleted(true)
    } catch (error) {
      console.error("Failed to submit reviews:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = mockParticipants.every((participant) => reviews[participant.id]?.rating > 0)

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">리뷰 완료</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">리뷰가 완료되었습니다!</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              소중한 리뷰를 작성해주셔서 감사합니다. 여러분의 피드백이 더 나은 밥약 문화를 만들어갑니다.
            </p>
            <div className="space-y-3 w-full max-w-sm">
              <Button onClick={() => router.push("/")} className="w-full">
                홈으로 돌아가기
              </Button>
              <Button variant="outline" onClick={() => router.push("/profile")} className="w-full bg-transparent">
                내 프로필 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">리뷰 작성</h1>
              <p className="text-sm text-muted-foreground">함께한 참여자들에 대한 리뷰를 작성해주세요</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {mockParticipants.map((participant) => (
            <Card key={participant.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{participant.name}</CardTitle>
                    {participant.isHost && <p className="text-sm text-muted-foreground">호스트</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">평점</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(participant.id.toString(), star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              (reviews[participant.id]?.rating || 0) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {reviews[participant.id]?.rating > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviews[participant.id].rating === 5
                          ? "최고예요!"
                          : reviews[participant.id].rating === 4
                            ? "좋아요!"
                            : reviews[participant.id].rating === 3
                              ? "보통이에요"
                              : reviews[participant.id].rating === 2
                                ? "아쉬워요"
                                : "별로예요"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">리뷰 (선택사항)</label>
                    <Textarea
                      placeholder="함께한 경험에 대해 간단히 작성해주세요..."
                      value={reviews[participant.id]?.comment || ""}
                      onChange={(e) => handleCommentChange(participant.id.toString(), e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/")}>
            나중에 작성
          </Button>
          <Button className="flex-1" onClick={handleSubmitReviews} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "제출 중..." : "리뷰 제출"}
          </Button>
        </div>

        {!canSubmit && (
          <p className="text-center text-sm text-muted-foreground mt-4">모든 참여자에 대한 평점을 선택해주세요</p>
        )}
      </div>
    </div>
  )
}
