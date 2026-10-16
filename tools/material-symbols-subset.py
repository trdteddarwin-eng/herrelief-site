"""Builds fonts/material-symbols-outlined-subset.woff2 (the icon font, cut from 1.1 MB to ~20 KB).

The subset keeps exactly the glyphs the listed icon names shape to in the full font, so
every name renders identically (including the two names that are not real icons,
"colors_spark" and "heating", which the full font draws as a run of partial glyphs).

If you add a new icon name to product.html, index.html or cart.html, it will show as
plain text until you rebuild:
  1. pip install fonttools brotli uharfbuzz
  2. Download the full font: fetch
     https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap
     with a browser user agent, download the woff2 it points to, convert it to TTF
     (fontTools: f=TTFont(p); f.flavor=None; f.save('ms-full.ttf')).
  3. python material-symbols-subset.py ms-full.ttf out.woff2 name1,name2,...   (all names, comma separated)
  4. The product, index and cart pages inline this font as a base64 data URI in <style id="fonts">;
     replace the data URI there and copy out.woff2 to fonts/material-symbols-outlined-subset.woff2.
"""
import sys, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools import subset
full, out = sys.argv[1], sys.argv[2]
names = sys.argv[3].split(',')
ft = TTFont(full); order = ft.getGlyphOrder()
blob = hb.Blob.from_file_path(full)
def shape(fontpath_or_face, text):
    face = hb.Face(hb.Blob.from_file_path(fontpath_or_face)); font = hb.Font(face)
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"liga": True})
    go = TTFont(fontpath_or_face).getGlyphOrder()
    return [go[i.codepoint] for i in buf.glyph_infos]
keep = set()
ref = {}
for n in names:
    g = shape(full, n); ref[n] = g; keep.update(g)
chars = set(''.join(names)) | set(' ')
opts = subset.Options(); opts.layout_closure = False; opts.notdef_outline = True; opts.glyph_names = True
opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.drop_tables = []
s = subset.Subsetter(opts); s.populate(glyphs=sorted(keep), unicodes=[ord(c) for c in chars]); s.subset(ft)
ft.flavor = None; ft.save(out + '.ttf'); ft.flavor = 'woff2'; ft.save(out)
bad = [(n, shape(out + '.ttf', n)) for n in names if shape(out + '.ttf', n) != ref[n]]
for n in names:
    if not all(x in ('',) or not x.startswith(('a','b')) or True for x in ref[n]): pass
print('glyphs kept', len(keep), 'mismatches', bad)
print('colors_spark ->', ref.get('colors_spark'))
print('non-single', {n: ref[n] for n in names if len(ref[n]) != 1})
