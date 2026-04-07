import axios from 'axios';
import { createExpressRoute } from 'typescript-routes-to-openapi-server';
import { findMediaItemByExternalIdInExternalSources } from 'src/metadata/findByExternalId';
import { mediaItemRepository } from 'src/repository/mediaItem';
import { listItemRepository } from 'src/repository/listItemRepository';
import { configurationRepository } from 'src/repository/globalSettings';
import { updateMediaItem } from 'src/updateMetadata';

type SonarrSeries = {
  tvdbId: number;
  title: string;
  year: number;
  monitored: boolean;
  status: string;
};

export type SonarrImportResult = {
  added: number;
  alreadyTracked: number;
  notFound: number;
  addedTitles: string[];
  notFoundTitles: string[];
};

const fetchSonarrSeries = async (
  sonarrUrl: string,
  sonarrApiKey: string
): Promise<SonarrSeries[]> => {
  const url = sonarrUrl.replace(/\/$/, '') + '/api/v3/series';
  const res = await axios.get<SonarrSeries[]>(url, {
    headers: { 'X-Api-Key': sonarrApiKey },
    timeout: 10000,
  });
  return res.data;
};

/**
 * @openapi_tags Import
 */
export class SonarrImportController {
  /**
   * @openapi_operationId sonarrPreview
   */
  preview = createExpressRoute<{
    method: 'get';
    path: '/api/import/sonarr/preview';
    responseBody: { count: number; titles: string[] };
  }>(async (req, res) => {
    const config = await configurationRepository.get();

    if (!config?.sonarrUrl || !config?.sonarrApiKey) {
      res.status(400).send({
        error: 'Sonarr URL and API key must be configured first',
      } as any);
      return;
    }

    const series = await fetchSonarrSeries(config.sonarrUrl, config.sonarrApiKey);
    res.send({
      count: series.length,
      titles: series.map((s) => s.title),
    });
  });

  /**
   * @openapi_operationId sonarrImport
   */
  import = createExpressRoute<{
    method: 'post';
    path: '/api/import/sonarr';
    responseBody: SonarrImportResult;
  }>(async (req, res) => {
    const userId = Number(req.user);
    const config = await configurationRepository.get();

    if (!config?.sonarrUrl || !config?.sonarrApiKey) {
      res.status(400).send({
        error: 'Sonarr URL and API key must be configured first',
      } as any);
      return;
    }

    const series = await fetchSonarrSeries(config.sonarrUrl, config.sonarrApiKey);

    const result: SonarrImportResult = {
      added: 0,
      alreadyTracked: 0,
      notFound: 0,
      addedTitles: [],
      notFoundTitles: [],
    };

    for (const show of series) {
      if (!show.tvdbId) {
        result.notFound++;
        result.notFoundTitles.push(show.title);
        continue;
      }

      // Find or create the mediaItem
      let mediaItem = await mediaItemRepository.findByExternalId(
        { tvdbId: show.tvdbId },
        'tv'
      );

      if (!mediaItem) {
        mediaItem = await findMediaItemByExternalIdInExternalSources({
          id: { tvdbId: show.tvdbId },
          mediaType: 'tv',
        });
      }

      if (!mediaItem) {
        result.notFound++;
        result.notFoundTitles.push(show.title);
        continue;
      }

      // Fetch full details if needed
      if (mediaItem.needsDetails) {
        await updateMediaItem(mediaItem);
        mediaItem = await mediaItemRepository.findOne({ id: mediaItem.id });
      }

      // addItem returns false if already on watchlist
      const added = await listItemRepository.addItem({
        userId,
        mediaItemId: mediaItem.id,
        watchlist: true,
      });

      if (added) {
        result.added++;
        result.addedTitles.push(mediaItem.title);
      } else {
        result.alreadyTracked++;
      }
    }

    res.send(result);
  });
}
