import { eq, lt } from 'drizzle-orm';
import { db } from '../config/database';
import { sessions, Session, NewSession } from '../models';

export class SessionRepository {
  async create(session: NewSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async findByToken(token: string): Promise<Session | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);
    return result[0];
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async deleteByToken(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteExpired(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async isValid(token: string): Promise<boolean> {
    const session = await this.findByToken(token);
    if (!session) return false;
    return session.expiresAt > new Date();
  }
}

export const sessionRepository = new SessionRepository();
