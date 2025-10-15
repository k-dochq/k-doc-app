/**
 * 버전 비교 유틸리티 함수
 * semantic versioning 형식의 버전 문자열을 비교
 */

/**
 * 두 버전 문자열을 비교하는 함수
 * @param versionA - 첫 번째 버전 문자열 (예: "1.2.3")
 * @param versionB - 두 번째 버전 문자열 (예: "1.2.4")
 * @returns 1: versionA가 더 높음, -1: versionB가 더 높음, 0: 동일
 */
export const compareVersions = (versionA: string, versionB: string): number => {
  const A = versionA.split(".").map(Number);
  const B = versionB.split(".").map(Number);

  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const x = A[i] ?? 0;
    const y = B[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }

  return 0;
};

/**
 * 현재 버전이 최소 지원 버전보다 낮은지 확인
 * @param currentVersion - 현재 앱 버전
 * @param minSupportedVersion - 최소 지원 버전
 * @returns 업데이트가 필요한지 여부
 */
export const isUpdateRequired = (
  currentVersion: string,
  minSupportedVersion: string
): boolean => {
  return compareVersions(currentVersion, minSupportedVersion) < 0;
};

/**
 * 현재 버전이 최신 버전보다 낮은지 확인
 * @param currentVersion - 현재 앱 버전
 * @param latestVersion - 최신 버전
 * @returns 업데이트가 권장되는지 여부
 */
export const isUpdateRecommended = (
  currentVersion: string,
  latestVersion: string
): boolean => {
  return compareVersions(currentVersion, latestVersion) < 0;
};
