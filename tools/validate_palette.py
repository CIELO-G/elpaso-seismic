#!/usr/bin/env python3
"""Validate the site's data colours against a chart surface.

Colour choices that carry meaning are computable, so compute them rather
than eyeballing. This checks the five things that can be measured from the
hexes alone:

  1. Lightness band   OKLCH L inside the mode's band (dark: 0.48-0.67).
                      Outside it a mark either glares or sinks into the
                      surface. The site's original #f57c00 / #5b9dd9 pair
                      failed this on dark, which is why it was replaced.
  2. Chroma floor     OKLCH C >= 0.10. Below it a hue reads as grey.
  3. CVD separation   OKLab dE (x100) between slots under simulated
                      protanopia / deuteranopia (tritanopia reported).
                      >= 8 passes; 6-8 only with secondary encoding
                      (a direct label, a gap, a texture).
  4. Normal-vision    Worst OKLab dE among slots under unsimulated vision.
                      >= 15, hard gate: full-colour readers have to be able
                      to tell two series apart too.
  5. Contrast         WCAG ratio of each mark against the surface, >= 3:1.

Pairs default to adjacent slots (bars, stacks, lines). Use --pairs all for
anything where any two marks can sit side by side: maps, scatter, the
quarry rings.

CVD simulation uses the Machado, Oliveira & Fernandes (2009) matrices at
severity 1.0, applied in linear RGB. OKLab is Ottosson's transform.

Usage:
  python tools/validate_palette.py "#d95926,#3987e5" --surface "#0f1114"
  python tools/validate_palette.py "#e0a13a,#29b6c9" --pairs all
  python tools/validate_palette.py "#7b8ca3" --text --surface "#0f1114"

Exit code 1 if any hard check FAILs.
"""
import argparse, itertools, math, sys

BAND = {"light": (0.43, 0.77), "dark": (0.48, 0.67)}
CHROMA_FLOOR = 0.10
CVD_TARGET, CVD_FLOOR = 8.0, 6.0
NORMAL_FLOOR = 15.0
CONTRAST_MIN = 3.0

# Machado, Oliveira & Fernandes (2009), severity 1.0, linear-RGB space.
CVD = {
    "protan": ((0.152286, 1.052583, -0.204868),
               (0.114503, 0.786281, 0.099216),
               (-0.003882, -0.048116, 1.051998)),
    "deutan": ((0.367322, 0.860646, -0.227968),
               (0.280085, 0.672501, 0.047413),
               (-0.011820, 0.042940, 0.968881)),
    "tritan": ((1.255528, -0.076749, -0.178779),
               (-0.078411, 0.930809, 0.147602),
               (0.004733, 0.691367, 0.303900)),
}


def parse_hex(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError("bad hex: " + h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def to_srgb(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def linear(rgb):
    return tuple(to_linear(c) for c in rgb)


def oklab(lin):
    r, g, b = lin
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(v) ** (1 / 3), v) for v in (l, m, s))
    return (0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_)


def oklch(lin):
    L, a, b = oklab(lin)
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


def simulate(lin, kind):
    m = CVD[kind]
    return tuple(sum(m[i][j] * lin[j] for j in range(3)) for i in range(3))


def dE(lin1, lin2):
    a, b = oklab(lin1), oklab(lin2)
    return 100 * math.dist(a, b)


def relative_luminance(lin):
    r, g, b = lin
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(lin1, lin2):
    a, b = relative_luminance(lin1), relative_luminance(lin2)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("palette", help="comma-separated hex values, in slot order")
    ap.add_argument("--mode", choices=["light", "dark"], default="dark")
    ap.add_argument("--surface", default=None, help="chart surface hex")
    ap.add_argument("--pairs", choices=["adjacent", "all"], default="adjacent")
    ap.add_argument("--text", action="store_true",
                    help="judge as text (4.5:1) rather than as a mark (3:1)")
    args = ap.parse_args()

    hexes = [h for h in (x.strip() for x in args.palette.split(",")) if h]
    surface = args.surface or ("#fcfcfb" if args.mode == "light" else "#1a1a19")
    slots = [(h, linear(parse_hex(h))) for h in hexes]
    surf = linear(parse_hex(surface))
    need = 4.5 if args.text else CONTRAST_MIN

    print(f"\n{len(slots)} slot(s) · {args.mode} · surface {surface} · "
          f"pairs: {args.pairs}\n")
    failed = False

    # 1 — lightness band
    lo, hi = BAND[args.mode]
    out = [(h, oklch(l)[0]) for h, l in slots]
    bad = [(h, L) for h, L in out if not (lo <= L <= hi)]
    if args.text:
        print(f"  [skip] lightness band        not applied to text colours")
    elif bad:
        failed = True
        print(f"  [FAIL] lightness band        outside {lo}-{hi}: " +
              ", ".join(f"{h} L={L:.3f}" for h, L in bad))
    else:
        print(f"  [PASS] lightness band        all inside L {lo}-{hi}")

    # 2 — chroma floor
    bad = [(h, oklch(l)[1]) for h, l in slots if oklch(l)[1] < CHROMA_FLOOR]
    if args.text:
        print(f"  [skip] chroma floor          not applied to text colours")
    elif bad:
        failed = True
        print(f"  [FAIL] chroma floor          below {CHROMA_FLOOR}: " +
              ", ".join(f"{h} C={c:.3f}" for h, c in bad))
    else:
        print(f"  [PASS] chroma floor          all >= {CHROMA_FLOOR}")

    # 3 / 4 — separation
    if len(slots) > 1:
        pairs = (list(zip(slots, slots[1:])) if args.pairs == "adjacent"
                 else list(itertools.combinations(slots, 2)))

        worst_n = min(((dE(a[1], b[1]), a[0], b[0]) for a, b in pairs))
        if worst_n[0] < NORMAL_FLOOR:
            failed = True
            print(f"  [FAIL] normal-vision floor   worst {worst_n[1]}<->{worst_n[2]} "
                  f"dE {worst_n[0]:.1f} (need >= {NORMAL_FLOOR})")
        else:
            print(f"  [PASS] normal-vision floor   worst {worst_n[1]}<->{worst_n[2]} "
                  f"dE {worst_n[0]:.1f}")

        for kind in ("protan", "deutan"):
            w = min(((dE(simulate(a[1], kind), simulate(b[1], kind)), a[0], b[0])
                     for a, b in pairs))
            if w[0] < CVD_FLOOR:
                failed = True
                state = "FAIL"
            elif w[0] < CVD_TARGET:
                state = "WARN"
            else:
                state = "PASS"
            print(f"  [{state}] CVD {kind:<8}         worst {w[1]}<->{w[2]} "
                  f"dE {w[0]:.1f}" +
                  ("  (legal only with secondary encoding)" if state == "WARN" else ""))

        w = min(((dE(simulate(a[1], "tritan"), simulate(b[1], "tritan")), a[0], b[0])
                 for a, b in pairs))
        print(f"  [info] CVD tritan            worst {w[1]}<->{w[2]} dE {w[0]:.1f}")

    # 5 — contrast
    bad = [(h, contrast(l, surf)) for h, l in slots if contrast(l, surf) < need]
    if bad:
        failed = True
        print(f"  [FAIL] contrast vs surface   below {need}:1: " +
              ", ".join(f"{h} {c:.2f}" for h, c in bad))
    else:
        worst = min(contrast(l, surf) for _, l in slots)
        print(f"  [PASS] contrast vs surface   all >= {need}:1 (worst {worst:.2f})")

    print("\n  => " + ("FAILED - fix the marked checks" if failed
                       else "ALL CHECKS PASS") + "\n")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
