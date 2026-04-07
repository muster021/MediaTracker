import axios from 'axios';
import { createExpressRoute } from 'typescript-routes-to-openapi-server';
import { GlobalConfiguration } from 'src/repository/globalSettings';
import { mediaItemRepository } from 'src/repository/mediaItem';
import { listItemRepository } from 'src/repository/listItemRepository';
import { findMediaItemByExternalIdInExternalSources } from 'src/metadata/findByExternalId';
import { updateMediaItem } from 'src/updateMetadata';
import { Database } from 'src/dbconfig';

const TMDB_API_KEY = '779734046efc1e6127485c54d3b29627';

export type TrendingTvShow = {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  tmdbRating: number;
  isOnWatchlist: boolean;
  mediaItemId: number | null;
};

export type TrendingResponse = {
  results: TrendingTvShow[];
  page: number;
  totalPages: number;
};

/**
 * @openapi_tags Discover
 */
export class DiscoverController {
  /**
   * @openapi_operationId trending
   */
  trending = createExpressRoute<{
    method: 'get';
    path: '/api/discover/trending';
    requestQuery: {
      page?: number;
    };
    responseBody: TrendingResponse;
  }>(async (req, res) => {
    const userId = Number(req.user);
    const page = Number(req.query.page) || 1;

    const tmdbRes = await axios.get(
      'https://api.themoviedb.org/3/trending/tv/week',
      {
        params: {
          api_key: TMDB_API_KEY,
          language: GlobalConfiguration.configuration.tmdbLang || 'en',
          page,
        },
      }
    );

    const tmdbResults = tmdbRes.data.results as any[];
    const tmdbIds: number[] = tmdbResults.map((r) => r.id);

    // Find which shows are already in local DB
    const existingItems = tmdbIds.length
      ? await Database.knex('mediaItem')
          .whereIn('tmdbId', tmdbIds)
          .where('mediaType', 'tv')
          .select('id', 'tmdbId')
      : [];

    const tmdbIdToLocalId = new Map<number, number>(
      existingItems.map((item: any) => [item.tmdbId, item.id])
    );

    // Find which local items are on this user's watchlist
    const localIds = [...tmdbIdToLocalId.values()];
    const watchlistEntries = localIds.length
      ? await Database.knex('listItem')
          .join('list', 'list.id', 'listItem.listId')
          .whereIn('listItem.mediaItemId', localIds)
          .where('list.userId', userId)
          .where('list.isWatchlist', true)
          .select('listItem.mediaItemId')
      : [];

    const watchlistSet = new Set<number>(
      watchlistEntries.map((e: any) => e.mediaItemId)
    );

    const getPosterUrl = (path: string | null) => {
      if (!path) return null;
      return `https://image.tmdb.org/t/p/w342${path}`;
    };

    const results: TrendingTvShow[] = tmdbResults.map((item) => {
      const localId = tmdbIdToLocalId.get(item.id) ?? null;
      return {
        tmdbId: item.id,
        title: item.name || item.original_name,
        overview: item.overview || '',
        posterPath: getPosterUrl(item.poster_path),
        backdropPath: getPosterUrl(item.backdrop_path),
        firstAirDate: item.first_air_date || null,
        tmdbRating: item.vote_average || 0,
        isOnWatchlist: localId !== null && watchlistSet.has(localId),
        mediaItemId: localId,
      };
    });

    res.send({
      results,
      page: tmdbRes.data.page,
      totalPages: tmdbRes.data.total_pages,
    });
  });

  /**
   * @openapi_operationId addToWatchlist
   */
  addToWatchlist = createExpressRoute<{
    method: 'post';
    path: '/api/discover/add-to-watchlist';
    requestBody: { tmdbId: number };
    responseBody: { mediaItemId: number };
  }>(async (req, res) => {
    const userId = Number(req.user);
    const { tmdbId } = req.body;

    if (!tmdbId) {
      res.status(400).send({ error: 'tmdbId is required' } as any);
      return;
    }

    // Find or create the media item
    let mediaItem = await mediaItemRepository.findByExternalId(
      { tmdbId },
      'tv'
    );

    if (!mediaItem) {
      mediaItem = await findMediaItemByExternalIdInExternalSources({
        id: { tmdbId },
        mediaType: 'tv',
      });
    }

    if (!mediaItem) {
      res.status(404).send({ error: 'Show not found' } as any);
      return;
    }

    // Fetch full details if needed
    if (mediaItem.needsDetails) {
      await updateMediaItem(mediaItem);
      mediaItem = await mediaItemRepository.findOne({ id: mediaItem.id });
    }

    await listItemRepository.addItem({
      userId,
      mediaItemId: mediaItem.id,
      watchlist: true,
    });

    res.send({ mediaItemId: mediaItem.id });
  });
}
