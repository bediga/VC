// Infrastructure - Turso Candidate Repository Implementation
import { createClient, Client } from '@libsql/client';
import { Candidate } from '../../domain/entities';
import { CandidateRepository, CreateCandidateData, UpdateCandidateData } from '../../domain/repositories';

export class TursoCandidateRepository implements CandidateRepository {
  private client: Client;

  constructor(url: string, authToken: string) {
    this.client = createClient({
      url,
      authToken
    });
  }

  async findAll(): Promise<Candidate[]> {
    const result = await this.client.execute(`
      SELECT * FROM candidates ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => this.mapRowToCandidate(row));
  }

  async findById(id: number): Promise<Candidate | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM candidates WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0) return null;
    return this.mapRowToCandidate(result.rows[0]);
  }

  async create(candidateData: CreateCandidateData): Promise<Candidate> {
    const now = new Date().toISOString();

    const result = await this.client.execute({
      sql: `
        INSERT INTO candidates (
          first_name, last_name, party, age, profession, education, 
          experience, email, phone, website, is_active, total_votes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [
        candidateData.firstName,
        candidateData.lastName,
        candidateData.party,
        candidateData.age || null,
        candidateData.profession || null,
        candidateData.education || null,
        candidateData.experience || null,
        candidateData.email || null,
        candidateData.phone || null,
        candidateData.website || null,
        candidateData.isActive,
        0, // total_votes initial value
        now,
        now
      ]
    });

    const candidateId = result.rows[0]?.id as number;
    const candidate = await this.findById(candidateId);
    if (!candidate) throw new Error('Failed to create candidate');
    return candidate;
  }

  async update(id: number, candidateData: UpdateCandidateData): Promise<Candidate> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (candidateData.firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(candidateData.firstName);
    }
    if (candidateData.lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(candidateData.lastName);
    }
    if (candidateData.party !== undefined) {
      updateFields.push('party = ?');
      updateValues.push(candidateData.party);
    }
    if (candidateData.age !== undefined) {
      updateFields.push('age = ?');
      updateValues.push(candidateData.age);
    }
    if (candidateData.profession !== undefined) {
      updateFields.push('profession = ?');
      updateValues.push(candidateData.profession);
    }
    if (candidateData.education !== undefined) {
      updateFields.push('education = ?');
      updateValues.push(candidateData.education);
    }
    if (candidateData.experience !== undefined) {
      updateFields.push('experience = ?');
      updateValues.push(candidateData.experience);
    }
    if (candidateData.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(candidateData.email);
    }
    if (candidateData.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(candidateData.phone);
    }
    if (candidateData.website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(candidateData.website);
    }
    if (candidateData.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(candidateData.isActive);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await this.client.execute({
      sql: `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`,
      args: updateValues
    });

    const candidate = await this.findById(id);
    if (!candidate) throw new Error('Failed to update candidate');
    return candidate;
  }

  async delete(id: number): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM candidates WHERE id = ?',
      args: [id]
    });
  }

  async findActiveOnly(): Promise<Candidate[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM candidates WHERE is_active = ? ORDER BY created_at DESC',
      args: [true]
    });
    
    return result.rows.map(row => this.mapRowToCandidate(row));
  }

  async findByParty(party: string): Promise<Candidate[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM candidates WHERE party = ? ORDER BY created_at DESC',
      args: [party]
    });
    
    return result.rows.map(row => this.mapRowToCandidate(row));
  }

  async findByNameAndPosition(name: string, party: string): Promise<Candidate | null> {
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await this.client.execute({
      sql: 'SELECT * FROM candidates WHERE first_name = ? AND last_name = ? AND party = ?',
      args: [firstName, lastName, party]
    });

    if (result.rows.length === 0) return null;
    return this.mapRowToCandidate(result.rows[0]);
  }

  private mapRowToCandidate(row: any): Candidate {
    return {
      id: row.id as number,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      party: row.party as string,
      age: row.age as number || undefined,
      profession: row.profession as string || undefined,
      education: row.education as string || undefined,
      experience: row.experience as string || undefined,
      email: row.email as string || undefined,
      phone: row.phone as string || undefined,
      website: row.website as string || undefined,
      isActive: Boolean(row.is_active),
      totalVotes: (row.total_votes as number) || 0,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}
