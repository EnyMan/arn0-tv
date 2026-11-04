/* Wallpaper display and rotation, driven by Prefs.wallpaper. */
(function () {
    'use strict';

    var INTERVALS = [
        { key: 'open', label: 'Each time Home opens', ms: 0 },
        { key: '30s', label: '30 s', ms: 30 * 1000 },
        { key: '5m', label: '5 min', ms: 5 * 60 * 1000 },
        { key: '15m', label: '15 min', ms: 15 * 60 * 1000 },
        { key: '1h', label: '1 hour', ms: 60 * 60 * 1000 },
        { key: '1d', label: 'Daily', ms: 24 * 60 * 60 * 1000 }
    ];

    var token = 0;

    /*
     * Extra photos from LAUNCHER_CONFIG.wallpaperFeed (nas/wallpapers on the home network), shown
     * after the bundled ones. The last list read is kept, so the photos keep working while the
     * NAS is off; the files themselves still have to load from it.
     */
    var FEED_KEY = 'arn0.wallpaperFeed.v1';
    var FEED_EVERY_MS = 10 * 60 * 1000;
    var feed = [];
    var feedAt = 0;
    try {
        feed = JSON.parse(localStorage.getItem(FEED_KEY)) || [];
    } catch (e) {
        feed = [];
    }

    function list() { return (window.WALLPAPERS || []).concat(feed); }

    function refreshFeed() {
        var url = window.LAUNCHER_CONFIG.wallpaperFeed;
        if (!url || Date.now() - feedAt < FEED_EVERY_MS) return;
        feedAt = Date.now();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 8000;
        xhr.onload = function () {
            try {
                if (xhr.status !== 200) throw new Error('HTTP ' + xhr.status);
                var items = JSON.parse(xhr.responseText).wallpapers.map(function (w) {
                    return {
                        key: w.key,
                        title: w.title,
                        file: new URL(w.file, url).href,
                        thumb: new URL(w.thumb, url).href,
                        credit: ''
                    };
                });
                if (JSON.stringify(items) === JSON.stringify(feed)) return;
                feed = items;
                try {
                    localStorage.setItem(FEED_KEY, JSON.stringify(feed));
                } catch (e) {
                    // Storage full or unavailable: the list still works until the next start.
                }
                apply();
            } catch (e) {
                DevLog.log('Wallpaper feed unusable: ' + DevLog.errorText(e));
            }
        };
        xhr.onerror = xhr.ontimeout = function () { DevLog.log('Wallpaper feed unreachable: ' + url); };
        xhr.send();
    }

    function find(key) {
        return list().find(function (w) { return w.key === key; }) || list()[0] || null;
    }

    function interval(key) {
        var find = function (k) { return INTERVALS.find(function (i) { return i.key === k; }); };
        return find(key) || find('15m');
    }

    function bg() { return document.getElementById('bg'); }

    // The next image is decoded before it replaces the current one, so the screen never flashes empty.
    // No wallpaper falls back to the stylesheet's plain gradient (img/bg.jpg).
    function display(w) {
        var t = ++token;
        if (!w) {
            bg().style.backgroundImage = '';
            return;
        }
        var img = new Image();
        img.onload = function () {
            if (t === token) bg().style.backgroundImage = 'url("' + w.file + '")';
        };
        img.onerror = function () { DevLog.log('Wallpaper failed to load: ' + w.file); };
        img.src = w.file;
    }

    function apply() {
        var p = Prefs.get().wallpaper;
        display(p.mode === 'off' ? null : find(p.photo));
    }

    function next() {
        var p = Prefs.get().wallpaper;
        var l = list();
        if (!l.length) return null;
        var i = l.findIndex(function (w) { return w.key === p.photo; });
        p.photo = l[(i + 1) % l.length].key;
        p.lastChange = Date.now();
        if (p.mode === 'off') p.mode = 'photo';
        Prefs.save();
        apply();
        return find(p.photo);
    }

    function due() {
        var p = Prefs.get().wallpaper;
        var ms = interval(p.interval).ms;
        return p.mode === 'rotate' && ms > 0 && Date.now() - p.lastChange >= ms;
    }

    // Called when Home appears (launch or return from another app).
    function homeShown() {
        refreshFeed();
        var p = Prefs.get().wallpaper;
        if (p.mode === 'rotate' && (p.interval === 'open' || due())) next();
    }

    function start() {
        apply();
        homeShown();
        // The screen saver has its own photo cycle and covers Home completely, so rotating
        // underneath it would only decode images nobody can see — and move the photo Home
        // comes back to.
        setInterval(function () {
            if (window.Screensaver && Screensaver.isOpen()) return;
            if (!document.hidden && due()) next();
        }, 5 * 1000);
    }

    window.Wallpaper = {
        INTERVALS: INTERVALS,
        list: list,
        find: find,
        interval: interval,
        apply: apply,
        next: next,
        homeShown: homeShown,
        start: start
    };
})();
