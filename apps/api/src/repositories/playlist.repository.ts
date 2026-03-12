import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { playlists, Playlist, NewPlaylist, playlistTracks, PlaylistTrack } from '../models';

export class PlaylistRepository {
  async findById(id: string): Promise<Playlist | undefined> {
    const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
    return result[0];
  }

  async findByUserId(userId: string): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.updatedAt));
  }

  async findPublicPlaylists(): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.isPublic, true))
      .orderBy(desc(playlists.updatedAt))
      .limit(50);
  }

  async create(playlist: NewPlaylist): Promise<Playlist> {
    const result = await db.insert(playlists).values(playlist).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewPlaylist>): Promise<Playlist | undefined> {
    const result = await db
      .update(playlists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async isOwner(playlistId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  async getTrackCount(playlistId: string): Promise<number> {
    const result = await db
      .select()
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId));
    return result.length;
  }

  async addTrack(playlistTrack: {
    playlistId: string;
    trackId: string;
    position: number;
    addedBy: string;
  }): Promise<PlaylistTrack> {
    const result = await db.insert(playlistTracks).values(playlistTrack).returning();
    return result[0];
  }

  async removeTrack(playlistId: string, trackId: string): Promise<void> {
    await db
      .delete(playlistTracks)
      .where(
        and(
          eq(playlistTracks.playlistId, playlistId),
          eq(playlistTracks.trackId, trackId)
        )
      );
  }

  async getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    return db
      .select()
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(playlistTracks.position);
  }

  async reorderTracks(
    playlistId: string,
    trackOrders: { trackId: string; position: number }[]
  ): Promise<void> {
    // Update positions for all tracks
    await Promise.all(
      trackOrders.map(({ trackId, position }) =>
        db
          .update(playlistTracks)
          .set({ position })
          .where(
            and(
              eq(playlistTracks.playlistId, playlistId),
              eq(playlistTracks.trackId, trackId)
            )
          )
      )
    );
  }
}

export const playlistRepository = new PlaylistRepository();
