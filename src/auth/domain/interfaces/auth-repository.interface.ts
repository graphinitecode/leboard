import type { LoginCommand, User } from '../user.entity'

export interface IAuthRepository {
  login(command: LoginCommand): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}