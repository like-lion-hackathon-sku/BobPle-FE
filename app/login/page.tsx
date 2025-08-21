"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { apiFetch } from "@/shared/api/client";
import { getMyProfile, putMyProfile } from "@/features/auth/auth.repository";

import { auth, googleProvider } from "@/shared/lib/firebase";
import { signInWithPopup } from "firebase/auth";

/**
 * 로그인 페이지 (Google 전용)
 * - Google로 로그인 → Firebase ID Token 획득 → 백엔드 /api/auth/login 에 { idToken } 전달
 * - 백엔드 응답에 isCompleted === false 이면 프로필 설정 모달 오픈
 * - 그렇지 않으면 next(기본 "/")로 이동
 */
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);


  function mapGenderToCode(g: string): 'M' | 'F' | null {
  if (g === '남성') return 'M';
  if (g === '여성') return 'F';
  return null;
}
function mapGradeToNumber(gr: string): number | null {
  const m = gr.match(/^(\d)/);
  return m ? Number(m[1]) : null;
}
  /** Google 로그인 → idToken → 백엔드 세션 교환 */
  const handleLoginWithGoogle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrMsg(null);

    try {
      // 1) 구글 팝업 로그인
      const cred = await signInWithPopup(auth, googleProvider);

      // 2) Firebase ID Token 발급
      const idToken = await cred.user.getIdToken(true);

      // 3) 백엔드 세션 교환 (명세서: /api/auth/login, body: { idToken })
      //    apiFetch는 !ok 시 에러 throw 하도록 가정
      const res = await apiFetch<{ isCompleted?: boolean }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      // 4) 프로필 완성 여부 판단
      //    4-1) 백엔드가 명시적으로 isCompleted를 주면 그것을 우선 사용
      if (res && res.isCompleted === false) {
        setShowProfileSetup(true);
        return;
      }

      //    4-2) 응답에 없으면 내 프로필 조회해서 판단 (grade/gender 또는 is_completed 필드)
      try {
        const me = await getMyProfile(); // UserProfile | null

        if (!me) {
        // 프로필이 없거나 404 → 미완성으로 간주
          setShowProfileSetup(true);
          return;
        }

        const notCompleted = (me as any).is_completed === false ||
        me.isCompleted === false ||
        me.grade == null ||
        me.gender == null;

if (notCompleted) {
  setShowProfileSetup(true);
  return;
}
      } catch {
        // 프로필 조회 실패 시엔 보수적으로 설정 모달 오픈
        setShowProfileSetup(true);
        return;
    }
// (수정본) ⛔️ 임시: 프로필 API 실패 시엔 모달 띄우지 말고 그냥 통과
/*try {
  const me = await getMyProfile().catch(() => null); // 실패하면 null

  // me가 있을 때만 '미완료' 판정. (없으면 통과)
  const notCompleted =
    !!me &&
    ( (me as any).is_completed === false ||
      (me as any).isCompleted === false ||
      me.grade == null ||
      me.gender == null );

  if (notCompleted) {
    setShowProfileSetup(true);   // 프로필은 받았지만 미완료면 모달
    return;
  }
} catch {
  // 어떤 에러든 임시는 그냥 통과 (모달 X)
}*/

      // 5) 모두 완료면 next로
      router.replace(next);
    } catch (e: any) {
      setErrMsg(e?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 초기 프로필 설정 저장 */
  // page.tsx 내부

// 문자열 → 코드/숫자로 매핑


const handleProfileSetup = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isProfileLoading) return;

  // 1) 클라이언트 검증 (필요 시 메시지)
  const gradeNum = mapGradeToNumber(grade);
  const genderCode = mapGenderToCode(gender);
  if (gradeNum == null || genderCode == null) {
    setErrMsg('학년/성별을 모두 선택해주세요.');
    return;
  }

  setIsProfileLoading(true);
  setErrMsg(null);

  try {
    // 2) 백엔드 스키마 양쪽 모두 커버
    const payload = {
      grade: gradeNum,            // number
      gender: genderCode,         // 'M' | 'F'
      isCompleted: true,          // camelCase
      is_completed: true,         // snake_case (둘 다 보내서 커버)
    };

    await putMyProfile(payload);  // repository가 JSON으로 전송하도록 구현돼 있어야 함

    setShowProfileSetup(false);
    router.replace(next);
  } catch (err: any) {
    // 서버가 validation 에러(400/422) 주면 메시지 표시
    setErrMsg(err?.message || '프로필 저장에 실패했습니다.');
  } finally {
    setIsProfileLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/bobple-mascot.png" alt="밥플 마스코트" className="w-20 h-20 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">밥플</h1>
          <p className="text-muted-foreground">새로운 사람들과 함께하는 식사</p>
        </div>

        {/* 로그인 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errMsg && <p className="text-sm text-red-500">{errMsg}</p>}
              <Button
                type="button"
                className="w-full"
                variant="default"
                onClick={handleLoginWithGoogle}
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "Google로 계속하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            로그인하면 밥플의 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>

      {/* 프로필 초기 설정 모달 */}
      <Dialog open={showProfileSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">프로필 설정</DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              밥플 이용을 위해 기본 정보를 입력해주세요
            </p>
          </DialogHeader>

          <form onSubmit={handleProfileSetup} className="space-y-4 mt-4">
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

            {errMsg && <p className="text-sm text-red-500">{errMsg}</p>}

            <Button type="submit" className="w-full mt-6" disabled={isProfileLoading}>
              {isProfileLoading ? "설정 중..." : "완료"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}