# 배포 가이드

XRPL Server를 Vercel에 배포하는 방법을 설명합니다.

## 1. Vercel CLI 설치

```bash
npm install -g vercel
```

## 2. Vercel 로그인

```bash
vercel login
```

## 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

### 필수 환경 변수
- `XRPL_NETWORK`: XRPL 네트워크 URL (기본값: wss://s.devnet.rippletest.net:51233)
- `ADMIN_SEED`: 관리자 지갑 시드
- `USER_SEED`: 사용자 지갑 시드
- `USER2_SEED`: 두 번째 사용자 지갑 시드

### Vercel 대시보드에서 설정하는 방법
1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. Settings > Environment Variables
4. 각 환경 변수 추가

## 4. 배포

### 개발 환경 배포
```bash
vercel
```

### 프로덕션 배포
```bash
vercel --prod
```

## 5. 배포 확인

배포가 완료되면 다음 URL로 헬스체크를 수행하세요:

```bash
curl https://your-app-name.vercel.app/api/health
```

## 6. 도메인 설정 (선택사항)

Vercel 대시보드에서 커스텀 도메인을 설정할 수 있습니다:

1. 프로젝트 설정 > Domains
2. 원하는 도메인 추가
3. DNS 설정 업데이트

## 7. 모니터링

Vercel 대시보드에서 다음을 모니터링할 수 있습니다:

- 함수 실행 시간
- 에러 로그
- 트래픽 통계
- 환경 변수 상태

## 8. 트러블슈팅

### 일반적인 문제들

#### 환경 변수 누락
```
Error: Missing env: ADMIN_SEED, USER_SEED
```
**해결방법**: Vercel 대시보드에서 환경 변수를 확인하고 설정하세요.

#### XRPL 연결 실패
```
Error: Connection failed
```
**해결방법**: 
- XRPL_NETWORK 환경 변수가 올바른지 확인
- 네트워크 상태 확인
- 방화벽 설정 확인

#### 함수 타임아웃
```
Error: Function timeout
```
**해결방법**: 
- vercel.json에서 maxDuration 설정 확인
- 트랜잭션 복잡도 줄이기
- 네트워크 상태 확인

### 로그 확인

Vercel 대시보드 > Functions > View Function Logs에서 상세한 로그를 확인할 수 있습니다.

## 9. 보안 고려사항

### 환경 변수 보안
- 절대 지갑 시드를 코드에 하드코딩하지 마세요
- 프로덕션과 개발 환경의 시드를 분리하세요
- 정기적으로 시드를 로테이션하세요

### API 보안
- CORS 설정을 프로덕션 환경에 맞게 조정하세요
- Rate limiting을 고려하세요
- API 키 인증을 추가하는 것을 고려하세요

## 10. 성능 최적화

### XRPL 클라이언트 재사용
- 클라이언트 연결을 재사용하여 성능을 향상시킵니다
- 연결 풀링을 고려하세요

### 캐싱
- 자주 조회되는 데이터에 대한 캐싱을 고려하세요
- Redis나 메모리 캐시를 사용할 수 있습니다

### 모니터링
- 응답 시간을 모니터링하세요
- 에러율을 추적하세요
- 사용량 패턴을 분석하세요
