import fs from "node:fs";
import * as jose from "jose";

// 준비값
const TEAM_ID = "3LC3JLJW6J5"; // Apple Developer Team ID
const KEY_ID = "649FMB52W5"; // .p8의 Key ID
const SERVICE_ID = "dr-abba.com"; // Apple Service ID Identifier
const P8_PATH = "./AuthKey_649FMB52W5.p8"; // 다운받은 .p8 경로

async function generateAppleSecret() {
  try {
    // .p8 파일 읽기
    const privateKey = await jose.importPKCS8(
      fs.readFileSync(P8_PATH, "utf8"),
      "ES256"
    );

    // JWT 페이로드 생성
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: TEAM_ID,
      iat: now,
      exp: now + 60 * 60 * 24 * 180, // 최대 6개월(예시)
      aud: "https://appleid.apple.com",
      sub: SERVICE_ID,
    };

    // JWT 토큰 생성
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "ES256", kid: KEY_ID })
      .sign(privateKey);

    console.log("🍎 Apple Secret Key 생성 완료!");
    console.log("=".repeat(50));
    console.log(jwt);
    console.log("=".repeat(50));
    console.log(
      "📋 이 값을 Supabase Dashboard의 Apple Provider Secret Key 필드에 복사하세요!"
    );
  } catch (error) {
    console.error("❌ Apple Secret Key 생성 실패:", error);
    console.log("\n🔍 확인사항:");
    console.log("1. .p8 파일이 올바른 경로에 있는지 확인");
    console.log("2. TEAM_ID, KEY_ID, SERVICE_ID 값이 올바른지 확인");
    console.log("3. .p8 파일이 유효한지 확인");
  }
}

// 스크립트 실행
generateAppleSecret();
