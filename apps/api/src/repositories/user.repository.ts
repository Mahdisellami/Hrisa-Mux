import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users, User, NewUser, userPreferences, NewUserPreference } from '../models';

export class UserRepository {
  async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async create(user: NewUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createUserPreferences(userId: string): Promise<void> {
    const preference: NewUserPreference = {
      userId,
      volume: 0.8,
      repeatMode: 'off',
      shuffleEnabled: false,
      qualityPreference: 'auto',
    };
    await db.insert(userPreferences).values(preference);
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await this.findByEmail(email);
    return !!result;
  }

  async usernameExists(username: string): Promise<boolean> {
    const result = await this.findByUsername(username);
    return !!result;
  }
}

export const userRepository = new UserRepository();
