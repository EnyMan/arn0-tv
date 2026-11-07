/*
 * Interface text. The English string is the key, so untranslated text and names (apps, inputs,
 * fonts) pass through unchanged. {0}, {1} are filled from the extra arguments. A Czech entry
 * may be [one, few, many] when its first argument is a count.
 *
 * The language follows Settings → Appearance → Language (Prefs.appearance.locale). Spanish and
 * French only translate the date and weather; the interface stays English there.
 */
(function () {
    'use strict';

    var CS = {
        // Home and hints
        'Quick': 'Rychlé',
        'Apps': 'Aplikace',
        'All apps': 'Všechny aplikace',
        '{0} apps': ['{0} aplikace', '{0} aplikace', '{0} aplikací'],
        'Open': 'Otevřít',
        'Settings': 'Nastavení',
        'Could not open TV settings: {0}': 'Nastavení TV se nepodařilo otevřít: {0}',
        'Home': 'Domů',
        'Run': 'Spustit',
        'Select': 'Vybrat',
        'Close': 'Zavřít',
        'Change': 'Změnit',
        'Switch column': 'Přepnout sloupec',
        'Options': 'Možnosti',
        'Select / Preview': 'Vybrat / Přehrát',
        'Reorder': 'Přesunout',
        'Drop here': 'Položit sem',
        'Cancel': 'Zrušit',
        'Add to Home': 'Přidat na plochu',
        'Save': 'Uložit',
        'Name': 'Název',
        'Jump': 'Skok',
        'Duck': 'Skrčit',
        'Could not open {0}: {1}': '{0} se nepodařilo otevřít: {1}',
        'Switching to {0}…': 'Přepínám na {0}…',
        'Could not switch to {0}: {1}': 'Na {0} se nepodařilo přepnout: {1}',
        'Could not list apps: {0}': 'Seznam aplikací se nepodařilo načíst: {0}',

        // Settings overview
        'Background': 'Pozadí',
        'Apps on Home': 'Aplikace na ploše',
        'Consoles': 'Vstupy HDMI',
        '{0} on Home': '{0} na ploše',
        'Appearance': 'Vzhled',
        'Navigation sound': 'Zvuk navigace',
        'Screen saver': 'Spořič obrazovky',
        'Samsung Home': 'Samsung Home',
        'Smart Hub and TV settings': 'Smart Hub a nastavení TV',
        'Advanced': 'Pokročilé',
        'Refresh, reset, Lab': 'Obnovení, reset, Lab',
        'Could not open Samsung Home: {0}': 'Samsung Home se nepodařilo otevřít: {0}',

        // Background
        'Wallpaper': 'Tapeta',
        'Change every': 'Měnit každých',
        'Photo': 'Fotka',
        'Off': 'Vypnuto',
        'Rotate': 'Střídat',
        'Rotate · {0}': 'Střídat · {0}',
        'Each time Home opens': 'Při každém otevření plochy',
        '1 hour': '1 hodina',
        '2 hours': '2 hodiny',
        'Daily': 'Denně',
        'Coast village': 'Pobřežní vesnice',
        'Snowy valley': 'Zasněžené údolí',
        'Forest path': 'Lesní cesta',
        'Aurora': 'Polární záře',
        'Night sky': 'Noční obloha',
        'Earth at night': 'Země v noci',
        'Milky Way': 'Mléčná dráha',
        'Kyoto': 'Kjóto',
        'Golden hills': 'Zlaté kopce',
        'Waterfall': 'Vodopád',

        // Appearance
        'Clock': 'Hodiny',
        '24-hour': '24hodinové',
        '12-hour': '12hodinové',
        'Date': 'Datum',
        'Show': 'Zobrazit',
        'Hide': 'Skrýt',
        'Language': 'Jazyk',
        'Font': 'Písmo',
        'App names': 'Názvy aplikací',
        'Always': 'Vždy',
        'When selected': 'Při výběru',
        'Never': 'Nikdy',

        // Navigation sound
        'Sound': 'Zvuk',
        'On': 'Zapnuto',
        'On · {0}': 'Zapnuto · {0}',
        'Style': 'Styl',
        'Soft': 'Jemný',
        'Warm': 'Teplý',
        'Bright': 'Jasný',
        'Try it': 'Vyzkoušet',
        'Preview selected sound': 'Přehrát vybraný zvuk',

        // Screen saver
        'After {0}': 'Po {0}',
        'Start after': 'Spustit po',
        'Change photo every': 'Měnit fotku po',
        'Go dark after': 'Ztmavit po',
        'Show it now': 'Spustit teď',

        // Apps on Home
        'On Home · {0}': 'Na ploše · {0}',
        'Add apps · {0}': 'Přidat aplikace · {0}',
        'Move': 'Přesunout',
        'Pin to top row': 'Připnout do horní řady',
        'Unpin from top row': 'Odepnout z horní řady',
        'Remove from Home': 'Odebrat z plochy',
        'Added {0} to Home': '{0}: přidáno na plochu',
        'Up to {0} pinned apps: unpin one first': 'Připnout lze nejvýše {0} aplikace, nejdřív jednu odepněte',
        'Home needs at least one app': 'Na ploše musí zůstat aspoň jedna aplikace',

        // Consoles (HDMI inputs)
        'Hidden': 'Skryto',
        'HDMI {0} · {1}': 'HDMI {0} · {1}',
        'TV input': 'Vstup TV',
        'Game Mode works': 'funguje herní režim',
        'Inside the launcher': 'Uvnitř launcheru',
        'Back returns here': 'Zpět se vrátí sem',
        '+ Add a console': '+ Přidat vstup',
        'Console': 'Konzole',
        'Rename': 'Přejmenovat',
        'HDMI port': 'Port HDMI',
        'HDMI port · HDMI {0}': 'Port HDMI · HDMI {0}',
        'HDMI {0} · connected': 'HDMI {0} · připojeno',
        'Logo': 'Logo',
        'Logo · {0}': 'Logo · {0}',
        'None': 'Žádné',
        'Opens': 'Otevírá se',
        'Opens · {0}': 'Otevírá se · {0}',
        'Show on Home': 'Zobrazit na ploše',
        'Hide from Home': 'Skrýt z plochy',
        'Move earlier': 'Posunout dopředu',
        'Move later': 'Posunout dozadu',
        'Remove': 'Odebrat',
        'Remove {0}?': 'Odebrat {0}?',

        // Advanced
        'Refresh app list': 'Obnovit seznam aplikací',
        'After installing or removing apps': 'Po instalaci nebo odebrání aplikací',
        'Refreshing the app list…': 'Obnovuji seznam aplikací…',
        'App list refreshed': 'Seznam aplikací obnoven',
        'Export settings': 'Exportovat nastavení',
        'Sends them to the Mac log': 'Odešle je do vývojářského logu',
        'Settings sent to the Mac log': 'Nastavení odesláno do logu',
        'Reset all settings': 'Obnovit výchozí nastavení',
        'Back to the defaults': 'Vše vrátí na výchozí hodnoty',
        'Reset all settings?': 'Obnovit výchozí nastavení?',
        'Reset': 'Obnovit',
        'Developer tests': 'Vývojářské testy'
    };

    function table() {
        var locale = window.Prefs ? Prefs.get().appearance.locale : '';
        return String(locale).indexOf('cs') === 0 ? CS : null;
    }

    // Czech plural forms: 1, 2–4, everything else.
    function pluralIndex(n) {
        if (n === 1) return 0;
        return n >= 2 && n <= 4 ? 1 : 2;
    }

    window.T = function (text) {
        var args = Array.prototype.slice.call(arguments, 1);
        var t = table();
        var out = (t && Object.prototype.hasOwnProperty.call(t, text)) ? t[text] : text;
        if (Array.isArray(out)) out = out[pluralIndex(args[0])];
        return String(out).replace(/\{(\d)\}/g, function (m, i) { return args[i]; });
    };

    // Static headings in index.html; everything else is translated where it is rendered.
    window.translatePage = function () {
        document.documentElement.lang = table() ? 'cs' : 'en';
        Array.prototype.forEach.call(document.querySelectorAll('h1, h2, .dialog-title'), function (e) {
            if (e.textContent) e.textContent = T(e.textContent);
        });
    };
})();
