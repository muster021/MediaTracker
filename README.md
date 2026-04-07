# MediaTracker &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/muster021/MediaTracker/blob/main/LICENSE.md)

Self hosted platform for tracking movies, tv shows, video games, books and audiobooks.

> **Fork notice:** This is a fork of [bonukai/MediaTracker](https://github.com/bonukai/MediaTracker) with added Home Assistant integration, Sonarr sync, Discover page and streaming availability. The Docker image is published at `ghcr.io/muster021/mediatracker`.

# Installation

## With docker

| Tag      | Description     |
| -------- | --------------- |
| latest   | stable releases |
| unstable | pre-releases    |

```bash
docker volume create assets
docker run \
    -d \
    --name mediatracker \
    -p 7481:7481 \
    -v /home/YOUR_HOME_DIRECTORY/.config/mediatracker/data:/storage \
    -v assets:/assets \
    -e TMDB_LANG=en \
    -e AUDIBLE_LANG=us \
    -e TZ=Europe/London \
    ghcr.io/muster021/mediatracker:latest
```

## With docker-compose

```yaml
version: "3"
services:
  mediatracker:
    container_name: mediatracker
    ports:
      - 7481:7481
    volumes:
      - /home/YOUR_HOME_DIRECTORY/.config/mediatracker/data:/storage
      - assetsVolume:/assets
    environment:
      SERVER_LANG: en
      TMDB_LANG: en
      AUDIBLE_LANG: us
      TZ: Europe/London
    image: ghcr.io/muster021/mediatracker:latest

volumes:
  assetsVolume: null
```

## Building from source

```bash
git clone https://github.com/muster021/MediaTracker.git
cd MediaTracker
npm install
npm run build
npm run start
```

### Parameters

| Parameter   | Function                |
| ----------- | ----------------------- |
| -p 7481     | Port web API            |
| -v /storage | Directory with database |
| -v /assets  | Posters directory       |
| -v /logs    | Logs directory          |

### Environment variables

| Name               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TMDB_LANG          | ISO 639-1 country code, one of: `om`, `ab`, `aa`, `af`, `sq`, `am`, `ar`, `hy`, `as`, `ay`, `az`, `ba`, `eu`, `bn`, `dz`, `bh`, `bi`, `br`, `bg`, `my`, `be`, `km`, `ca`, `zh`, `co`, `hr`, `cs`, `da`, `nl`, `en`, `eo`, `et`, `fo`, `fj`, `fi`, `fr`, `fy`, `gl`, `ka`, `de`, `el`, `kl`, `gn`, `gu`, `ha`, `he`, `hi`, `hu`, `is`, `id`, `ia`, `ie`, `ik`, `iu`, `ga`, `it`, `ja`, `jw`, `kn`, `ks`, `kk`, `rw`, `ky`, `rn`, `ko`, `ku`, `lo`, `la`, `lv`, `ln`, `lt`, `mk`, `mg`, `ms`, `ml`, `mt`, `mi`, `mr`, `mo`, `mn`, `na`, `ne`, `no`, `oc`, `or`, `ps`, `fa`, `pl`, `pt`, `pa`, `qu`, `rm`, `ro`, `ru`, `sm`, `sg`, `sa`, `gd`, `sr`, `sh`, `st`, `tn`, `sn`, `sd`, `si`, `ss`, `sk`, `sl`, `so`, `es`, `su`, `sw`, `sv`, `tl`, `tg`, `ta`, `tt`, `te`, `th`, `bo`, `ti`, `to`, `ts`, `tr`, `tk`, `tw`, `ug`, `uk`, `ur`, `uz`, `vi`, `vo`, `cy`, `wo`, `xh`, `yi`, `yo`, `za`, `zu` |
| AUDIBLE_LANG       | ISO 639-1 country code, one of: `au`, `ca`, `de`, `es`, `fr`, `in`, `it`, `jp`, `uk`, `us`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| SERVER_LANG        | ISO 639-1 country code, one of: `da`, `de`, `en`, `es`, `fr`, `ko`, `pt`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| DATABASE_CLIENT    | Database client: `better-sqlite3` or `pg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| DATABASE_PATH      | Only for sqlite, path to database                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| DATABASE_URL       | Connection string                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| DATABASE_HOST      | Database host                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| DATABASE_PORT      | Database port                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| DATABASE_USER      | Database user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| DATABASE_PASSWORD  | Database password                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| DATABASE_DATABASE  | Database name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| IGDB_CLIENT_ID     | IGDB API key, needed for game lookup                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| IGDB_CLIENT_SECRET | IGDB secret                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| PUID               | UserID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| PGID               | GroupID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| TZ                 | Timezone, for example `Europe/London`, see [full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ASSETS_PATH        | Directory for posters and backdrops, defaults to `$HOME/.mediatracker/img`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| LOGS_PATH          | Directory for logs, defaults to `$HOME/.mediatracker/logs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| HOSTNAME           | IP address that the server will listen on (default: `0.0.0.0`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| PORT               | Port that the server will listen on (default: `7481`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

# Features

-   notifications
-   calendar
-   multiple users
-   REST API
-   watchlist
-   docker image (`ghcr.io/muster021/mediatracker`)
-   import from [Trakt](https://trakt.tv)
-   import from [goodreads](https://www.goodreads.com)
-   import from [Sonarr](https://sonarr.tv)
-   Home Assistant iCal calendar feed
-   Discover trending TV shows (powered by TMDB)
-   Streaming availability (watch providers, configurable per country)

# Import

| Service                                | Imported data                                  |
| -------------------------------------- | ---------------------------------------------- |
| [Trakt](https://trakt.tv)              | Watchlist, watched history, ratings            |
| [goodreads](https://www.goodreads.com) | Read, Currently Reading, Want to Read, ratings |
| [Sonarr](https://sonarr.tv)            | Monitored TV series → watchlist                |

# Home Assistant Integration

MediaTracker exposes an iCal calendar feed that Home Assistant can consume natively — no custom component required. Requires Home Assistant 2025.4 or later.

## Setup

1. In MediaTracker: go to **Settings → Application tokens** and create a new token
2. In Home Assistant: go to **Settings → Devices & Services → Add Integration**
3. Search for **Remote Calendar** and select it
4. Enter the calendar URL:

```
http://YOUR_HOMEASSISTANT_IP:7481/api/calendar.ics?token=YOUR_TOKEN
```

> **Note:** Use the IP address of the machine running MediaTracker (e.g. `192.168.1.100`), not a `.local` hostname — mDNS may not resolve inside the HA container. If running as a Home Assistant add-on, this is the same IP as your HA host.

The feed shows all upcoming episodes for series on your watchlist, within the next 90 days. Append `&days=N` to change the window (e.g. `&days=30`).

Once added, the calendar entity appears in Home Assistant and can be used in automations and the calendar view.

> **Alternative auth:** The feed also supports HTTP Basic Auth (username: anything, password: your token): `http://user:TOKEN@host:7481/api/calendar.ics`

# Sonarr Integration

Sync series from Sonarr into your MediaTracker watchlist.

1. Go to **Settings → Sonarr**
2. Enter your Sonarr URL (e.g. `http://localhost:8989`) and API key
3. Click **Test connection** to verify
4. Click **Import from Sonarr** to add all monitored series to your watchlist

Series already on your watchlist are skipped. Safe to re-run at any time.

# Discover

The **Discover** page shows trending TV shows from TMDB for the current week. Add any show directly to your watchlist from this page.

# Streaming Availability

Series detail pages show which streaming services a title is available on (Netflix, HBO, Disney+, etc.), based on TMDB watch provider data.

Configure the country in **Settings → Configuration → Watch providers country** (ISO 3166-1 alpha-2, e.g. `SE`, `NO`, `US`, `GB`). Refreshed automatically with metadata updates.

# Metadata providers

| Provider                                                                       | Media type     | Localization |
| ------------------------------------------------------------------------------ | -------------- | :----------: |
| [TMDB](https://www.themoviedb.org/)                                            | movie, tv show |      ✓       |
| [IGDB](https://www.igdb.com/)\*                                                | video game     |      ✗       |
| [Audible API](https://audible.readthedocs.io/en/latest/misc/external_api.html) | audiobooks     |      ✓       |
| [Open Library](https://openlibrary.org/)                                       | books          |      ✗       |

\* IGDB API key can be acquired [here](https://api-docs.igdb.com/#account-creation) and set in Settings → Configuration.

# Notification platforms

-   [gotify](https://gotify.net)
-   [ntfy](https://ntfy.sh)
-   [Pushbullet](https://www.pushbullet.com)
-   [Discord](https://discord.com)
-   [Pushover](https://pushover.net)
-   [Pushsafer](https://www.pushsafer.com)

# Integrations

-   [Jellyfin](https://jellyfin.org/) - [Plugin](https://github.com/bonukai/jellyfin-plugin-mediatracker)
-   [Plex](https://www.plex.tv/) - Add a [webhook](https://app.plex.tv/desktop/#!/settings/webhooks): `[your MediaTracker url]/api/plex?token=[Application Token]`
-   [Kodi](https://kodi.tv/) - [Plugin](https://github.com/bonukai/script.mediatracker)
-   [Home Assistant](https://www.home-assistant.io/) - [HA Add-on](https://github.com/muster021/ha-addon-mediatracker)

# Attribution

Forked from [bonukai/MediaTracker](https://github.com/bonukai/MediaTracker) — MIT License.
