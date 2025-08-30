export interface LoginModel {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: Date;
  name: string;
  userId: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
}
