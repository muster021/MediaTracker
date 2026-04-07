import React, { FunctionComponent, useState } from 'react';
import { Trans, t } from '@lingui/macro';
import { useConfiguration } from 'src/api/configuration';
import { SettingsSegment } from 'src/components/SettingsSegment';

export const SettingsSonarrPage: FunctionComponent = () => {
  const { configuration, update, isLoading } = useConfiguration();

  const [sonarrUrl, setSonarrUrl] = useState('');
  const [sonarrApiKey, setSonarrApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (configuration) {
      setSonarrUrl(configuration.sonarrUrl || '');
      setSonarrApiKey(configuration.sonarrApiKey || '');
    }
  }, [configuration]);

  const [previewResult, setPreviewResult] = useState<{
    count: number;
    titles: string[];
  } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [importResult, setImportResult] = useState<{
    added: number;
    alreadyTracked: number;
    notFound: number;
    addedTitles: string[];
    notFoundTitles: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await update({ sonarrUrl, sonarrApiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = async () => {
    setPreviewError(null);
    setPreviewResult(null);
    setPreviewing(true);
    try {
      const res = await fetch('/api/import/sonarr/preview', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setPreviewResult(data);
    } catch (err: any) {
      setPreviewError(err.message || 'Fel vid anslutning till Sonarr');
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    setImportError(null);
    setImportResult(null);
    setImporting(true);
    try {
      const res = await fetch('/api/import/sonarr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setImportResult(data);
    } catch (err: any) {
      setImportError(err.message || 'Fel vid import från Sonarr');
    } finally {
      setImporting(false);
    }
  };

  if (isLoading) return <></>;

  return (
    <>
      <SettingsSegment title={t`Sonarr connection`}>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">
              <Trans>Sonarr URL</Trans>
            </label>
            <input
              type="url"
              className="block w-full"
              placeholder="http://localhost:8989"
              value={sonarrUrl}
              onChange={(e) => setSonarrUrl(e.currentTarget.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              <Trans>API Key</Trans>
            </label>
            <input
              type="text"
              className="block w-full"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={sonarrApiKey}
              onChange={(e) => setSonarrApiKey(e.currentTarget.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn">
              <Trans>Save</Trans>
            </button>
            {saved && (
              <span className="text-green-500 self-center">
                <Trans>Saved!</Trans>
              </span>
            )}
          </div>
        </form>
      </SettingsSegment>

      <div className="mt-3" />

      <SettingsSegment title={t`Test connection`}>
        <p className="mb-2 text-sm">
          <Trans>Test the connection to Sonarr and preview which series will be imported.</Trans>
        </p>
        <button
          className="btn"
          onClick={handlePreview}
          disabled={previewing || !sonarrUrl || !sonarrApiKey}
        >
          {previewing ? <Trans>Testing...</Trans> : <Trans>Test connection</Trans>}
        </button>

        {previewError && (
          <div className="mt-2 text-red-500">{previewError}</div>
        )}

        {previewResult && (
          <div className="mt-2">
            <p className="text-green-500">
              <Trans>Connection OK — {previewResult.count} series found in Sonarr</Trans>
            </p>
          </div>
        )}
      </SettingsSegment>

      <div className="mt-3" />

      <SettingsSegment title={t`Synchronize now`}>
        <p className="mb-2 text-sm">
          <Trans>
            Import all series from Sonarr into your MediaTracker watchlist.
            Series already in your watchlist will be skipped.
          </Trans>
        </p>
        <button
          className="btn btn-blue"
          onClick={handleImport}
          disabled={importing || !sonarrUrl || !sonarrApiKey}
        >
          {importing ? <Trans>Importing...</Trans> : <Trans>Import from Sonarr</Trans>}
        </button>

        {importError && (
          <div className="mt-2 text-red-500">{importError}</div>
        )}

        {importResult && (
          <div className="mt-3">
            <p>
              <Trans>Added:</Trans> <strong>{importResult.added}</strong>
            </p>
            <p>
              <Trans>Already tracked:</Trans>{' '}
              <strong>{importResult.alreadyTracked}</strong>
            </p>
            {importResult.notFound > 0 && (
              <p>
                <Trans>Not found:</Trans>{' '}
                <strong>{importResult.notFound}</strong>
                {importResult.notFoundTitles.length > 0 && (
                  <span className="text-sm ml-2 text-gray-500">
                    ({importResult.notFoundTitles.slice(0, 5).join(', ')}
                    {importResult.notFoundTitles.length > 5 ? '...' : ''})
                  </span>
                )}
              </p>
            )}
            {importResult.addedTitles.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">
                  <Trans>Show added series</Trans>
                </summary>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {importResult.addedTitles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </SettingsSegment>
    </>
  );
};
