export interface JwtPayloadUser {
  id: number;
  email: string;
  isAdmin: boolean;
  deviceId?: string;
}
