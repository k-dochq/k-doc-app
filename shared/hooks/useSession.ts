// useSession.ts
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * 세션 상태를 관리하는 훅
 * 앱 시작 시 현재 세션을 로드하고, 이후 변화를 구독합니다.
 * 세션 상태는 직접 관리하지 않고 Supabase의 내장 세션 관리 기능을 사용합니다.
 */
export function useSession() {
  useEffect(() => {
    let isMounted = true;

    (async () => {
      // 초기 세션 1회 로드
      const { data } = await supabase.auth.getSession();
      if (isMounted && data.session) {
        // Supabase의 내장 세션 관리 사용
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    })();

    // 세션 변화 구독
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED 등 모든 변화에 대응
        if (nextSession) {
          await supabase.auth.setSession({
            access_token: nextSession.access_token,
            refresh_token: nextSession.refresh_token,
          });
        }
      }
    );

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe(); // 정리
    };
  }, []);
}
