import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../config/database';
import { tracks, Track, NewTrack } from '../models';

export class TrackRepository {
  async findById(id: string): Promise<Track | undefined> {
    const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
    return result[0];
  }

  async findByIds(ids: string[]): Promise<Track[]> {
    if (ids.length === 0) return [];
    return db.select().from(tracks).where(inArray(tracks.id, ids));
  }

  async findBySourceId(sourceType: string, sourceId: string): Promise<Track | undefined> {
    const result = await db
      .select()
      .from(tracks)
      .where(and(eq(tracks.sourceType, sourceType), eq(tracks.sourceId, sourceId)))
      .limit(1);
    return result[0];
  }

  async findByUploader(userId: string): Promise<Track[]> {
    return db
      .select()
      .from(tracks)
      .where(eq(tracks.uploadedBy, userId))
      .orderBy(desc(tracks.createdAt));
  }

  async create(track: NewTrack): Promise<Track> {
    const result = await db.insert(tracks).values(track).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewTrack>): Promise<Track | undefined> {
    const result = await db
      .update(tracks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tracks.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(tracks).where(eq(tracks.id, id));
  }

  async findOrCreate(track: NewTrack): Promise<Track> {
    // Check if track already exists by source
    const existing = await this.findBySourceId(track.sourceType, track.sourceId);
    if (existing) {
      return existing;
    }

    // Create new track
    return this.create(track);
  }

  async isOwner(trackId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(tracks)
      .where(and(eq(tracks.id, trackId), eq(tracks.uploadedBy, userId)))
      .limit(1);
    return result.length > 0;
  }

  async search(query: string, sourceType?: string): Promise<Track[]> {
    // Basic search implementation
    // In production, you'd want to use full-text search or external search service
    let queryBuilder = db.select().from(tracks);

    if (sourceType) {
      queryBuilder = queryBuilder.where(eq(tracks.sourceType, sourceType)) as any;
    }

    const results = await queryBuilder.orderBy(desc(tracks.createdAt)).limit(50);

    // Filter by query in memory (not ideal for large datasets)
    return results.filter((track) => {
      const searchStr = `${track.title} ${track.artist} ${track.album}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
  }
}

export const trackRepository = new TrackRepository();
