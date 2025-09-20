export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaymentRequest {
  fromSeed: string;
  toAddress: string;
  amount: string;
  currency?: string;
  issuer?: string;
}

export interface CredentialRequest {
  issuerSeed: string;
  subjectAddress: string;
  credentialType: string;
  expiration?: number;
  uri?: string;
}

export interface CredentialAcceptRequest {
  subjectSeed: string;
  issuerAddress: string;
  credentialType: string;
}

export interface CredentialDeleteRequest {
  subjectSeed: string;
  issuerAddress: string;
  credentialType: string;
}

export interface DomainCreateRequest {
  adminSeed: string;
  acceptedCredentials: Array<{
    issuer: string;
    credentialType: string;
  }>;
}

export interface DomainDeleteRequest {
  adminSeed: string;
  domainId: string;
}

export interface DomainInspectRequest {
  domainId: string;
}
