"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

/**
 * 로그인 페이지 컴포넌트
 * 사용자 인증을 위한 로그인 폼을 제공
 */
export default function LoginPage() {
  const [email, setEmail] = useState("") // 이메일 입력 상태
  const [password, setPassword] = useState("") // 비밀번호 입력 상태
  const [isLoading, setIsLoading] = useState(false) // 로딩 상태
  const [showProfileSetup, setShowProfileSetup] = useState(false) // 프로필 설정 모달 표시 상태
  const [grade, setGrade] = useState("") // 학년 선택 상태
  const [gender, setGender] = useState("") // 성별 선택 상태
  const [isProfileLoading, setIsProfileLoading] = useState(false) // 프로필 저장 로딩 상태
  const [error, setError] = useState("")
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터

  /**
   * 로그인 폼 제출 처리 함수
   * 실제 API를 호출하여 사용자 인증 처리
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authAPI.login(email, password)

      if (response.success) {
        // 로그인 성공 시 localStorage에 상태 저장
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userEmail", email)

        // 프로필 정보 확인
        try {
          const profileResponse = await authAPI.getProfile()
          if (profileResponse.success && profileResponse.profile) {
            // 프로필 정보가 있으면 바로 메인 페이지로 이동
            router.push("/")
          } else {
            // 프로필 정보가 없으면 초기 설정 모달 표시
            setShowProfileSetup(true)
          }
        } catch (profileError) {
          // 프로필 조회 실패 시 초기 설정 모달 표시
          setShowProfileSetup(true)
        }
      }
    } catch (error) {
      console.error("로그인 실패:", error)
      setError(error instanceof Error ? error.message : "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 초기 프로필 설정 완료 처리 함수
   * 학년과 성별 정보를 서버에 저장하고 메인 페이지로 이동
   */
  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileLoading(true)
    setError("")

    try {
      const profileData = {
        grade,
        gender,
      }

      const response = await authAPI.updateProfile(profileData)

      if (response.success) {
        setShowProfileSetup(false)
        // 메인 페이지로 리다이렉트
        router.push("/")
      }
    } catch (error) {
      console.error("프로필 설정 실패:", error)
      setError(error instanceof Error ? error.message : "프로필 설정에 실패했습니다.")
    } finally {
      setIsProfileLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 브랜딩 섹션 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-20 h-20 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">밥플</h1>
          <p className="text-muted-foreground">새로운 사람들과 함께하는 식사</p>
        </div>

        {/* 로그인 폼 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              {/* 이메일 입력 필드 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 비밀번호 입력 필드 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* 로그인 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 소셜 로그인 옵션 (향후 확장용) */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            로그인하면 밥플의 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>

      <Dialog open={showProfileSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">프로필 설정</DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">밥플 이용을 위해 기본 정보를 입력해주세요</p>
          </DialogHeader>

          <form onSubmit={handleProfileSetup} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* 학년 선택 */}
            <div className="space-y-2">
              <Label>학년</Label>
              <Select value={grade} onValueChange={setGrade} required>
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

            {/* 성별 선택 */}
            <div className="space-y-2">
              <Label>성별</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="남성">남성</SelectItem>
                  <SelectItem value="여성">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 완료 버튼 */}
            <Button type="submit" className="w-full mt-6" disabled={isProfileLoading}>
              {isProfileLoading ? "설정 중..." : "완료"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
