export type { User, UserRole, LoginCommand } from './domain/user.entity'
export type { IAuthRepository } from './domain/interfaces/auth-repository.interface'

export { loginProfHandler } from './application/commands/login-prof/login-prof.handler'
export { loginParentHandler } from './application/commands/login-parent/login-parent.handler'
export { logoutHandler } from './application/commands/logout/logout.handler'
export { getCurrentUserHandler } from './application/queries/get-current-user/get-current-user.handler'
export {
  useLoginProf,
  useLoginParent,
  useLogout,
  useGetCurrentUser,
  prefetchCurrentUser,
  CURRENT_USER_QUERY_KEY,
} from './application/auth.hooks'

export { userRepository } from './infrastructure/user.repository'

export type { UserViewModel } from './presentation/user.presenter'
export { presentUser } from './presentation/user.presenter'
export { useAuthStore } from './presentation/store/auth.store'
export { AuthHydrator } from './presentation/components/AuthHydrator'
export { LoginForm } from './presentation/components/organisms/LoginForm'