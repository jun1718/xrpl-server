# XRPL Server API Documentation

XRPL Server는 XRP Ledger의 Payment, Credentials, PermissionedDomains 기능을 제공하는 REST API 서버입니다.

## Base URL
```
https://your-vercel-app.vercel.app/api
```

## Health Check

### 서버 상태 확인
**GET** `/health`

서버와 XRPL 네트워크 연결 상태를 확인합니다.

#### 응답
```json
{
    "success": true,
    "data": {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "xrpl": {
            "connected": true,
            "network": "wss://s.devnet.rippletest.net:51233",
            "serverInfo": { ... }
        },
        "version": "1.0.0"
    },
    "message": "Server is healthy"
}
```

## 공통 응답 형식

모든 API는 다음 형식으로 응답합니다:

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional context"
}
```

## Wallet APIs

### 1. 새 지갑 생성
**POST** `/api/wallet/create`

새로운 XRPL 지갑을 생성합니다.

#### 요청 본문
```json
{}
```

#### 응답
```json
{
  "success": true,
  "data": {
    "address": "rJZdUusLDtY9NEsGea7ijqhVrXv98rYBYN",
    "seed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91...",
    "publicKey": "03B4A3E3E5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A",
    "status": "success"
  },
  "message": "New wallet has been created successfully"
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": "Failed to create new wallet: ...",
  "message": "Failed to create new wallet: ...",
  "status": 500,
  "timestamp": "2025-09-20T16:00:00.000Z",
  "path": "/api/wallet/create"
}
```

## Faucet APIs

### 1. 모든 지갑에 테스트 XRP 추가
**POST** `/api/faucet`

환경 변수에 설정된 모든 지갑(ADMIN_SEED, USER_SEED, USER2_SEED)에 테스트 XRP를 추가합니다.

#### 요청 본문
```json
{}
```

#### 응답
```json
{
  "success": true,
  "message": "Faucet completed successfully. Test XRP has been added to all configured wallets."
}
```

### 2. 개별 지갑에 테스트 XRP 추가
**POST** `/api/faucet/wallet`

특정 지갑에 테스트 XRP를 추가합니다.

#### 요청 본문
```json
{
  "walletSeed": "string (required) - 지갑 시드"
}
```

#### 예시
```json
{
  "walletSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91"
}
```

#### 응답
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "message": "Test XRP has been added to the wallet"
  }
}
```

## Payment APIs

### 1. XRP 전송
**POST** `/payment/send-xrp`

XRP를 전송합니다.

#### 요청 본문
```json
{
  "fromSeed": "string (required) - 발신자 지갑 시드",
  "toAddress": "string (required) - 수신자 주소",
  "amount": "string (required) - 전송할 XRP 양 (드롭 단위)"
}
```

#### 예시
```json
{
  "fromSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
  "toAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "amount": "1000000"
}
```

#### 응답
```json
{
  "success": true,
  "data": {
    "result": {
      "hash": "transaction_hash",
      "meta": { ... }
    }
  },
  "message": "XRP payment successful"
}
```

### 2. IOU 토큰 전송
**POST** `/payment/send-iou`

IOU 토큰을 전송합니다.

#### 요청 본문
```json
{
  "fromSeed": "string (required) - 발신자 지갑 시드",
  "toAddress": "string (required) - 수신자 주소",
  "amount": "string (required) - 전송할 토큰 양",
  "currency": "string (required) - 토큰 코드",
  "issuer": "string (required) - 토큰 발행자 주소"
}
```

#### 예시
```json
{
  "fromSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
  "toAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "amount": "100",
  "currency": "XYZ",
  "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
}
```

## Credential APIs

### 1. 자격증명 생성
**POST** `/credential/create`

새로운 자격증명을 생성합니다.

#### 요청 본문
```json
{
  "issuerSeed": "string (required) - 발급자 지갑 시드",
  "subjectAddress": "string (required) - 피발급자 주소",
  "credentialType": "string (required) - 자격증명 타입 (예: KYC)",
  "expirationSeconds": "number (optional) - 만료 시간 (Unix timestamp, 기본값: 1시간 후)",
  "uri": "string (optional) - 자격증명 URI"
}
```

#### 예시
```json
{
  "issuerSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
  "subjectAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "credentialType": "KYC",
  "expiration": 1704067200,
  "uri": "https://example.com/credentials/kyc/user"
}
```

### 2. 자격증명 수락
**POST** `/credential/accept`

자격증명을 수락합니다.

#### 요청 본문
```json
{
  "subjectSeed": "string (required) - 피발급자 지갑 시드",
  "issuerAddress": "string (required) - 발급자 주소",
  "credentialType": "string (required) - 자격증명 타입"
}
```

### 3. 자격증명 조회
**GET** `/credential/check?userSeed=...`
**POST** `/credential/check`

사용자의 자격증명을 조회합니다.

#### GET 요청
- Query Parameter: `userSeed` (지갑 시드)

#### POST 요청 본문
```json
{
  "userSeed": "string (required) - 사용자 지갑 시드"
}
```

### 4. 자격증명 삭제
**POST** `/credential/delete`

자격증명을 삭제합니다.

#### 요청 본문
```json
{
  "subjectSeed": "string (required) - 피발급자 지갑 시드",
  "issuerAddress": "string (required) - 발급자 주소",
  "credentialType": "string (required) - 자격증명 타입"
}
```

## PermissionedDomain APIs

### 1. 도메인 생성
**POST** `/domain/create`

새로운 권한 도메인을 생성합니다.

#### 요청 본문
```json
{
  "adminSeed": "string (required) - 관리자 지갑 시드",
  "acceptedCredentials": [
    {
      "issuer": "string (required) - 발급자 주소",
      "credentialType": "string (required) - 자격증명 타입"
    }
  ]
}
```

#### 예시
```json
{
  "adminSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
  "acceptedCredentials": [
    {
      "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      "credentialType": "KYC"
    }
  ]
}
```

#### 응답
```json
{
  "success": true,
  "data": {
    "result": { ... },
    "domainId": "생성된_도메인_ID"
  },
  "message": "Domain created successfully"
}
```

### 2. 도메인 삭제
**POST** `/domain/delete`

권한 도메인을 삭제합니다.

#### 요청 본문
```json
{
  "adminSeed": "string (required) - 관리자 지갑 시드",
  "domainId": "string (required) - 삭제할 도메인 ID"
}
```

### 3. 도메인 정보 조회
**GET** `/domain/inspect?domainId=...`
**POST** `/domain/inspect`

도메인 정보를 조회합니다.

#### GET 요청
- Query Parameter: `domainId` (도메인 ID)

#### POST 요청 본문
```json
{
    "domainId": "string (required) - 조회할 도메인 ID"
}
```

## 에러 코드

| HTTP 상태 코드 | 설명 |
|---------------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (필수 필드 누락, 잘못된 형식) |
| 405 | 허용되지 않는 HTTP 메서드 |
| 500 | 서버 내부 오류 |

## 환경 변수

다음 환경 변수들을 설정해야 합니다:

```env
XRPL_NETWORK=wss://s.devnet.rippletest.net:51233
ADMIN_SEED=your_admin_seed_here
USER_SEED=your_user_seed_here
USER2_SEED=your_user2_seed_here
```

## 배포

이 서버는 Vercel에 배포됩니다:

1. Vercel CLI 설치: `npm i -g vercel`
2. 로그인: `vercel login`
3. 배포: `vercel --prod`

## 주의사항

- 모든 API는 CORS를 지원합니다
- 지갑 시드는 절대 클라이언트에 노출하지 마세요
- 테스트넷을 사용하고 있으므로 실제 자산이 아닙니다
- 트랜잭션 수수료는 자동으로 계산됩니다
