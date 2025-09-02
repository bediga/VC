// Infrastructure - Turso Database Repository Implementations
import { createClient, Client } from '@libsql/client';
import { User, UserRole } from '../../domain/entities';
import { UserRepository, CreateUserData, UpdateUserData } from '../../domain/repositories';
import bcrypt from 'bcryptjs';

export class TursoUserRepository implements UserRepository {
  private client: Client;

  constructor(url: string, authToken: string) {
    this.client = createClient({
      url,
      authToken
    });
  }

  async findAll(): Promise<User[]> {
    const result = await this.client.execute(`
      SELECT * FROM users ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => this.mapRowToUser(row));
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });

    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async create(userData: CreateUserData): Promise<User> {
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date().toISOString();

    await this.client.execute({
      sql: `
        INSERT INTO users (
          id, first_name, last_name, email, password, role, region, 
          department, arrondissement, commune, phone_number, is_active, 
          must_change_password, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        userData.firstName,
        userData.lastName,
        userData.email,
        hashedPassword,
        userData.role,
        userData.region || null,
        userData.department || null,
        userData.arrondissement || null,
        userData.commune || null,
        userData.phoneNumber || null,
        userData.isActive,
        true, // must_change_password
        now,
        now
      ]
    });

    const user = await this.findById(id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (userData.firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(userData.lastName);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(userData.email);
    }
    if (userData.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(userData.role);
    }
    if (userData.region !== undefined) {
      updateFields.push('region = ?');
      updateValues.push(userData.region);
    }
    if (userData.department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(userData.department);
    }
    if (userData.arrondissement !== undefined) {
      updateFields.push('arrondissement = ?');
      updateValues.push(userData.arrondissement);
    }
    if (userData.commune !== undefined) {
      updateFields.push('commune = ?');
      updateValues.push(userData.commune);
    }
    if (userData.phoneNumber !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(userData.phoneNumber);
    }
    if (userData.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(userData.isActive);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await this.client.execute({
      sql: `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      args: updateValues
    });

    const user = await this.findById(id);
    if (!user) throw new Error('Failed to update user');
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [id]
    });
  }

  async findByRole(role: string): Promise<User[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC',
      args: [role]
    });
    
    return result.rows.map(row => this.mapRowToUser(row));
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      email: row.email as string,
      role: row.role as UserRole,
      isActive: Boolean(row.is_active),
      region: row.region as string || undefined,
      department: row.department as string || undefined,
      arrondissement: row.arrondissement as string || undefined,
      commune: row.commune as string || undefined,
      phoneNumber: row.phone_number as string || undefined,
      mustChangePassword: Boolean(row.must_change_password),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}
