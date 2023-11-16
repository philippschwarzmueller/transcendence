export class CreateUserDto {
  name: string;
  intraname: string;
  password?: string;
  id?: number;
  profilePictureUrl?: string;
  token?: string;
  hashedToken?: string;
  tokenExpiry?: number;
  twoFAenabled: boolean;
  twoFAsecret?: string;
  tempTwoFAsecret?: string;
}
