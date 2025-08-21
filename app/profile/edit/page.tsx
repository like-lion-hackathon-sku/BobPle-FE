"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "김민수",
    email: "minsu@example.com",
    bio: "맛있는 음식과 새로운 사람들과의 만남을 좋아합니다.",
    statusMessage: "오늘도 맛있는 하루 보내세요! 🍽️",
    location: "서울 강남구",
    avatar: "/placeholder.svg?height=120&width=120",
    grade: "3학년",
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          avatar: event.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock API call - replace with actual API call to PUT /api/profile/
      console.log("Updating profile:", formData)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/profile")
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">프로필 수정</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">{formData.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    사진 변경
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG 파일만 업로드 가능</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="statusMessage">상태메시지</Label>
                <Input
                  id="statusMessage"
                  placeholder="지금 기분이나 상태를 알려주세요"
                  value={formData.statusMessage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, statusMessage: e.target.value }))}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.statusMessage.length}/50자</p>
              </div>

              <div>
                <Label htmlFor="location">지역</Label>
                <Input
                  id="location"
                  placeholder="예: 서울 강남구"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="grade">학년</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, grade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                    <SelectItem value="4학년">4학년</SelectItem>
                    <SelectItem value="대학원생">대학원생</SelectItem>
                    <SelectItem value="졸업생">졸업생</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  placeholder="자신을 소개해주세요"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.name || !formData.email}>
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
