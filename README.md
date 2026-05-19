# Seerr TV

A native webOS app for LG Smart TVs that wraps [Jellyseerr](https://github.com/Fallenbagel/jellyseerr) / [Overseerr](https://github.com/sct/overseerr) with one key improvement — the **Watch Trailer** button plays trailers in an inline YouTube player instead of redirecting to the broken TV YouTube app.

![Seerr](com.mooock.seerr-tv/icon.png)

---

## Features

- First-launch setup wizard to configure your Seerr server URL
- Session persistence — stays logged in between launches just like the LG browser
- Intercepts Watch Trailer links and plays them fullscreen in an inline YouTube player
- Back button closes the trailer and returns to the movie/series page
- No ads, no tracking, no bloat

---

## Requirements

- LG Smart TV running webOS 4.x or higher
- Rooted TV with [Homebrew Channel](https://github.com/webosbrew/webos-homebrew-channel) installed, **or** Developer Mode enabled
- A running Jellyseerr or Overseerr instance accessible from your TV's network

### Reverse proxy note

If your Seerr instance is behind a reverse proxy (e.g. Nginx Proxy Manager), you need to add the following to your proxy host's advanced config to allow session cookies to work inside the app:

```nginx
proxy_cookie_flags connect.sid samesite=none;
```

---

## Installation

### Via Homebrew Channel (recommended)

Search for **Seerr** in the Homebrew Channel app on your TV.

### Manual install

1. Download the latest `.ipk` from [Releases](https://github.com/mooock/seerr-tv/releases)
2. Transfer it to your TV (SSH/SFTP)
3. Install via SSH:

```bash
luna-send-pub -i 'luna://com.webos.appInstallService/dev/install' \
  '{"id":"com.mooock.seerr-tv","ipkUrl":"/tmp/com.mooock.seerr-tv_1.0.0_all.ipk","subscribe":true}'
```

---

## Repository structure

```
seerr-tv/
├── bin/                          Built IPK files
├── com.mooock.seerr-tv/          App source
│   ├── appinfo.json              webOS app manifest
│   ├── index.html                Setup wizard
│   ├── app.js                    Boot logic
│   ├── icon.png                  80×80 app icon
│   ├── largeIcon.png             130×130 app icon
│   └── webOSUserScripts/
│       └── userScript.js         YouTube trailer interceptor
├── source/                       Source assets (SVG icons)
└── com.mooock.seerr-tv.manifest.json   Homebrew Channel manifest
```

---

## Building from source

Requires Node.js 18+ and the webOS CLI:

```bash
npm install -g @webosose/ares-cli
ares-package ./com.mooock.seerr-tv
```

---

## License

MIT
