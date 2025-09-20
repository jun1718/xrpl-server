# XRPL Server

XRPL Server는 XRP Ledger의 Payment, Credentials, PermissionedDomains 기능을 제공하는 REST API 서버입니다.

## 기능

- **Payment**: XRP 및 IOU 토큰 전송
- **Credentials**: 자격증명 생성, 수락, 조회, 삭제
- **PermissionedDomains**: 권한 도메인 생성, 삭제, 조회

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Vercel Functions
- **Language**: TypeScript
- **XRPL Library**: xrpl.js
- **Deployment**: Vercel

## 프로젝트 구조

```
xrpl-server/
├── api/                    # API 엔드포인트
│   ├── payment/           # 결제 관련 API
│   ├── credential/        # 자격증명 관련 API
│   └── domain/           # 도메인 관련 API
├── lib/                   # 공통 유틸리티
├── types/                 # TypeScript 타입 정의
├── docs/                  # API 문서
├── xrpl-refference/       # 참고 구현체
└── package.json
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
```

`.env` 파일을 편집하여 필요한 환경 변수를 설정하세요:
```env
XRPL_NETWORK=wss://s.devnet.rippletest.net:51233
ADMIN_SEED=your_admin_seed_here
USER_SEED=your_user_seed_here
USER2_SEED=your_user2_seed_here
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
```

### 4. Vercel에 배포
```bash
npm run deploy
```

## API 사용법

### Payment API

#### XRP 전송
```bash
curl -X POST https://your-app.vercel.app/api/payment/send-xrp \
  -H "Content-Type: application/json" \
  -d '{
    "fromSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
    "toAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "amount": "1000000"
  }'
```

#### IOU 토큰 전송
```bash
curl -X POST https://your-app.vercel.app/api/payment/send-iou \
  -H "Content-Type: application/json" \
  -d '{
    "fromSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
    "toAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "amount": "100",
    "currency": "XYZ",
    "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
  }'
```

### Credential API

#### 자격증명 생성
```bash
curl -X POST https://your-app.vercel.app/api/credential/create \
  -H "Content-Type: application/json" \
  -d '{
    "issuerSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
    "subjectAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "credentialType": "KYC"
  }'
```

#### 자격증명 조회
```bash
curl -X GET "https://your-app.vercel.app/api/credential/check?userSeed=sEd7rBGm5kxzauRTAV2hbsNz7N45X91"
```

### Domain API

#### 도메인 생성
```bash
curl -X POST https://your-app.vercel.app/api/domain/create \
  -H "Content-Type: application/json" \
  -d '{
    "adminSeed": "sEd7rBGm5kxzauRTAV2hbsNz7N45X91",
    "acceptedCredentials": [
      {
        "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
        "credentialType": "KYC"
      }
    ]
  }'
```

## API 문서

자세한 API 문서는 [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)를 참조하세요.

## 보안 주의사항

- **절대 지갑 시드를 클라이언트에 노출하지 마세요**
- 프로덕션 환경에서는 HTTPS를 사용하세요
- 환경 변수를 안전하게 관리하세요
- 테스트넷을 사용하고 있으므로 실제 자산이 아닙니다

## 라이선스

MIT License

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
# xrpl-server
