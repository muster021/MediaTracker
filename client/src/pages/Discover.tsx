import React, { FunctionComponent, useState } from 'react';
import { Trans } from '@lingui/macro';
import { useQuery } from 'react-query';
import { queryClient } from 'src/App';

type TrendingTvShow = {
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

type TrendingResponse = {
  results: TrendingTvShow[];
  page: number;
  totalPages: number;
};

const fetchTrending = async (page: number): Promise<TrendingResponse> => {
  const res = await fetch(`/api/discover/trending?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  return res.json();
};

const addToWatchlistByTmdbId = async (
  tmdbId: number
): Promise<{ mediaItemId: number }> => {
  const res = await fetch('/api/discover/add-to-watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tmdbId }),
  });
  if (!res.ok) throw new Error('Failed to add to watchlist');
  return res.json();
};

const TrendingCard: FunctionComponent<{
  show: TrendingTvShow;
  onAddToWatchlist: (show: TrendingTvShow) => void;
  isAdding: boolean;
}> = ({ show, onAddToWatchlist, isAdding }) => {
  return (
    <div className="flex flex-col rounded border overflow-hidden">
      {show.posterPath ? (
        <img
          src={show.posterPath}
          alt={show.title}
          className="w-full object-cover"
          style={{ aspectRatio: '2/3' }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full bg-gray-200 flex items-center justify-center"
          style={{ aspectRatio: '2/3' }}
        >
          <span className="text-gray-400 text-sm">No poster</span>
        </div>
      )}
      <div className="p-2 flex flex-col gap-1 flex-1">
        <div className="font-semibold text-sm leading-tight">{show.title}</div>
        {show.firstAirDate && (
          <div className="text-xs text-gray-500">
            {show.firstAirDate.substring(0, 4)}
          </div>
        )}
        {show.tmdbRating > 0 && (
          <div className="text-xs text-yellow-500">
            ★ {show.tmdbRating.toFixed(1)}
          </div>
        )}
        <div className="mt-auto pt-1">
          {show.isOnWatchlist ? (
            <span className="text-xs text-green-500">
              <Trans>On watchlist</Trans>
            </span>
          ) : (
            <button
              className="btn text-xs w-full"
              disabled={isAdding}
              onClick={() => onAddToWatchlist(show)}
            >
              {isAdding ? '...' : <Trans>+ Add to watchlist</Trans>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const DiscoverPage: FunctionComponent = () => {
  const [page, setPage] = useState(1);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [watchlistState, setWatchlistState] = useState<Set<number>>(new Set());

  const { data, isLoading, error } = useQuery(
    ['discover', 'trending', page],
    () => fetchTrending(page),
    { keepPreviousData: true }
  );

  const handleAddToWatchlist = async (show: TrendingTvShow) => {
    setAddingIds((prev) => new Set(prev).add(show.tmdbId));
    try {
      await addToWatchlistByTmdbId(show.tmdbId);
      setWatchlistState((prev) => new Set(prev).add(show.tmdbId));
      queryClient.invalidateQueries(['discover', 'trending', page]);
    } catch {
      // silently ignore
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(show.tmdbId);
        return next;
      });
    }
  };

  return (
    <div>
      <h1 className="text-4xl mb-4">
        <Trans>Discover</Trans>
      </h1>
      <h2 className="text-xl mb-4">
        <Trans>Trending TV Shows this week</Trans>
      </h2>

      {isLoading && (
        <div className="text-center py-8">
          <Trans>Loading...</Trans>
        </div>
      )}

      {error && (
        <div className="text-red-500">
          <Trans>Failed to load trending shows</Trans>
        </div>
      )}

      {data && (
        <>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            }}
          >
            {data.results.map((show) => (
              <TrendingCard
                key={show.tmdbId}
                show={{
                  ...show,
                  isOnWatchlist:
                    show.isOnWatchlist || watchlistState.has(show.tmdbId),
                }}
                onAddToWatchlist={handleAddToWatchlist}
                isAdding={addingIds.has(show.tmdbId)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← <Trans>Previous</Trans>
            </button>
            <span className="self-center">
              {page} / {data.totalPages}
            </span>
            <button
              className="btn"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <Trans>Next</Trans> →
            </button>
          </div>
        </>
      )}
    </div>
  );
};
