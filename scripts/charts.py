# -*- coding: utf-8 -*-
"""
Graphiques du portfolio, generes en SVG a partir de donnees reelles.

    python scripts/charts.py

Sources
  - Station Port de Bayonne : hist3.xlsx (46 445 releves, mars 2025 – juin 2026).
    Chemin par defaut ci-dessous, surchargeable par la variable SERIES_XLSX.
    Les series sont mises en cache dans .cache/series.json (non versionne).
  - Entrepot de donnees : scripts/data/colorants.csv (100 ventes simulees).

Sorties (versionnees, donc la CI n'a pas besoin des sources)
  - src/content/charts/<nom>.<langue>.html  fragments inseres dans les etudes de cas
  - src/content/charts/trace.html           courbe decorative du hero
  - src/content/charts/spark.<langue>.html  graphique interactif de l'accueil

Regles de rendu (skill dataviz)
  - une teinte par serie ; jamais de double axe, petits multiples a la place
  - grille et axes en filet plein d'1 px, jamais en pointilles
  - ligne 2 px a extremites arrondies ; marqueurs r >= 4 avec anneau de surface
  - etiquettes selectives ; legende uniquement a partir de deux series
  - aucune couleur en dur : tout passe par les variables CSS du theme
  - chaque panneau porte ses metadonnees d'echelle (data-*) : le script de
    survol inverse les coordonnees du trace, sans dupliquer les donnees
"""

import csv, io, json, math, os, sys, datetime as dt
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.environ.get("SERIES_XLSX", r"C:\Users\salbe\Desktop\PROJET_UPPATECH_CLAUDE"
                      r"\import_historique_bayonne\hist3.xlsx")
CACHE = os.path.join(ROOT, ".cache", "series.json")
COLORANTS = os.path.join(ROOT, "scripts", "data", "colorants.csv")
OUT = os.path.join(ROOT, "src", "content", "charts")

MOIS = {"fr": ["janv.", "févr.", "mars", "avr.", "mai", "juin",
               "juil.", "août", "sept.", "oct.", "nov.", "déc."],
        "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}

# colonne du xlsx -> (cle, libelle fr, libelle en, unite)
PARAMS = {
    "Temp C":        ("temperature", "Température", "Temperature", "°C"),
    "SpCond ms/cm":  ("conductivite", "Conductivité", "Conductivity", "mS/cm"),
    "Turbidity FNU": ("turbidite", "Turbidité", "Turbidity", "FNU"),
    "ODO mg/L":      ("oxygene", "Oxygène dissous", "Dissolved oxygen", "mg/L"),
}


# ------------------------------------------------------------------- donnees

def load_series():
    if os.path.exists(CACHE):
        return json.load(open(CACHE))
    import openpyxl
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    rows = wb[wb.sheetnames[0]].iter_rows(values_only=True)
    header = [str(c).strip() if c is not None else "" for c in next(rows)]
    next(rows)                                        # ligne des unites
    idx = {h: i for i, h in enumerate(header)}
    t_i = idx["TimeStamp"]
    ts, cols = [], {v[0]: [] for v in PARAMS.values()}
    for r in rows:
        t = r[t_i]
        if isinstance(t, str):
            try:
                t = dt.datetime.strptime(t.strip(), "%Y-%m-%d %H:%M:%S")
            except ValueError:
                continue
        if not isinstance(t, dt.datetime):
            continue
        ts.append(int(t.timestamp()))
        for col, (key, *_rest) in PARAMS.items():
            try:
                cols[key].append(float(r[idx[col]]))
            except (TypeError, ValueError, KeyError):
                cols[key].append(None)
    wb.close()
    data = {"t": ts, "series": cols}
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    json.dump(data, open(CACHE, "w"), separators=(",", ":"))
    return data


def pairs(data, key):
    return [(t, v) for t, v in zip(data["t"], data["series"][key]) if v is not None]


def label(key, lang):
    for k, fr, en, unit in PARAMS.values():
        if k == key:
            return (fr if lang == "fr" else en), unit
    return key, ""


def load_colorants():
    rows = []
    with io.open(COLORANTS, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            try:
                for k in ("quantite_kg", "montant_vente", "score_sante", "score_env"):
                    r[k] = float(r[k])
            except (ValueError, KeyError):
                continue
            rows.append(r)
    return rows


# --------------------------------------------------------------- utilitaires

def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def fnum(v, dec=1, lang="fr"):
    s = ("%%.%df" % dec) % v
    ent, _, frac = s.partition(".")
    neg = ent.startswith("-")
    ent = ent.lstrip("-")
    groups = []
    while len(ent) > 3:
        groups.insert(0, ent[-3:]); ent = ent[:-3]
    groups.insert(0, ent)
    sep, dec_sep = ("\u202f", ",") if lang == "fr" else (",", ".")
    out = sep.join(groups)
    if frac and int(frac) != 0:
        out += dec_sep + frac
    return ("-" if neg else "") + out


def nice_ticks(lo, hi, count=4):
    if hi <= lo:
        hi = lo + 1
    raw = (hi - lo) / count
    mag = 10 ** math.floor(math.log10(raw))
    step = next(m * mag for m in (1, 2, 2.5, 5, 10) if raw <= m * mag)
    v = math.floor(lo / step) * step
    out = []
    while v <= hi + step * .5:
        if v >= lo - step * .5:
            out.append(round(v, 10))
        v += step
    return out


def lttb(points, threshold):
    """Largest-Triangle-Three-Buckets : garde les points qui portent la forme."""
    n = len(points)
    if threshold >= n or threshold < 3:
        return list(points)
    out = [points[0]]
    every = (n - 2) / (threshold - 2)
    a = 0
    for i in range(threshold - 2):
        lo = int(math.floor((i + 1) * every)) + 1
        hi = min(int(math.floor((i + 2) * every)) + 1, n)
        ax_ = sum(p[0] for p in points[lo:hi]) / max(1, hi - lo)
        ay_ = sum(p[1] for p in points[lo:hi]) / max(1, hi - lo)
        lo2 = int(math.floor(i * every)) + 1
        hi2 = int(math.floor((i + 1) * every)) + 1
        px0, py0 = points[a]
        best, area_max = lo2, -1.0
        for j in range(lo2, min(hi2, n)):
            px, py = points[j]
            area = abs((px0 - ax_) * (py - py0) - (px0 - px) * (ay_ - py0))
            if area > area_max:
                area_max, best = area, j
        out.append(points[best])
        a = best
    out.append(points[-1])
    return out


def envelope(points, columns):
    """Enveloppe min/max par colonne de pixels.

    Dessiner 46 000 points sur 850 px ne montre rien de plus que leur minimum
    et leur maximum dans chaque colonne : c'est exactement ce que le navigateur
    rasteriserait. Rendu identique a l'oeil, pour ~2 sommets par colonne au
    lieu de ~55, soit un fichier trente fois plus leger.
    """
    t0, t1 = points[0][0], points[-1][0]
    span = (t1 - t0) or 1
    buckets = [None] * columns
    for t, v in points:
        c = min(columns - 1, int((t - t0) / span * columns))
        b = buckets[c]
        if b is None:
            buckets[c] = [t, v, t, v]
        else:
            if v < b[1]: b[0], b[1] = t, v
            if v > b[3]: b[2], b[3] = t, v
    out = []
    for b in buckets:
        if b is None:
            continue
        lo, hi = (b[0], b[1]), (b[2], b[3])
        out.extend(sorted((lo, hi)))
    return out


def date_fmt(t, lang, with_year=True):
    d = dt.datetime.fromtimestamp(t)
    m = MOIS[lang][d.month - 1]
    return ("%s %s" % (m, str(d.year)[2:])) if with_year else ("%d %s" % (d.day, m))


def month_ticks(t0, t1, every=3):
    d = dt.datetime.fromtimestamp(t0).replace(day=1, hour=0, minute=0, second=0)
    out = []
    while d.timestamp() <= t1:
        if (d.month - 1) % every == 0 and d.timestamp() >= t0:
            out.append(int(d.timestamp()))
        d = (d.replace(day=28) + dt.timedelta(days=8)).replace(day=1)
    return out


# ------------------------------------------------------------ primitives SVG

def axes(x0, y0, w, h, xticks, yticks, xmap, ymap, yfmt, xfmt):
    g = []
    for v in yticks:
        y = ymap(v)
        if y < y0 - .5 or y > y0 + h + .5:
            continue
        g.append('<line class="ch-grid" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x0, y, x0 + w, y))
        g.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="end">%s</text>'
                 % (x0 - 8, y + 3.5, esc(yfmt(v))))
    g.append('<line class="ch-axis" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x0, y0 + h, x0 + w, y0 + h))
    for v in xticks:
        g.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="middle">%s</text>'
                 % (xmap(v), y0 + h + 17, esc(xfmt(v))))
    return "".join(g)


def path(pts, xmap, ymap, cls):
    if not pts:
        return ""
    d = "".join(("M" if i == 0 else "L") + "%.1f %.1f" % (xmap(t), ymap(v))
                for i, (t, v) in enumerate(pts))
    return '<path class="%s" d="%s"/>' % (cls, d)


def hover_group(inner, x0, y0, w, h, t0, t1, v0, v1, unit, dec, lang):
    """Panneau survolable : le script inverse x -> date et y -> valeur."""
    return ('<g class="ch-hover" data-x0="%.1f" data-y0="%.1f" data-w="%.1f" data-h="%.1f" '
            'data-t0="%d" data-t1="%d" data-v0="%.4f" data-v1="%.4f" data-unit="%s" '
            'data-dec="%d" data-lang="%s">%s'
            '<rect class="ch-hit" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/></g>'
            % (x0, y0, w, h, t0, t1, v0, v1, esc(unit), dec, lang, inner, x0, y0, w, h))


def figure(svg, caption):
    return '<figure class="chart">%s<figcaption>%s</figcaption></figure>' % (svg, caption)


# ------------------------------------------------------------------ graphiques

def chart_lttb(data, lang):
    """Deux panneaux de meme echelle (brut / conserve), puis un zoom de dix
    jours qui montre *quels* points LTTB retient. Une superposition sur seize
    mois ne demontre rien : les deux courbes s'y confondent."""
    raw = pairs(data, "temperature")
    keep = lttb(raw, 1800)
    W, x0 = 920, 58
    w = W - x0 - 16
    PANEL, GAP, TOP = 92, 36, 34
    H = TOP + 3 * (PANEL + GAP) + 6
    t0, t1 = raw[0][0], raw[-1][0]
    lo = min(v for _, v in raw); hi = max(v for _, v in raw)
    yt = nice_ticks(lo, hi, 3)
    ylo, yhi = min(yt[0], lo), max(yt[-1], hi)
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    ym_at = lambda y0: (lambda v: y0 + PANEL - (v - ylo) / (yhi - ylo) * PANEL)

    # fenetre de dix jours la plus agitee
    WIN, best_i, best_var = 10 * 86400, 0, -1.0
    for i in range(0, len(raw), max(1, len(raw) // 400)):
        j = i
        while j < len(raw) and raw[j][0] - raw[i][0] < WIN:
            j += 1
        if j - i < 50:
            continue
        seg = [v for _, v in raw[i:j]]
        m = sum(seg) / len(seg)
        var = sum((v - m) ** 2 for v in seg) / len(seg)
        if var > best_var:
            best_var, best_i = var, i
    zj = best_i
    while zj < len(raw) and raw[zj][0] - raw[best_i][0] < WIN:
        zj += 1
    zraw = raw[best_i:zj]
    zt0, zt1 = zraw[0][0], zraw[-1][0]
    zkeep = [(t, v) for t, v in keep if zt0 <= t <= zt1]
    zlo = min(v for _, v in zraw); zhi = max(v for _, v in zraw)
    pad = (zhi - zlo) * .12 or 1
    zyt = nice_ticks(zlo - pad, zhi + pad, 3)
    zylo, zyhi = min(zyt[0], zlo - pad), max(zyt[-1], zhi + pad)
    zx = lambda t: x0 + (t - zt0) / (zt1 - zt0) * w

    ratio = fnum(len(raw) / len(keep), 0, lang)
    n_raw, n_keep = fnum(len(raw), 0, lang), fnum(len(keep), 0, lang)
    L = {"fr": ("Température de l'eau, station Port de Bayonne — mars 2025 à juin 2026",
                "%s points bruts" % n_raw, "%s points conservés par LTTB" % n_keep,
                "Détail sur dix jours : les points retenus sont les extrêmes",
                "%d points bruts · %d conservés" % (len(zraw), len(zkeep)),
                "Les deux premiers panneaux partagent la même échelle. Le troisième zoome sur la "
                "fenêtre la plus agitée : LTTB ne prend pas un point sur %s au hasard, il retient "
                "les sommets et les creux, ceux qui décident de la forme de la courbe. La série "
                "brute est rendue par enveloppe min/max par colonne de pixels, identique à l'œil "
                "au tracé des %s points." % (ratio, n_raw)),
         "en": ("Water temperature, Port of Bayonne station — March 2025 to June 2026",
                "%s raw points" % n_raw, "%s points kept by LTTB" % n_keep,
                "Ten-day detail: the points kept are the extremes",
                "%d raw points · %d kept" % (len(zraw), len(zkeep)),
                "The first two panels share one scale. The third zooms on the most agitated window: "
                "LTTB does not pick one point in %s at random, it keeps the peaks and troughs, the "
                "ones that decide the shape of the curve. The raw series is drawn as a per-pixel "
                "min/max envelope, visually identical to plotting all %s points." % (ratio, n_raw))}[lang]

    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="lttb-t lttb-d">' % (W, H),
           '<title id="lttb-t">%s</title><desc id="lttb-d">%s</desc>' % (esc(L[0]), esc(L[5]))]
    for i, (lab, pts, cls) in enumerate(((L[1], envelope(raw, int(w)), "ch-raw"),
                                          (L[2], keep, "ch-line"))):
        y0 = TOP + i * (PANEL + GAP)
        ym = ym_at(y0)
        out.append('<text class="ch-panel" x="%d" y="%d">%s</text>' % (x0, y0 - 12, esc(lab)))
        out.append(axes(x0, y0, w, PANEL, month_ticks(t0, t1) if i == 1 else [], yt, xmap, ym,
                        lambda v: fnum(v, 0, lang) + " °C", lambda t: date_fmt(t, lang)))
        inner = path(pts, xmap, ym, cls)
        out.append(hover_group(inner, x0, y0, w, PANEL, t0, t1, ylo, yhi, "°C", 1, lang)
                   if i == 1 else inner)

    y0 = TOP + 2 * (PANEL + GAP)
    zy = lambda v: y0 + PANEL - (v - zylo) / (zyhi - zylo) * PANEL
    out.append('<text class="ch-panel" x="%d" y="%d">%s</text>' % (x0, y0 - 12, esc(L[3])))
    out.append('<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>' % (x0 + w, y0 - 12, esc(L[4])))
    out.append(axes(x0, y0, w, PANEL, [zt0, (zt0 + zt1) // 2, zt1], zyt, zx, zy,
                    lambda v: fnum(v, 1, lang) + " °C", lambda t: date_fmt(t, lang, False)))
    inner = path(zraw, zx, zy, "ch-raw") + path(zkeep, zx, zy, "ch-line ch-line--thin")
    inner += "".join('<circle class="ch-dot" cx="%.1f" cy="%.1f" r="4"/>' % (zx(t), zy(v)) for t, v in zkeep)
    out.append(hover_group(inner, x0, y0, w, PANEL, zt0, zt1, zylo, zyhi, "°C", 2, lang))
    out.append('</svg>')
    return figure("".join(out), esc(L[5]))


def chart_multiples(data, lang):
    """Quatre grandeurs d'echelles differentes : petits multiples, jamais un double axe."""
    keys = ["temperature", "conductivite", "oxygene", "turbidite"]
    W, x0 = 920, 58
    w = W - x0 - 16
    PANEL, GAP, TOP = 88, 36, 30
    H = TOP + len(keys) * (PANEL + GAP) + 4
    t0, t1 = data["t"][0], data["t"][-1]
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    L = {"fr": ("Quatre paramètres physico-chimiques sur seize mois",
                "Chaque panneau porte sa propre échelle : superposer sur un seul axe des grandeurs "
                "qui n'ont ni la même unité ni le même ordre de grandeur inventerait une "
                "corrélation. La conductivité montre l'oscillation de la marée dans l'estuaire. "
                "Séries sous-échantillonnées par LTTB, 700 points chacune.",
                "échelle bornée au 99e centile"),
         "en": ("Four physico-chemical parameters over sixteen months",
                "Each panel carries its own scale: overlaying on one axis quantities that share "
                "neither unit nor order of magnitude would invent a correlation. Conductivity shows "
                "the tidal oscillation in the estuary. Series downsampled by LTTB, 700 points each.",
                "scale capped at the 99th percentile")}[lang]
    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="sm-t sm-d">' % (W, H),
           '<title id="sm-t">%s</title><desc id="sm-d">%s</desc>' % (esc(L[0]), esc(L[1]))]
    for i, key in enumerate(keys):
        pts = pairs(data, key)
        vv = sorted(v for _, v in pts)
        hi = vv[int(len(vv) * .99)] if key == "turbidite" else vv[-1]
        lo = vv[0]
        pts = lttb([(t, min(v, hi)) for t, v in pts], 700)
        y0 = TOP + i * (PANEL + GAP)
        yt = nice_ticks(lo, hi, 3)
        ylo, yhi = min(yt[0], lo), max(yt[-1], hi)
        ym = (lambda a, c, d: lambda v: a + PANEL - (v - c) / (d - c) * PANEL)(y0, ylo, yhi)
        name, unit = label(key, lang)
        out.append('<text class="ch-panel" x="%d" y="%d">%s%s</text>'
                   % (x0, y0 - 12, esc(name), esc(" · " + unit if unit else "")))
        if key == "turbidite":
            out.append('<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>'
                       % (x0 + w, y0 - 12, esc(L[2])))
        out.append(axes(x0, y0, w, PANEL, month_ticks(t0, t1) if i == len(keys) - 1 else [],
                        yt, xmap, ym, lambda v: fnum(v, 0 if abs(v) >= 10 else 1, lang),
                        lambda t: date_fmt(t, lang)))
        out.append(hover_group(path(pts, xmap, ym, "ch-line"), x0, y0, w, PANEL,
                               t0, t1, ylo, yhi, unit, 1, lang))
    out.append('</svg>')
    return figure("".join(out), esc(L[1]))


def chart_quality(data, lang):
    """Turbidite brute face a la borne physique de ingestion/validators.py."""
    BOUND = 5000.0
    pts = pairs(data, "turbidite")
    over = [(t, v) for t, v in pts if v > BOUND]
    W, x0 = 920, 66
    w = W - x0 - 16
    y0, h = 34, 190
    H = y0 + h + 32
    t0, t1 = pts[0][0], pts[-1][0]
    hi = max(v for _, v in pts)
    yt = nice_ticks(0, hi, 4)
    yhi = max(yt[-1], hi)
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    ymap = lambda v: y0 + h - v / yhi * h
    n_all = fnum(len(pts), 0, lang)
    L = {"fr": ("Turbidité brute et borne physique du contrôle qualité",
                "borne physique · 5 000 FNU",
                "%d mesures au-dessus de la borne, sur %s" % (len(over), n_all),
                "Les bornes viennent de <code>ingestion/validators.py</code>, qui définit une plage "
                "physiquement plausible par paramètre. Une mesure hors bornes n'est pas supprimée : "
                "elle est écartée de façon réversible et reste dans l'archive."),
         "en": ("Raw turbidity against the quality-control physical bound",
                "physical bound · 5,000 FNU",
                "%d readings above the bound, out of %s" % (len(over), n_all),
                "The bounds come from <code>ingestion/validators.py</code>, which defines a "
                "physically plausible range per parameter. An out-of-bounds reading is not deleted: "
                "it is set aside reversibly and stays in the archive.")}[lang]
    yb = ymap(BOUND)
    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="qc-t qc-d">' % (W, H),
           '<title id="qc-t">%s</title><desc id="qc-d">%s. %s</desc>' % (esc(L[0]), esc(L[0]), esc(L[2])),
           '<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>' % (x0 + w, y0 - 14, esc(L[2])),
           axes(x0, y0, w, h, month_ticks(t0, t1), yt, xmap, ymap,
                lambda v: fnum(v, 0, lang), lambda t: date_fmt(t, lang))]
    inner = path(envelope(pts, int(w)), xmap, ymap, "ch-line ch-line--thin")
    inner += ('<line class="ch-threshold" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
              '<text class="ch-threshold-label" x="%.1f" y="%.1f">%s</text>'
              % (x0, yb, x0 + w, yb, x0 + 6, yb - 7, esc(L[1])))
    inner += "".join('<circle class="ch-dot" cx="%.1f" cy="%.1f" r="4"/>' % (xmap(t), ymap(v)) for t, v in over)
    out.append(hover_group(inner, x0, y0, w, h, t0, t1, 0, yhi, "FNU", 0, lang))
    out.append('</svg>')
    return figure("".join(out), L[3])


def bar_chart(cats, values, title, desc, vfmt, ident, row=32):
    """Barres horizontales ; serie unique, donc une teinte et pas de legende."""
    W, x0 = 920, 200
    w = W - x0 - 100
    H = 18 + len(cats) * row + 6
    hi = max(values) or 1
    bh = min(18, row - 12)
    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="%s-t %s-d">' % (W, H, ident, ident),
           '<title id="%s-t">%s</title><desc id="%s-d">%s</desc>' % (ident, esc(title), ident, esc(desc))]
    for i, (c, v) in enumerate(zip(cats, values)):
        y = 18 + i * row
        bw = max(6.0, v / hi * w)
        out.append('<text class="ch-cat" x="%d" y="%.1f" text-anchor="end">%s</text>' % (x0 - 12, y + bh / 2 + 4, esc(c)))
        # extremite arrondie cote valeur, carree cote ligne de base
        out.append('<path class="ch-bar" d="M%.1f %.1f h%.1f a4 4 0 0 1 4 4 v%.1f a4 4 0 0 1 -4 4 h%.1f z">'
                   '<title>%s — %s</title></path>'
                   % (x0, y, bw - 4, bh - 8, -(bw - 4), esc(c), esc(vfmt(v))))
        out.append('<text class="ch-val" x="%.1f" y="%.1f">%s</text>' % (x0 + bw + 10, y + bh / 2 + 4, esc(vfmt(v))))
    out.append('<line class="ch-axis" x1="%d" y1="18" x2="%d" y2="%d"/>' % (x0, x0, 18 + (len(cats) - 1) * row + bh))
    out.append('</svg>')
    return "".join(out)


def chart_dw_quarter(rows, lang):
    agg = defaultdict(float)
    for r in rows:
        agg[r["trimestre"]] += r["quantite_kg"]
    cats = sorted(agg)
    q = {"fr": lambda c: c, "en": lambda c: c.replace("T", "Q")}[lang]
    L = {"fr": ("Quantité vendue par trimestre",
                "Somme des quantités de la table de faits, agrégée sur la dimension temps.",
                "La mesure vient de la table de faits, l'axe de <code>Dim_Temps</code> : "
                "l'agrégation que le schéma en étoile rend immédiate. Jeu de données simulé."),
         "en": ("Quantity sold per quarter",
                "Sum of fact-table quantities, aggregated over the time dimension.",
                "The measure comes from the fact table, the axis from <code>Dim_Temps</code>: "
                "the aggregation a star schema makes immediate. Simulated dataset.")}[lang]
    svg = bar_chart([q(c) for c in cats], [agg[c] for c in cats], L[0], L[1],
                    lambda v: fnum(v, 0, lang) + " kg", "dwq", 34)
    return figure(svg, L[2])


def chart_dw_origin(rows, lang):
    agg = defaultdict(list)
    for r in rows:
        agg[r["source"]].append(r["score_env"])
    tr = {"fr": {}, "en": {"Plante": "Plant", "Algue": "Algae", "Épice": "Spice",
                           "Minéral": "Mineral", "Fruit": "Fruit", "Légume": "Vegetable",
                           "Insecte": "Insect", "Synthèse": "Synthetic", "Racine": "Root",
                           "Fleur": "Flower", "Champignon": "Fungus"}}[lang]
    ps = sorted(((k, sum(v) / len(v), len(v)) for k, v in agg.items()), key=lambda p: -p[1])
    L = {"fr": ("Score environnemental moyen par source d'origine",
                "Moyenne du score environnemental groupée sur la dimension origine, effectif entre parenthèses.",
                "Une mesure de la table de faits croisée avec une dimension descriptive. L'effectif est "
                "affiché : une moyenne sur trois ventes ne vaut pas une moyenne sur trente. Jeu simulé."),
         "en": ("Average environmental score by source of origin",
                "Mean environmental score grouped on the origin dimension, sample size in brackets.",
                "A fact-table measure crossed with a descriptive dimension. Sample size is shown: an "
                "average over three sales is not worth one over thirty. Simulated dataset.")}[lang]
    svg = bar_chart(["%s  (%d)" % (tr.get(k, k), n) for k, _, n in ps], [m for _, m, _ in ps],
                    L[0], L[1], lambda v: fnum(v, 1, lang), "dwo", 32)
    return figure(svg, L[2])


# ------------------------------------------------------------- radiographies

# Courbes d'entrainement du CNN, recopiees du rapport final « Projet IA »
# (tableau des cinq epoques, confirme par la sortie Keras de la derniere epoque).
XR_EPOCHS = [1, 2, 3, 4, 5]
XR_ACC = {"train": [81.24, 90.62, 95.33, 93.75, 97.22], "val": [90.62, 33.33, 85.94, 100.00, 87.50]}
XR_LOSS = {"train": [0.4649, 0.1916, 0.1208, 0.0830, 0.0797], "val": [0.2092, 1.5490, 0.2925, 0.0042, 0.2757]}


def xr_panel(series, ident, title, desc, ymax, yticks, yfmt, vfmt, notes, lang):
    """Un panneau : entrainement (teinte neutre) contre validation (accent), etiquettes directes."""
    W, H, x0, y0, h = 420, 262, 46, 40, 170
    w = W - x0 - 92
    xmap = lambda e: x0 + (e - 1) / 4 * w
    ymap = lambda v: y0 + h - v / ymax * h
    names = {"fr": {"train": "entraînement", "val": "validation"},
             "en": {"train": "training", "val": "validation"}}[lang]
    ep = {"fr": "Époque", "en": "Epoch"}[lang]
    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="%s-t %s-d">' % (W, H, ident, ident),
           '<title id="%s-t">%s</title><desc id="%s-d">%s</desc>' % (ident, esc(title), ident, esc(desc)),
           '<text class="ch-panel" x="%d" y="18">%s</text>' % (x0 - 38, esc(title))]
    for v in yticks:
        y = ymap(v)
        out.append('<line class="ch-grid" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x0, y, x0 + w, y))
        out.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="end">%s</text>' % (x0 - 8, y + 3.5, esc(yfmt(v))))
    out.append('<line class="ch-axis" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (x0, y0 + h, x0 + w, y0 + h))
    for e in XR_EPOCHS:
        out.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="middle">%d</text>' % (xmap(e), y0 + h + 17, e))
    out.append('<text class="ch-note" x="%.1f" y="%.1f" text-anchor="middle">%s</text>'
               % (x0 + w / 2, y0 + h + 36, esc({"fr": "époque", "en": "epoch"}[lang])))
    ends = {}
    for key, cls in (("train", "ch-line ch-line--ref"), ("val", "ch-line")):
        vals = series[key]
        d = "".join(("M" if i == 0 else "L") + "%.1f %.1f" % (xmap(e), ymap(v)) for i, (e, v) in enumerate(zip(XR_EPOCHS, vals)))
        out.append('<path class="%s" d="%s"/>' % (cls, d))
        for e, v in zip(XR_EPOCHS, vals):
            out.append('<circle class="ch-dot%s" cx="%.1f" cy="%.1f" r="4"><title>%s %d — %s : %s</title></circle>'
                       % (" ch-dot--ref" if key == "train" else "", xmap(e), ymap(v), ep, e, names[key], esc(vfmt(v))))
        ends[key] = ymap(vals[-1])
    # etiquettes directes en bout de courbe, ecartees si elles se chevauchent
    a, b = ends["train"], ends["val"]
    if abs(a - b) < 15:
        mid = (a + b) / 2
        a, b = (mid - 8, mid + 8) if a <= b else (mid + 8, mid - 8)
    out.append('<text class="ch-lab" x="%.1f" y="%.1f">%s</text>' % (x0 + w + 10, a + 4, esc(names["train"])))
    out.append('<text class="ch-lab ch-lab--accent" x="%.1f" y="%.1f">%s</text>' % (x0 + w + 10, b + 4, esc(names["val"])))
    for e, v, txt, above in notes:
        y = ymap(v) + (-11 if above else 19)
        out.append('<text class="ch-val" x="%.1f" y="%.1f" text-anchor="middle">%s</text>' % (xmap(e), y, esc(txt)))
    out.append('</svg>')
    return "".join(out)


def chart_xr_cnn(_, lang):
    pct = lambda v, dec=1: fnum(v, dec, lang) + ("\u202f%" if lang == "fr" else "%")
    acc = xr_panel(XR_ACC, "xra", {"fr": "Exactitude", "en": "Accuracy"}[lang],
                   {"fr": "Exactitude d'entraînement et de validation du CNN sur cinq époques. La validation passe de 90,6 % à 33,3 %, puis à 100 % et 87,5 %.",
                    "en": "CNN training and validation accuracy over five epochs. Validation goes from 90.6% to 33.3%, then to 100% and 87.5%."}[lang],
                   100, [0, 25, 50, 75, 100], lambda v: pct(v, 0), pct,
                   [(2, 33.33, pct(33.33), False), (4, 100, pct(100, 0), True)], lang)
    loss = xr_panel(XR_LOSS, "xrl", {"fr": "Perte", "en": "Loss"}[lang],
                    {"fr": "Perte d'entraînement et de validation du CNN sur cinq époques. La perte de validation culmine à 1,55 à la deuxième époque.",
                     "en": "CNN training and validation loss over five epochs. Validation loss peaks at 1.55 at the second epoch."}[lang],
                    1.6, [0, .5, 1, 1.5], lambda v: fnum(v, 1, lang), lambda v: fnum(v, 3, lang),
                    [(2, 1.549, fnum(1.549, 2, lang), True)], lang)
    cap = {"fr": "CNN entraîné sur 5 165 radiographies, validé sur 67. La courbe d'entraînement monte "
                 "régulièrement ; la validation oscille trop pour être interprétée : sur 67 images, quelques "
                 "radios suffisent à faire varier le score de plusieurs dizaines de points.",
           "en": "CNN trained on 5,165 X-rays, validated on 67. The training curve climbs steadily; validation "
                 "swings too much to be read: with 67 images, a few X-rays are enough to move the score by "
                 "tens of points."}[lang]
    return figure('<div class="ch-pair">%s%s</div>' % (acc, loss), cap)


# ------------------------------------------------------------ accueil & fond

def hero_trace(data):
    """Courbe decorative du hero : conductivite (maree) + temperature (saisons)."""
    W, H = 1200, 320

    def d_of(key, top, bot, n):
        pts = lttb(pairs(data, key), n)
        t0, t1 = pts[0][0], pts[-1][0]
        lo = min(v for _, v in pts); hi = max(v for _, v in pts)
        u = H - top - bot
        return "".join(("M" if i == 0 else "L") + "%.1f %.1f"
                       % ((t - t0) / (t1 - t0) * W, top + u - (v - lo) / ((hi - lo) or 1) * u)
                       for i, (t, v) in enumerate(pts))

    return ('<svg class="trace" viewBox="0 0 %d %d" preserveAspectRatio="none" aria-hidden="true" '
            'focusable="false"><path class="trace-soft" d="%s"/><path class="trace-main" d="%s"/></svg>'
            % (W, H, d_of("conductivite", 130, 14, 520), d_of("temperature", 24, 120, 380)))


def home_spark(data, lang):
    """Graphique interactif de la carte projet : temperature sur seize mois."""
    pts = lttb(pairs(data, "temperature"), 360)
    W, H, x0, y0, h = 640, 190, 34, 16, 146
    w = W - x0 - 8
    t0, t1 = pts[0][0], pts[-1][0]
    lo = min(v for _, v in pts); hi = max(v for _, v in pts)
    yt = nice_ticks(lo, hi, 3)
    ylo, yhi = min(yt[0], lo), max(yt[-1], hi)
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    ymap = lambda v: y0 + h - (v - ylo) / (yhi - ylo) * h
    title = {"fr": "Température de l'eau relevée à la station Port de Bayonne, mars 2025 – juin 2026",
             "en": "Water temperature recorded at the Port of Bayonne station, March 2025 – June 2026"}[lang]
    area = path(pts, xmap, ymap, "ch-area") .replace('d="M', 'd="M')
    # aire : ferme le trace sur la ligne de base
    first, last = pts[0], pts[-1]
    area_d = ("M%.1f %.1f " % (xmap(first[0]), y0 + h)
              + "".join("L%.1f %.1f" % (xmap(t), ymap(v)) for t, v in pts)
              + " L%.1f %.1f Z" % (xmap(last[0]), y0 + h))
    inner = ('<path class="ch-area" d="%s"/>' % area_d) + path(pts, xmap, ymap, "ch-line")
    svg = ('<svg class="ch ch--spark" viewBox="0 0 %d %d" role="img" aria-labelledby="sp-t">'
           '<title id="sp-t">%s</title>%s%s</svg>'
           % (W, H, esc(title),
              axes(x0, y0, w, h, [], yt, xmap, ymap, lambda v: fnum(v, 0, lang) + "°", lambda t: ""),
              hover_group(inner, x0, y0, w, h, t0, t1, ylo, yhi, "°C", 1, lang)))
    return svg


# ---------------------------------------------------------------------- main

def write(name, content):
    p = os.path.join(OUT, name)
    io.open(p, "w", encoding="utf-8", newline="\n").write(content + "\n")
    return len(content)


def main():
    os.makedirs(OUT, exist_ok=True)
    data = load_series()
    rows = load_colorants()
    print("releves capteur : %s · ventes : %d" % (fnum(len(data["t"]), 0), len(rows)))
    total = 0
    for lang in ("fr", "en"):
        for name, fn, src in (("lttb", chart_lttb, data), ("multiples", chart_multiples, data),
                              ("quality", chart_quality, data), ("quarter", chart_dw_quarter, rows),
                              ("origin", chart_dw_origin, rows)):
            n = write("%s.%s.html" % (name, lang), fn(src, lang))
            total += n
            print("   %-22s %6.1f Ko" % ("%s.%s" % (name, lang), n / 1024))
        n = write("xrcnn.%s.html" % lang, chart_xr_cnn(None, lang))
        print("   %-22s %6.1f Ko" % ("xrcnn.%s" % lang, n / 1024))
        n = write("spark.%s.html" % lang, home_spark(data, lang))
        print("   %-22s %6.1f Ko" % ("spark.%s" % lang, n / 1024))
    n = write("trace.html", hero_trace(data))
    print("   %-22s %6.1f Ko" % ("trace", n / 1024))


if __name__ == "__main__":
    main()
