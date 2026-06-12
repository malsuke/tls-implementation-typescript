export enum ContentType {
  Invalid = 0,
  ChangeCipherSpec = 20,
  Alert = 21,
  Handshake = 22,
  ApplicationData = 23,
}

export enum TLSVersion {
  TLS_1_0 = 0x0301,
  TLS_1_1 = 0x0302,
  TLS_1_2 = 0x0303,
  TLS_1_3 = 0x0304,
}

export enum HandshakeType {
  ClientHello = 1,
  ServerHello = 2,
  NewSessionTicket = 4,
  EndOfEarlyData = 5,
  EncryptedExtensions = 8,
  Certificate = 11,
  CertificateRequest = 13,
  CertificateVerify = 15,
  Finished = 20,
  KeyUpdate = 24,
  MessageHash = 254,
}

export enum AlertLevel {
  Warning = 1,
  Fatal = 2,
}

export enum AlertDescription {
  CloseNotify = 0,
  UnexpectedMessage = 10,
  BadRecordMac = 20,
  RecordOverflow = 22,
  HandshakeFailure = 40,
  BadCertificate = 42,
  UnsupportedCertificate = 43,
  CertificateRevoked = 44,
  CertificateExpired = 45,
  CertificateUnknown = 46,
  IllegalParameter = 47,
  UnknownCa = 48,
  AccessDenied = 49,
  DecodeError = 50,
  DecryptError = 51,
  ProtocolVersion = 70,
  InsufficientSecurity = 71,
  InternalError = 80,
  InappropriateFallback = 86,
  UserCanceled = 90,
  MissingExtension = 109,
  UnsupportedExtension = 110,
  UnrecognizedName = 112,
  BadCertificateStatusResponse = 113,
  UnknownPskIdentity = 115,
  CertificateRequired = 116,
  NoApplicationProtocol = 120,
}

export enum ExtensionType {
  ServerName = 0,
  MaxFragmentLength = 1,
  StatusRequest = 5,
  SupportedGroups = 10,
  SignatureAlgorithms = 13,
  UseSrtp = 14,
  Heartbeat = 15,
  ApplicationLayerProtocolNegotiation = 16,
  SignedCertificateTimestamp = 18,
  ClientCertificateType = 19,
  ServerCertificateType = 20,
  Padding = 21,
  PreSharedKey = 41,
  EarlyData = 42,
  SupportedVersions = 43,
  Cookie = 44,
  PskKeyExchangeModes = 45,
  CertificateAuthorities = 47,
  OidFilters = 48,
  PostHandshakeAuth = 49,
  SignatureAlgorithmsCert = 50,
  KeyShare = 51,
}

export enum CipherSuite {
  TLS_AES_128_GCM_SHA256 = 0x1301,
  TLS_AES_256_GCM_SHA384 = 0x1302,
  TLS_CHACHA20_POLY1305_SHA256 = 0x1303,
  TLS_AES_128_CCM_SHA256 = 0x1304,
  TLS_AES_128_CCM_8_SHA256 = 0x1305,
}

export enum SignatureScheme {
  RSA_PKCS1_SHA256 = 0x0401,
  RSA_PKCS1_SHA384 = 0x0501,
  RSA_PKCS1_SHA512 = 0x0601,
  ECDSA_SECP256R1_SHA256 = 0x0403,
  ECDSA_SECP384R1_SHA384 = 0x0503,
  ECDSA_SECP521R1_SHA512 = 0x0603,
  RSA_PSS_RSAE_SHA256 = 0x0804,
  RSA_PSS_RSAE_SHA384 = 0x0805,
  RSA_PSS_RSAE_SHA512 = 0x0806,
  ED25519 = 0x0807,
  ED448 = 0x0808,
  RSA_PSS_PSS_SHA256 = 0x0809,
  RSA_PSS_PSS_SHA384 = 0x080a,
  RSA_PSS_PSS_SHA512 = 0x080b,
}

export enum CurveID {
  SECP256R1 = 0x0017, // P-256
  SECP384R1 = 0x0018, // P-384
  SECP521R1 = 0x0019, // P-521
  X25519 = 0x001d,
  X448 = 0x001e,
}
