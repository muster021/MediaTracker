import React, { FunctionComponent, useState } from 'react';
import { Trans } from '@lingui/macro';
import { useTokens } from 'src/api/token';
import { SettingsSegment } from 'src/components/SettingsSegment';

export const SettingsApplicationTokensPage: FunctionComponent = () => {
  const { tokens, addToken, removeToken } = useTokens();
  const [tokenName, setTokenName] = useState('');

  const [newTokens, setNewTokens] = useState<Record<string, string>>({});

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const token = await addToken({ description: tokenName });
    setNewTokens({ ...newTokens, [tokenName]: token.token });

    setTokenName('');
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          value={tokenName}
          onChange={(e) => setTokenName(e.currentTarget.value)}
          className="block"
          required
        />
        <button className="mt-2 btn">
          <Trans>Add token</Trans>
        </button>
      </form>

      <div className="my-4 border-t"></div>
      {tokens &&
        tokens.map((token) => (
          <div key={token} className="my-2">
            <div className="inline-block mr-2">{token}</div>
            {token in newTokens && (
              <>
                <div className="inline-block mr-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {newTokens[token]}
                </div>
              </>
            )}
            <button
              className="mt-2 btn"
              onClick={() => removeToken({ description: token })}
            >
              <Trans>Remove token</Trans>
            </button>
          </div>
        ))}

      <div className="my-4 border-t"></div>

      <SettingsSegment title="Home Assistant — iCal Calendar">
        <p className="mb-2 text-sm">
          <Trans>
            Add upcoming episodes to Home Assistant using the <strong>Remote Calendar</strong> integration (HA 2025.4+).
          </Trans>
        </p>
        <ol className="mb-2 text-sm list-decimal list-inside space-y-1">
          <li><Trans>Create a token above</Trans></li>
          <li><Trans>In Home Assistant: <strong>Settings → Devices &amp; Services → Add Integration → Remote Calendar</strong></Trans></li>
          <li><Trans>Enter the URL below (use the server&apos;s IP address, not a .local hostname)</Trans></li>
        </ol>
        <code className="block p-2 text-xs bg-gray-100 dark:bg-gray-800 rounded break-all">
          {window.location.origin}/api/calendar.ics?token=YOUR_TOKEN
        </code>
        <p className="mt-2 text-xs text-gray-500">
          <Trans>Append &amp;days=N to change the lookahead window (default: 90 days).</Trans>
        </p>
      </SettingsSegment>
    </>
  );
};
