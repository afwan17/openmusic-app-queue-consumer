const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }
  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT 
                playlists.id as "playlist.id", 
                playlists.name as "playlist.name",
                COALESCE(json_agg(
                    json_build_object(
                        'id', songs.id,
                        'title', songs.title,
                        'performer', songs.performer
                    )
                ) FILTER (WHERE songs.id IS NOT NULL), '[]') as "playlist.songs"
             FROM playlists
             LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
             LEFT JOIN songs ON songs.id = playlist_songs.song_id
             WHERE playlists.id = $1
             GROUP BY playlists.id`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new Error('Playlist not found');
    }

    return {
      playlist: {
        id: result.rows[0]['playlist.id'],
        name: result.rows[0]['playlist.name'],
        songs: result.rows[0]['playlist.songs']
      }
    };
  }
}

module.exports = PlaylistsService;