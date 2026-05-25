export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
}

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
