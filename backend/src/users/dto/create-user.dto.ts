export class CreateUserDto {
  name: string;
  password?: string;
  id?: number;
  profilePictureUrl?: string;
  token?: string;
  hashedToken?: string;
  tokenExpiry?: number;
}
