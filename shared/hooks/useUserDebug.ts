import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface UserDebugInfo {
  id: string;
  email: string;
  display_name?: string;
  provider?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export function useUserDebug() {
  const [userInfo, setUserInfo] = useState<UserDebugInfo | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log("❌ 세션 조회 실패:", error.message);
          setUserInfo(null);
        } else if (session?.user) {
          const debugInfo: UserDebugInfo = {
            id: session.user.id,
            email: session.user.email || "",
            display_name: session.user.user_metadata?.display_name,
            provider: session.user.app_metadata?.provider,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at,
          };

          console.log("✅ 현재 로그인된 사용자:", debugInfo);
          setUserInfo(debugInfo);
        } else {
          console.log("ℹ️ 로그인된 사용자가 없습니다");
          setUserInfo(null);
        }
      } catch (err) {
        console.error("사용자 정보 조회 중 오류:", err);
        setUserInfo(null);
      }
    };

    checkUser();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "🔐 인증 상태 변화:",
        event,
        session?.user?.email || "로그아웃"
      );
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userInfo };
}
