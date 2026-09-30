# -*- coding: utf-8 -*-
"""
Genere les graphiques du portfolio en SVG inline, a partir de donnees reelles.

    python build/charts.py

Ecrit chaque graphique dans les pages entre des marqueurs
<!-- chart:NOM:start --> ... <!-- chart:NOM:end -->, comme build/render.mjs le
fait pour les sections generees.

Regles de rendu suivies (cf. skill dataviz) :
  - une seule teinte par serie ; jamais de double axe (petits multiples a la
    place quand les echelles different)
  - grille et axes en filet plein d'1 px, recessifs, jamais en pointilles
  - ligne 2 px, extremites arrondies ; marqueurs >= 8 px avec anneau de surface
  - etiquettes selectives : jamais une valeur sur chaque point
  - legende des qu'il y a deux series ; aucune pour une serie unique
  - aucune couleur en dur : tout passe par les variables CSS du theme, donc
    les graphiques suivent le mode clair et le mode sombre
"""

import csv, io, json, math, os, re, sys, datetime as dt
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = (r"C:\Users\salbe\AppData\Local\Temp\claude"
           r"\c--Users-salbe-Desktop-portfolio-salem"
           r"\c26b0fe2-c364-4745-8698-1d288503b219\scratchpad")
SERIES = os.path.join(SCRATCH, "series.json")
COLORANTS = os.path.join(SCRATCH, "dwzip", "ProjetEntrepotDeDonnees",
                         "Colorants_Entrepot_Complet(fichier initial).csv")

MOIS = ["jan.", "fév.", "mars", "avr.", "mai", "juin",
        "juil.", "août", "sept.", "oct.", "nov.", "déc."]


# --------------------------------------------------------------- utilitaires

def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def fnum(v, dec=1):
    """Formatage francais : virgule decimale, espace fine comme separateur."""
    s = ("%%.%df" % dec) % v
    ent, _, frac = s.partition(".")
    neg = ent.startswith("-")
    ent = ent.lstrip("-")
    groups = []
    while len(ent) > 3:
        groups.insert(0, ent[-3:]); ent = ent[:-3]
    groups.insert(0, ent)
    out = "\u202f".join(groups)
    if frac and int(frac) != 0:
        out += "," + frac
    return ("-" if neg else "") + out


def nice_ticks(lo, hi, count=4):
    """Bornes arrondies lisibles pour un axe."""
    if hi <= lo:
        hi = lo + 1
    raw = (hi - lo) / count
    mag = 10 ** math.floor(math.log10(raw))
    for m in (1, 2, 2.5, 5, 10):
        if raw <= m * mag:
            step = m * mag
            break
    start = math.floor(lo / step) * step
    ticks = []
    v = start
    while v <= hi + step * .5:
        if v >= lo - step * .5:
            ticks.append(round(v, 10))
        v += step
    return ticks


def lttb(points, threshold):
    """Largest-Triangle-Three-Buckets.

    Conserve les points qui portent l'information visuelle — les inflexions et
    les extrema — plutot qu'un point sur n. C'est l'algorithme utilise dans le
    frontend de Vigie Ocean ; il est reimplemente ici pour montrer son effet
    sur les memes donnees.
    """
    n = len(points)
    if threshold >= n or threshold < 3:
        return list(points)
    out = [points[0]]
    every = (n - 2) / (threshold - 2)
    a = 0
    for i in range(threshold - 2):
        lo = int(math.floor((i + 1) * every)) + 1
        hi = min(int(math.floor((i + 2) * every)) + 1, n)
        avg_x = sum(p[0] for p in points[lo:hi]) / max(1, hi - lo)
        avg_y = sum(p[1] for p in points[lo:hi]) / max(1, hi - lo)
        lo2 = int(math.floor(i * every)) + 1
        hi2 = int(math.floor((i + 1) * every)) + 1
        ax, ay = points[a]
        best, best_area = lo2, -1.0
        for j in range(lo2, min(hi2, n)):
            px, py = points[j]
            area = abs((ax - avg_x) * (py - ay) - (ax - px) * (avg_y - ay)) * .5
            if area > best_area:
                best_area, best = area, j
        out.append(points[best])
        a = best
    out.append(points[-1])
    return out


# ------------------------------------------------------------ primitives SVG

def axes(x0, y0, w, h, xticks, yticks, xmap, ymap, yfmt, xfmt):
    """Grille horizontale + graduations. Filets pleins, jamais en pointilles."""
    g = []
    for v in yticks:
        y = ymap(v)
        if y < y0 - .5 or y > y0 + h + .5:
            continue
        g.append('<line class="ch-grid" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
                 % (x0, y, x0 + w, y))
        g.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="end">%s</text>'
                 % (x0 - 8, y + 3.5, esc(yfmt(v))))
    g.append('<line class="ch-axis" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
             % (x0, y0 + h, x0 + w, y0 + h))
    for v in xticks:
        x = xmap(v)
        g.append('<text class="ch-tick" x="%.1f" y="%.1f" text-anchor="middle">%s</text>'
                 % (x, y0 + h + 17, esc(xfmt(v))))
    return "".join(g)


def polyline(pts, xmap, ymap, cls):
    if not pts:
        return ""
    d = []
    pen_up = True
    for x, y in pts:
        if y is None:
            pen_up = True
            continue
        d.append(("M" if pen_up else "L") + "%.1f %.1f" % (xmap(x), ymap(y)))
        pen_up = False
    return '<path class="%s" d="%s"/>' % (cls, "".join(d))


def month_ticks(t0, t1, every=3):
    """Graduations au premier jour d'un mois sur trois."""
    d = dt.datetime.fromtimestamp(t0).replace(day=1, hour=0, minute=0, second=0)
    out = []
    while d.timestamp() <= t1:
        if (d.month - 1) % every == 0:
            out.append(int(d.timestamp()))
        d = (d.replace(day=28) + dt.timedelta(days=8)).replace(day=1)
    return out


def fig(svg, caption, cls="chart"):
    return ('<figure class="%s">%s<figcaption>%s</figcaption></figure>'
            % (cls, svg, caption))


# ----------------------------------------------------- graphique 1 : le LTTB

def chart_lttb(data, lang):
    """Trois panneaux.

    La superposition brut / sous-echantillonne sur seize mois ne demontre rien :
    a cette echelle les deux courbes se confondent exactement, et la serie brute
    disparait sous l'autre. On compare donc deux panneaux de meme echelle, puis
    on zoome sur dix jours pour montrer *quels* points l'algorithme retient.
    """
    ts = data["t"]
    vals = data["series"]["temperature"]["v"]
    raw = [(t, v) for t, v in zip(ts, vals) if v is not None]
    keep = lttb(raw, 1800)

    W = 920
    x0, w = 58, W - 58 - 16
    PANEL, GAP, TOP = 92, 34, 34
    H = TOP + 3 * (PANEL + GAP) + 10

    t0, t1 = raw[0][0], raw[-1][0]
    lo = min(v for _, v in raw); hi = max(v for _, v in raw)
    yt = nice_ticks(lo, hi, 3)
    ylo, yhi = min(yt[0], lo), max(yt[-1], hi)
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    xfmt = lambda t: (lambda d: "%s %s" % (MOIS[d.month - 1], str(d.year)[2:]))(
        dt.datetime.fromtimestamp(t))
    ymap_at = lambda y0: (lambda v: y0 + PANEL - (v - ylo) / (yhi - ylo) * PANEL)

    # --- fenetre de dix jours la plus contrastee, pour le panneau de detail ---
    WIN = 10 * 86400
    best_i, best_var = 0, -1.0
    step = max(1, len(raw) // 400)
    for i in range(0, len(raw), step):
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
    zi = best_i
    zj = zi
    while zj < len(raw) and raw[zj][0] - raw[zi][0] < WIN:
        zj += 1
    zraw = raw[zi:zj]
    zt0, zt1 = zraw[0][0], zraw[-1][0]
    zkeep = [(t, v) for t, v in keep if zt0 <= t <= zt1]
    zlo = min(v for _, v in zraw); zhi = max(v for _, v in zraw)
    pad = (zhi - zlo) * .12 or 1
    zyt = nice_ticks(zlo - pad, zhi + pad, 3)
    zylo, zyhi = min(zyt[0], zlo - pad), max(zyt[-1], zhi + pad)
    zxmap = lambda t: x0 + (t - zt0) / (zt1 - zt0) * w
    zfmt = lambda t: (lambda d: "%d %s" % (d.day, MOIS[d.month - 1]))(
        dt.datetime.fromtimestamp(t))

    ratio = fnum(len(raw) / len(keep), 0)
    L = {"fr": ("Température de l'eau, station Port de Bayonne — mars 2025 à juin 2026",
                "%s points bruts" % fnum(len(raw), 0),
                "%s points conservés" % fnum(len(keep), 0),
                "Détail sur dix jours : les points retenus sont les extrêmes",
                "Les deux premiers panneaux partagent la même échelle. Le troisième zoome sur la "
                "fenêtre la plus agitée de la série : on y voit que LTTB ne prend pas un point sur "
                "%s au hasard — il retient les sommets et les creux, ceux qui décident de la forme "
                "de la courbe." % ratio),
         "en": ("Water temperature, Port of Bayonne station — March 2025 to June 2026",
                "%s raw points" % fnum(len(raw), 0),
                "%s points kept" % fnum(len(keep), 0),
                "Ten-day detail: the points kept are the extremes",
                "The first two panels share one scale. The third zooms on the most agitated window "
                "in the series: LTTB does not take one point in %s at random — it keeps the peaks "
                "and troughs, the ones that decide the shape of the curve." % ratio)}[lang]

    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="lttb-t lttb-d">' % (W, H),
           '<title id="lttb-t">%s</title>' % esc(L[0]),
           '<desc id="lttb-d">%s</desc>' % esc(L[4])]

    for idx, (label, pts, cls) in enumerate(
            ((L[1], raw, "ch-raw"), (L[2], keep, "ch-line"))):
        y0 = TOP + idx * (PANEL + GAP)
        ym = ymap_at(y0)
        out.append('<text class="ch-panel" x="%d" y="%d">%s</text>' % (x0, y0 - 11, esc(label)))
        out.append(axes(x0, y0, w, PANEL, [], yt, xmap, ym,
                        lambda v: fnum(v, 0) + " °C", xfmt))
        out.append(polyline(pts, xmap, ym, cls))

    # panneau de detail
    y0 = TOP + 2 * (PANEL + GAP)
    zym = lambda v: y0 + PANEL - (v - zylo) / (zyhi - zylo) * PANEL
    out.append('<text class="ch-panel" x="%d" y="%d">%s</text>' % (x0, y0 - 11, esc(L[3])))
    out.append(axes(x0, y0, w, PANEL, [zt0, (zt0 + zt1) // 2, zt1], zyt, zxmap, zym,
                    lambda v: fnum(v, 1) + " °C", zfmt))
    out.append(polyline(zraw, zxmap, zym, "ch-raw"))
    out.append(polyline(zkeep, zxmap, zym, "ch-line ch-line--thin"))
    for t, v in zkeep:
        out.append('<circle class="ch-dot" cx="%.1f" cy="%.1f" r="4"/>' % (zxmap(t), zym(v)))
    out.append('<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>'
               % (x0 + w, y0 - 11,
                  ("%d points bruts · %d conservés" % (len(zraw), len(zkeep))) if lang == "fr"
                  else ("%d raw points · %d kept" % (len(zraw), len(zkeep)))))
    out.append('</svg>')
    return fig("".join(out), esc(L[4]))


# --------------------------------------- graphique 2 : petits multiples

def chart_multiples(data, lang):
    """Quatre grandeurs d'echelles differentes : petits multiples, jamais un
    double axe."""
    ts = data["t"]
    keys = ["temperature", "conductivite", "oxygene", "turbidite"]
    PANEL, GAP = 96, 30
    W = 920
    x0, w = 58, W - 58 - 16
    H = 30 + len(keys) * (PANEL + GAP) + 16

    t0, t1 = ts[0], ts[-1]
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    xfmt = lambda t: (lambda d: "%s %s" % (MOIS[d.month - 1], str(d.year)[2:]))(
        dt.datetime.fromtimestamp(t))

    L = {"fr": ("Quatre paramètres physico-chimiques sur seize mois",
                "Chaque panneau porte sa propre échelle : superposer des grandeurs qui n'ont ni la "
                "même unité ni le même ordre de grandeur sur un seul axe inventerait une corrélation. "
                "Séries sous-échantillonnées à 900 points chacune."),
         "en": ("Four physico-chemical parameters over sixteen months",
                "Each panel carries its own scale: overlaying quantities that share neither unit nor "
                "order of magnitude on one axis would invent a correlation. Series downsampled to "
                "900 points each.")}[lang]

    out = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="sm-t sm-d">' % (W, H),
           '<title id="sm-t">%s</title>' % esc(L[0]),
           '<desc id="sm-d">%s</desc>' % esc(L[1])]

    for i, key in enumerate(keys):
        s = data["series"][key]
        pts = [(t, v) for t, v in zip(ts, s["v"]) if v is not None]
        # la turbidite porte des valeurs hors bornes physiques : on borne
        # l'echelle au percentile 99 pour que le signal reste lisible
        vv = sorted(v for _, v in pts)
        hi = vv[int(len(vv) * .99)] if key == "turbidite" else vv[-1]
        lo = vv[0]
        pts = lttb([(t, min(v, hi)) for t, v in pts], 900)

        y0 = 30 + i * (PANEL + GAP)
        yt = nice_ticks(lo, hi, 3)
        ylo, yhi = min(yt[0], lo), max(yt[-1], hi)
        ymap = (lambda a, b, c: lambda v: a + b - (v - c) / (yhi - c) * b)(y0, PANEL, ylo)

        unit = (" " + s["unit"]) if s["unit"] else ""
        out.append('<text class="ch-panel" x="%d" y="%d">%s%s</text>'
                   % (x0, y0 - 11, esc(s["label"]), esc(unit)))
        out.append(axes(x0, y0, w, PANEL,
                        month_ticks(t0, t1) if i == len(keys) - 1 else [],
                        yt, xmap, ymap, lambda v: fnum(v, 0 if abs(v) >= 10 else 1), xfmt))
        out.append(polyline(pts, xmap, ymap, "ch-line"))
        if key == "turbidite":
            out.append('<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>'
                       % (x0 + w, y0 - 8,
                          "échelle bornée au 99e centile" if lang == "fr"
                          else "scale capped at the 99th percentile"))

    out.append('</svg>')
    return fig("".join(out), esc(L[1]))


# ------------------------------- graphique 3 : ce que le controle qualite ecarte

def chart_quality(data, lang):
    """Turbidite brute face a la borne physique du module de validation."""
    BOUND = 5000.0                      # ingestion/validators.py : turbidity_fnu
    ts = data["t"]
    s = data["series"]["turbidite"]
    pts = [(t, v) for t, v in zip(ts, s["v"]) if v is not None]
    over = [(t, v) for t, v in pts if v > BOUND]

    W, H = 920, 260
    x0, y0, w, h = 66, 30, W - 66 - 16, 260 - 30 - 46
    t0, t1 = pts[0][0], pts[-1][0]
    hi = max(v for _, v in pts)
    yt = nice_ticks(0, hi, 4)
    yhi = max(yt[-1], hi)
    xmap = lambda t: x0 + (t - t0) / (t1 - t0) * w
    ymap = lambda v: y0 + h - v / yhi * h
    xfmt = lambda t: (lambda d: "%s %s" % (MOIS[d.month - 1], str(d.year)[2:]))(
        dt.datetime.fromtimestamp(t))

    L = {"fr": ("Turbidité brute et borne physique du contrôle qualité",
                "borne physique — 5 000 FNU",
                "%d mesures au-dessus de la borne, sur %s" % (len(over), fnum(len(pts), 0)),
                "Les bornes viennent de <code>ingestion/validators.py</code>, qui définit une plage "
                "physiquement plausible par paramètre. Une mesure hors bornes n'est pas supprimée : "
                "elle est écartée de façon réversible, et reste dans l'archive."),
         "en": ("Raw turbidity against the quality-control physical bound",
                "physical bound — 5,000 FNU",
                "%d readings above the bound, out of %s" % (len(over), fnum(len(pts), 0)),
                "The bounds come from <code>ingestion/validators.py</code>, which defines a "
                "physically plausible range per parameter. An out-of-bounds reading is not deleted: "
                "it is set aside reversibly and stays in the archive.")}[lang]

    yb = ymap(BOUND)
    svg = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="qc-t qc-d">' % (W, H),
           '<title id="qc-t">%s</title>' % esc(L[0]),
           '<desc id="qc-d">%s %s</desc>' % (esc(L[0]), esc(L[2])),
           axes(x0, y0, w, h, month_ticks(t0, t1), yt, xmap, ymap,
                lambda v: fnum(v, 0), xfmt),
           polyline(lttb(pts, 1400), xmap, ymap, "ch-line ch-line--thin"),
           # regle de seuil : trait plein distinct de la grille, etiquete
           '<line class="ch-threshold" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
           % (x0, yb, x0 + w, yb),
           '<text class="ch-threshold-label" x="%.1f" y="%.1f">%s</text>'
           % (x0 + 6, yb - 7, esc(L[1]))]
    # marqueurs sur les depassements : anneau de surface, rayon 4
    for t, v in over[:40]:
        svg.append('<circle class="ch-dot" cx="%.1f" cy="%.1f" r="4"/>' % (xmap(t), ymap(v)))
    svg.append('<text class="ch-note" x="%d" y="%d" text-anchor="end">%s</text>'
               % (x0 + w, y0 - 10, esc(L[2])))
    svg.append('</svg>')
    return fig("".join(svg), L[3])


# ------------------------------ graphiques 4 et 5 : l'entrepot de donnees

def load_colorants():
    rows = []
    with io.open(COLORANTS, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            try:
                r["quantite_kg"] = float(r["quantite_kg"])
                r["montant_vente"] = float(r["montant_vente"])
                r["score_sante"] = float(r["score_sante"])
                r["score_env"] = float(r["score_env"])
            except (ValueError, KeyError):
                continue
            rows.append(r)
    return rows


def bar_chart(cats, values, title, desc, vfmt, lang, ident, height_per=30):
    """Barres horizontales, serie unique donc une seule teinte et pas de legende."""
    W = 920
    x0 = 190
    w = W - x0 - 96
    H = 26 + len(cats) * height_per + 10
    hi = max(values) or 1
    bar_h = min(18, height_per - 12)          # <= 24 px, l'air reste dans la bande

    svg = ['<svg class="ch" viewBox="0 0 %d %d" role="img" aria-labelledby="%s-t %s-d">'
           % (W, H, ident, ident),
           '<title id="%s-t">%s</title>' % (ident, esc(title)),
           '<desc id="%s-d">%s</desc>' % (ident, esc(desc))]
    for i, (c, v) in enumerate(zip(cats, values)):
        y = 26 + i * height_per
        bw = max(2.0, v / hi * w)
        svg.append('<text class="ch-cat" x="%d" y="%.1f" text-anchor="end">%s</text>'
                   % (x0 - 12, y + bar_h * .5 + 4, esc(c)))
        # extremite arrondie cote valeur, carree cote ligne de base
        svg.append('<path class="ch-bar" d="M%.1f %.1f h%.1f a4 4 0 0 1 4 4 v%.1f a4 4 0 0 1 -4 4 '
                   'h%.1f z"/>' % (x0, y, bw - 4, bar_h - 8, -(bw - 4)))
        svg.append('<text class="ch-val" x="%.1f" y="%.1f">%s</text>'
                   % (x0 + bw + 10, y + bar_h * .5 + 4, esc(vfmt(v))))
    svg.append('<line class="ch-axis" x1="%d" y1="%d" x2="%d" y2="%d"/>'
               % (x0, 26, x0, 26 + len(cats) * height_per - (height_per - bar_h)))
    svg.append('</svg>')
    return "".join(svg)


def chart_dw_quarter(rows, lang):
    agg = defaultdict(float)
    for r in rows:
        agg[r["trimestre"]] += r["quantite_kg"]
    cats = sorted(agg)
    vals = [agg[c] for c in cats]
    L = {"fr": ("Quantité vendue par trimestre",
                "Somme des quantités de la table de faits, agrégée sur la dimension temps.",
                "Agrégation sur la dimension temps : la mesure vient de la table de faits, l'axe "
                "vient de <code>Dim_Temps</code>. C'est exactement ce que le schéma en étoile rend "
                "immédiat."),
         "en": ("Quantity sold per quarter",
                "Sum of quantities from the fact table, aggregated over the time dimension.",
                "Aggregation over the time dimension: the measure comes from the fact table, the "
                "axis from <code>Dim_Temps</code>. This is exactly what the star schema makes "
                "immediate.")}[lang]
    svg = bar_chart(cats, vals, L[0], L[1],
                    lambda v: fnum(v, 0) + " kg", lang, "dwq", 34)
    return fig(svg, L[2])


def chart_dw_origin(rows, lang):
    agg = defaultdict(list)
    for r in rows:
        agg[r["source"]].append(r["score_env"])
    pairs = sorted(((k, sum(v) / len(v), len(v)) for k, v in agg.items()),
                   key=lambda p: -p[1])
    cats = ["%s  (%d)" % (k, n) for k, _, n in pairs]
    vals = [m for _, m, _ in pairs]
    L = {"fr": ("Score environnemental moyen par source d'origine",
                "Moyenne du score environnemental, groupée sur la dimension origine. Effectif entre parenthèses.",
                "Croisement d'une mesure de la table de faits avec une dimension descriptive. "
                "L'effectif est affiché : une moyenne sur trois ventes ne vaut pas une moyenne sur "
                "trente, et le graphique doit le dire."),
         "en": ("Average environmental score by source of origin",
                "Mean environmental score, grouped on the origin dimension. Sample size in brackets.",
                "Crossing a fact-table measure with a descriptive dimension. The sample size is "
                "shown: an average over three sales is not worth an average over thirty, and the "
                "chart should say so.")}[lang]
    svg = bar_chart(cats, vals, L[0], L[1],
                    lambda v: fnum(v, 1), lang, "dwo", 32)
    return fig(svg, L[2])



# ------------------------------------------- fond : trace de donnees reelles

def hero_trace(data, lang):
    """Courbe decorative derriere l'intro, tiree des mesures reelles.

    Deux series normalisees separement sur la hauteur de la boite : la
    conductivite en arriere-plan (son oscillation de maree donne la texture),
    la temperature par-dessus (sa saisonnalite donne la grande forme).
    Purement decoratif, donc aria-hidden ; l'information est ailleurs.
    """
    ts = data["t"]
    W, H = 1200, 300

    def path(key, pad_top, pad_bot, n):
        vals = data["series"][key]["v"]
        pts = [(t, v) for t, v in zip(ts, vals) if v is not None]
        pts = lttb(pts, n)
        t0, t1 = pts[0][0], pts[-1][0]
        lo = min(v for _, v in pts); hi = max(v for _, v in pts)
        if hi <= lo:
            hi = lo + 1
        usable = H - pad_top - pad_bot
        d = []
        for i, (t, v) in enumerate(pts):
            x = (t - t0) / (t1 - t0) * W
            y = pad_top + usable - (v - lo) / (hi - lo) * usable
            d.append(("M" if i == 0 else "L") + "%.1f %.1f" % (x, y))
        return "".join(d)

    return ('      <div class="intro__trace" aria-hidden="true">'
            '<svg viewBox="0 0 %d %d" preserveAspectRatio="none" focusable="false">'
            '<path class="tr-soft" d="%s"/>'
            '<path class="tr-main" d="%s"/>'
            '</svg></div>\n'
            % (W, H, path("conductivite", 110, 10, 560), path("temperature", 20, 120, 420)))


TRACE_NOTE = {
    "fr": '        <p class="intro__trace-note">Fond : température et conductivité relevées à la '
          'station Port de Bayonne, mars 2025 – juin 2026</p>\n',
    "en": '        <p class="intro__trace-note">Background: temperature and conductivity recorded at '
          'the Port of Bayonne station, March 2025 – June 2026</p>\n',
}

# -------------------------------------------------------------- injection

def inject(path, name, content):
    p = os.path.join(ROOT, path)
    s = io.open(p, encoding="utf-8").read()
    a, b = "<!-- chart:%s:start -->" % name, "<!-- chart:%s:end -->" % name
    i, j = s.find(a), s.find(b)
    if i < 0 or j < 0:
        print("   marqueur chart:%s absent de %s" % (name, path)); return False
    s = s[:i + len(a)] + "\n" + content + "\n" + s[j:]
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    return True


def main():
    data = json.load(open(SERIES))
    rows = load_colorants()
    print("series capteur : %s points · colorants : %d ventes"
          % (fnum(len(data["t"]), 0), len(rows)))

    jobs = [
        ("vigie-ocean/index.html",       "fr", [("lttb", chart_lttb), ("multiples", chart_multiples),
                                                ("quality", chart_quality)]),
        ("en/vigie-ocean/index.html",    "en", [("lttb", chart_lttb), ("multiples", chart_multiples),
                                                ("quality", chart_quality)]),
    ]
    for path, lang, charts in jobs:
        for name, fn in charts:
            ok = inject(path, name, fn(data, lang))
            print("   %-28s chart:%-10s %s" % (path, name, "ok" if ok else "—"))

    for path, lang in (("index.html", "fr"), ("en/index.html", "en")):
        ok = inject(path, "trace", hero_trace(data, lang))
        print("   %-28s chart:%-10s %s" % (path, "trace", "ok" if ok else "—"))

    dw = [("entrepot-donnees/index.html", "fr"), ("en/data-warehouse/index.html", "en")]
    for path, lang in dw:
        for name, fn in (("quarter", chart_dw_quarter), ("origin", chart_dw_origin)):
            ok = inject(path, name, fn(rows, lang))
            print("   %-28s chart:%-10s %s" % (path, name, "ok" if ok else "—"))


if __name__ == "__main__":
    main()
