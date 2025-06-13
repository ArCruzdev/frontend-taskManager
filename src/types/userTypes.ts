export interface UserDto {
  id: string; // Guid en C#
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string; // string que representa el rol
  isActive: boolean;
}
