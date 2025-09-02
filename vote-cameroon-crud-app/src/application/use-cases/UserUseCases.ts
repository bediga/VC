// Use Cases - Business Logic Implementation
import { User, UserRole, UserBusinessRules } from '../../domain/entities';
import { UserRepository, CreateUserData, UpdateUserData } from '../../domain/repositories';
import { Result, Either, left, right } from '../../shared/Result';

export interface UserUseCases {
  getAllUsers(): Promise<Either<Error, User[]>>;
  getUserById(id: string): Promise<Either<Error, User>>;
  createUser(userData: CreateUserData): Promise<Either<Error, User>>;
  updateUser(id: string, userData: UpdateUserData): Promise<Either<Error, User>>;
  deleteUser(currentUserRole: UserRole, targetUserId: string): Promise<Either<Error, void>>;
  getUsersByRole(role: UserRole): Promise<Either<Error, User[]>>;
}

export class UserUseCasesImpl implements UserUseCases {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<Either<Error, User[]>> {
    try {
      const users = await this.userRepository.findAll();
      return right(users);
    } catch (error) {
      return left(new Error(`Failed to fetch users: ${error}`));
    }
  }

  async getUserById(id: string): Promise<Either<Error, User>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return left(new Error('User not found'));
      }
      return right(user);
    } catch (error) {
      return left(new Error(`Failed to fetch user: ${error}`));
    }
  }

  async createUser(userData: CreateUserData): Promise<Either<Error, User>> {
    try {
      // Business rule: Check if email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return left(new Error('Email already exists'));
      }

      const user = await this.userRepository.create(userData);
      return right(user);
    } catch (error) {
      return left(new Error(`Failed to create user: ${error}`));
    }
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<Either<Error, User>> {
    try {
      // Business rule: Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return left(new Error('User not found'));
      }

      // Business rule: Check email uniqueness if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.userRepository.findByEmail(userData.email);
        if (emailExists) {
          return left(new Error('Email already exists'));
        }
      }

      const updatedUser = await this.userRepository.update(id, userData);
      return right(updatedUser);
    } catch (error) {
      return left(new Error(`Failed to update user: ${error}`));
    }
  }

  async deleteUser(currentUserRole: UserRole, targetUserId: string): Promise<Either<Error, void>> {
    try {
      const targetUser = await this.userRepository.findById(targetUserId);
      if (!targetUser) {
        return left(new Error('User not found'));
      }

      // Business rule: Check if current user can delete target user
      if (!UserBusinessRules.canDeleteUser(currentUserRole, targetUser.role as UserRole)) {
        return left(new Error('Insufficient permissions to delete this user'));
      }

      await this.userRepository.delete(targetUserId);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete user: ${error}`));
    }
  }

  async getUsersByRole(role: UserRole): Promise<Either<Error, User[]>> {
    try {
      const users = await this.userRepository.findByRole(role);
      return right(users);
    } catch (error) {
      return left(new Error(`Failed to fetch users by role: ${error}`));
    }
  }
}
