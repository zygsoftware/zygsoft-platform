from image_processor import process_image
from docx.oxml.ns import qn
import re

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

# ---------- Yardımcılar ----------

def _has_ancestor_tag(el, tag_qname):
    try:
        cur = el
        while cur is not None:
            if cur.tag == tag_qname:
                return True
            cur = cur.getparent()
    except Exception:
        pass
    return False

def get_font_color(run):
    try:
        if run.font and run.font.color and run.font.color.rgb:
            rgb = run.font.color.rgb
            if rgb:
                val = int(str(rgb), 16)
                return val if val < (1 << 31) else val - (1 << 32)
    except Exception:
        pass
    return -16777216  # siyah

def _is_bold_in_paragraph(paragraph):
    try:
        for run in paragraph.runs:
            if run.bold:
                return True
            if run._element.find('.//{%s}b' % W_NS) is not None:
                return True

        if paragraph.style and getattr(paragraph.style, "font", None) and paragraph.style.font and paragraph.style.font.bold:
            return True

        pPr = paragraph._element.find('.//{%s}pPr' % W_NS)
        if pPr is not None:
            rPr = pPr.find('.//{%s}rPr' % W_NS)
            if rPr is not None and rPr.find('.//{%s}b' % W_NS) is not None:
                return True

        if paragraph.style:
            try:
                style_element = paragraph.style._element
                if style_element is not None:
                    rPr = style_element.find('.//{%s}rPr' % W_NS)
                    if rPr is not None and rPr.find('.//{%s}b' % W_NS) is not None:
                        return True
            except Exception:
                pass

        return False
    except Exception:
        return False

def _is_italic_in_paragraph(paragraph):
    try:
        for run in paragraph.runs:
            if run.italic:
                return True
            if run._element.find('.//{%s}i' % W_NS) is not None:
                return True

        if paragraph.style and getattr(paragraph.style, "font", None) and paragraph.style.font and paragraph.style.font.italic:
            return True

        pPr = paragraph._element.find('.//{%s}pPr' % W_NS)
        if pPr is not None:
            rPr = pPr.find('.//{%s}rPr' % W_NS)
            if rPr is not None and rPr.find('.//{%s}i' % W_NS) is not None:
                return True

        if paragraph.style:
            try:
                style_element = paragraph.style._element
                if style_element is not None:
                    rPr = style_element.find('.//{%s}rPr' % W_NS)
                    if rPr is not None and rPr.find('.//{%s}i' % W_NS) is not None:
                        return True
            except Exception:
                pass

        return False
    except Exception:
        return False

def _paragraph_has_page_field(paragraph):
    for fs in paragraph._element.findall('.//{%s}fldSimple' % W_NS):
        instr = fs.get('{%s}instr' % W_NS) or ''
        if 'PAGE' in instr.upper():
            return True
    for instr in paragraph._element.findall('.//{%s}instrText' % W_NS):
        if 'PAGE' in (instr.text or '').upper():
            return True
    return False

def _map_alignment(paragraph):
    try:
        align = paragraph.alignment
        if align is not None:
            name = getattr(align, "name", str(align)).lower()
            if "center" in name:
                return 1
            if "right" in name:
                return 2
            if "justify" in name or "distribute" in name:
                return 3

        def _jc_to_alignment(jc_val):
            val = (jc_val or "").lower()
            if val in {"center"}:
                return 1
            if val in {"right", "end"}:
                return 2
            if val in {
                "both", "justify", "distribute", "thaijustify", "thaidistribute",
                "mediumkashida", "highkashida", "lowkashida",
            }:
                return 3
            return 0

        pPr = paragraph._element.find('.//{%s}pPr' % W_NS)
        if pPr is not None:
            jc = pPr.find('.//{%s}jc' % W_NS)
            if jc is not None:
                return _jc_to_alignment(jc.get('{%s}val' % W_NS))

        if paragraph.style is not None:
            style_element = getattr(paragraph.style, "_element", None)
            if style_element is not None:
                pPr = style_element.find('.//{%s}pPr' % W_NS)
                if pPr is not None:
                    jc = pPr.find('.//{%s}jc' % W_NS)
                    if jc is not None:
                        return _jc_to_alignment(jc.get('{%s}val' % W_NS))

        return 0
    except Exception:
        return 0

def _build_tabset_attr(paragraph):
    # pseudo-listlerde tabset kapalı, burada genel fonk.
    try:
        ts = paragraph.paragraph_format.tab_stops
    except Exception:
        ts = None
    if not ts:
        return ""

    def _map_align(a):
        try:
            name = getattr(a, "name", str(a)).lower()
            if "center" in name:
                return 1
            if "right" in name:
                return 2
            if "decimal" in name:
                return 3
            return 0
        except Exception:
            return 0

    def _map_leader(l):
        try:
            name = getattr(l, "name", str(l)).lower()
            if "dots" in name:
                return 1
            if "dashes" in name:
                return 2
            if "line" in name or "heavy" in name:
                return 3
            return 0
        except Exception:
            return 0

    parts = []
    for stop in ts:
        try:
            pos_pt = float(stop.position.pt)
            a = _map_align(getattr(stop, "alignment", None))
            ld = _map_leader(getattr(stop, "leader", None))
            parts.append(f"{pos_pt:.1f}:{a}:{ld}")
        except Exception:
            continue

    return f' TabSet="{",".join(parts)}"' if parts else ""

def _indent_attrs(paragraph):
    try:
        pf = paragraph.paragraph_format
    except Exception:
        pf = None
    if not pf:
        return ""

    def _pt(v):
        try:
            return float(v.pt)
        except Exception:
            return None

    left = _pt(getattr(pf, "left_indent", None))
    right = _pt(getattr(pf, "right_indent", None))
    first = _pt(getattr(pf, "first_line_indent", None))

    attrs = []
    if left is not None:
        attrs.append(f' LeftIndent="{left:.1f}"')
    if right is not None:
        attrs.append(f' RightIndent="{right:.1f}"')
    if first is not None:
        attrs.append(f' FirstLineIndent="{first:.1f}"')
    return "".join(attrs)

# --------- numbering.xml'den gerçek liste girintisi ---------

def _twips_to_pt(v):
    try:
        return float(int(v)) / 20.0
    except Exception:
        return None

def _get_numid_ilvl(paragraph):
    try:
        numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
        if numPr is None:
            return None, None
        numId = numPr.find('.//{%s}numId' % W_NS)
        ilvl = numPr.find('.//{%s}ilvl' % W_NS)
        if numId is None or ilvl is None:
            return None, None
        num_id = numId.get('{%s}val' % W_NS)
        lvl = ilvl.get('{%s}val' % W_NS, '0')
        return int(num_id), int(lvl)
    except Exception:
        return None, None

def _get_numbering_level(document, num_id, ilvl):
    try:
        numbering_part = getattr(document.part, 'numbering_part', None)
        if numbering_part is None:
            return None, None

        root = numbering_part.element
        num_elem = root.find(f'.//{{{W_NS}}}num[@{{{W_NS}}}numId="{num_id}"]')
        if num_elem is None:
            return None, None

        lvl_override = num_elem.find(f'.//{{{W_NS}}}lvlOverride[@{{{W_NS}}}ilvl="{ilvl}"]')
        if lvl_override is not None:
            override_lvl = lvl_override.find(f'.//{{{W_NS}}}lvl')
            if override_lvl is not None:
                return override_lvl, lvl_override

        abstract_num_id_elem = num_elem.find(f'.//{{{W_NS}}}abstractNumId')
        if abstract_num_id_elem is None:
            return None, lvl_override

        abstract_num_id = abstract_num_id_elem.get(f'{{{W_NS}}}val')
        abstract_num = root.find(f'.//{{{W_NS}}}abstractNum[@{{{W_NS}}}abstractNumId="{abstract_num_id}"]')
        if abstract_num is None:
            return None, lvl_override

        lvl = abstract_num.find(f'.//{{{W_NS}}}lvl[@{{{W_NS}}}ilvl="{ilvl}"]')
        return lvl, lvl_override
    except Exception:
        return None, None

def _get_numbering_left_hanging_pt(document, num_id, ilvl):
    try:
        lvl, _ = _get_numbering_level(document, num_id, ilvl)
        if lvl is None:
            return None, None

        pPr = lvl.find(qn('w:pPr'))
        if pPr is None:
            return None, None
        ind = pPr.find(qn('w:ind'))
        if ind is None:
            return None, None

        left = ind.get(qn('w:left'))
        hanging = ind.get(qn('w:hanging'))
        left_pt = _twips_to_pt(left) if left is not None else None
        hanging_pt = _twips_to_pt(hanging) if hanging is not None else None
        return left_pt, hanging_pt
    except Exception:
        pass
    return None, None

def _effective_font_size_pt(run, paragraph, document, default_pt=11):
    try:
        if run is not None and run.font and run.font.size:
            return float(run.font.size.pt)
    except Exception:
        pass
    try:
        if paragraph and paragraph.style and paragraph.style.font and paragraph.style.font.size:
            return float(paragraph.style.font.size.pt)
    except Exception:
        pass
    try:
        normal = document.styles['Normal']
        if normal and normal.font and normal.font.size:
            return float(normal.font.size.pt)
    except Exception:
        pass
    return float(default_pt)

def _get_list_type_from_word_numbering(paragraph, document):
    try:
        numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
        if numPr is None:
            return None

        numId_elem = numPr.find('.//{%s}numId' % W_NS)
        ilvl_elem = numPr.find('.//{%s}ilvl' % W_NS)
        if numId_elem is None or ilvl_elem is None:
            return None

        num_id = numId_elem.get('{%s}val' % W_NS)
        ilvl = int(ilvl_elem.get('{%s}val' % W_NS, '0'))

        lvl, _ = _get_numbering_level(document, num_id, ilvl)
        if lvl is None:
            return None

        num_fmt = lvl.find(f'.//{{{W_NS}}}numFmt')
        if num_fmt is None:
            return None

        fmt_val = num_fmt.get(f'{{{W_NS}}}val')
        if fmt_val == 'bullet':
            return 'bullet'
        return 'number'
    except Exception:
        return None

def _get_number_format_from_word_numbering(paragraph, document):
    try:
        numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
        if numPr is None:
            return None

        numId_elem = numPr.find('.//{%s}numId' % W_NS)
        ilvl_elem = numPr.find('.//{%s}ilvl' % W_NS)
        if numId_elem is None or ilvl_elem is None:
            return None

        num_id = numId_elem.get('{%s}val' % W_NS)
        ilvl = int(ilvl_elem.get('{%s}val' % W_NS, '0'))

        lvl, _ = _get_numbering_level(document, num_id, ilvl)
        if lvl is None:
            return None

        num_fmt = lvl.find(f'.//{{{W_NS}}}numFmt')
        if num_fmt is None:
            return None

        return num_fmt.get(f'{{{W_NS}}}val')
    except Exception:
        return None

def _get_number_start_from_word_numbering(paragraph, document):
    try:
        num_id, ilvl = _get_numid_ilvl(paragraph)
        if num_id is None or ilvl is None:
            return 1

        lvl, lvl_override = _get_numbering_level(document, num_id, ilvl)
        if lvl_override is not None:
            start_override = lvl_override.find(f'.//{{{W_NS}}}startOverride')
            if start_override is not None:
                value = start_override.get(f'{{{W_NS}}}val')
                if value is not None:
                    return max(int(value), 1)

        if lvl is None:
            return 1

        start = lvl.find(f'.//{{{W_NS}}}start')
        if start is None:
            return 1

        value = start.get(f'{{{W_NS}}}val')
        return max(int(value), 1) if value is not None else 1
    except Exception:
        return 1

def _is_empty_paragraph(paragraph):
    if not paragraph.runs:
        return True
    full_text = ''.join(run.text or '' for run in paragraph.runs)
    return not full_text.strip()

_MULTILEVEL_HEADING_RE = re.compile(
    r'^(?:\d+|[IVXLCDM]+)(?:\.(?:\d+|[IVXLCDM]+))+\.?\s+\S'
)

def _is_numbered_heading(paragraph):
    if not paragraph.text:
        return False
    text = paragraph.text.strip()
    if _MULTILEVEL_HEADING_RE.match(text):
        return True

    try:
        style_name = (paragraph.style.name or "").lower()
    except Exception:
        style_name = ""

    if style_name and any(token in style_name for token in ("heading", "başlık", "title")):
        return bool(_NUMBERED_MARKER_RE.match(text))

    numbered_match = _NUMBERED_MARKER_RE.match(text)
    if not numbered_match:
        return False

    marker = numbered_match.group("marker")
    heading_text = (numbered_match.group("text") or "").strip()
    marker_is_heading_like = marker.isdigit() or marker == marker.upper()
    has_explicit_bold = any(getattr(run, "bold", False) for run in getattr(paragraph, "runs", []))

    if marker_is_heading_like and heading_text.endswith(":"):
        return True

    if marker_is_heading_like and has_explicit_bold:
        return True

    return False

# ---------- PSEUDO LIST ----------

_BULLET_MARKERS = ("•", "◦", "▪", "▫", "‣", "-", "*", "–", "—")
_NUMBERED_MARKER_RE = re.compile(r'^(?P<marker>(?:\d+|[ivxlcdm]+|[IVXLCDM]+|[A-Za-z]))[.)]\s+(?P<text>.+)$')
_INLINE_NUMBERED_RE = re.compile(r'(?<!\S)(?P<marker>(?:\d+|[ivxlcdm]+|[IVXLCDM]+|[A-Za-z]))[.)]\s+')
_INLINE_BULLET_RE = re.compile(r'(?:(?<=^)|(?<=\s))(?P<marker>[•◦▪▫‣])\s+')
_INLINE_DASH_BULLET_RE = re.compile(r'(?:^|[ \t]{2,})(?P<marker>[-*–—])\s+')

def _normalize_newlines(s: str) -> str:
    return (s or "").replace("\r\n", "\n").replace("\r", "\n")

def _split_pseudo_list_items(raw_text: str):
    raw = _normalize_newlines(raw_text)
    raw = raw.replace("\t", "\n")
    lines = [ln.strip() for ln in raw.split("\n")]
    lines = [ln for ln in lines if ln != ""]

    items = []

    def _append_inline_marker_items(line: str, matches):
        if len(matches) < 2:
            return False
        appended = 0
        for idx, match in enumerate(matches):
            start = match.end()
            end = matches[idx + 1].start("marker") if idx + 1 < len(matches) else len(line)
            text = line[start:end].strip(" \t,;")
            if text:
                items.append((match.group("marker"), text))
                appended += 1
        return appended >= 2

    def _consume_line(line: str):
        inline_bullet_matches = list(_INLINE_BULLET_RE.finditer(line))
        if _append_inline_marker_items(line, inline_bullet_matches):
            return True

        inline_dash_matches = list(_INLINE_DASH_BULLET_RE.finditer(line))
        if _append_inline_marker_items(line, inline_dash_matches):
            return True

        for mk in _BULLET_MARKERS:
            if line.startswith(mk + " ") or line == mk or line.startswith(mk):
                text = line[len(mk):].strip()
                if text:
                    items.append((mk, text))
                return True

        matches = list(_INLINE_NUMBERED_RE.finditer(line))
        if len(matches) >= 2:
            for idx, match in enumerate(matches):
                start = match.end()
                end = matches[idx + 1].start() if idx + 1 < len(matches) else len(line)
                text = line[start:end].strip(" \t,;")
                if text:
                    items.append((match.group("marker") + ".", text))
            return True

        numbered_match = _NUMBERED_MARKER_RE.match(line)
        if numbered_match:
            items.append((numbered_match.group("marker") + ".", numbered_match.group("text").strip()))
            return True
        return False

    for ln in lines:
        _consume_line(ln)

    return items

def _is_pseudo_list_paragraph(paragraph):
    if _is_empty_paragraph(paragraph):
        return False
    if _is_numbered_heading(paragraph):
        return False

    numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
    if numPr is not None:
        return False

    raw = ''.join((run.text or '') for run in paragraph.runs)
    raw = _normalize_newlines(raw).replace("\t", "\n").strip()
    if not raw:
        return False

    for ln in raw.split("\n"):
        s = ln.strip()
        if not s:
            continue
        if len(list(_INLINE_BULLET_RE.finditer(s))) >= 2:
            return True
        if len(list(_INLINE_DASH_BULLET_RE.finditer(s))) >= 2:
            return True
        for mk in _BULLET_MARKERS:
            if s.startswith(mk):
                return True
        if _NUMBERED_MARKER_RE.match(s):
            return True
        if len(list(_INLINE_NUMBERED_RE.finditer(s))) >= 2:
            return True
    return False

def is_pseudo_list_paragraph(paragraph):
    return _is_pseudo_list_paragraph(paragraph)

def get_list_kind(paragraph, document=None):
    if paragraph is None or _is_empty_paragraph(paragraph):
        return None

    try:
        numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
        if numPr is not None:
            list_type = _get_list_type_from_word_numbering(paragraph, document)
            return 'bullet' if list_type == 'bullet' else 'number'
    except Exception:
        pass

    try:
        raw_text = ''.join((run.text or '') for run in paragraph.runs)
        items = _split_pseudo_list_items(raw_text)
        if items:
            marker = (items[0][0] or "").strip()
            return 'bullet' if marker in _BULLET_MARKERS else 'number'
    except Exception:
        pass

    return None

def is_numbered_heading_paragraph(paragraph):
    return _is_numbered_heading(paragraph)

# ---------- UDF attrs ----------

_BULLET_TAB_INDENT_PT = 36.0
	
def _list_spacing_attrs():
    return ' SpaceBefore="0.0" SpaceAfter="0.0" SpaceAbove="0.0" SpaceBelow="0.0" LineSpacing="0.0"'

def _bullet_list_indent_attrs():
    return f' LeftIndent="{_BULLET_TAB_INDENT_PT:.1f}" FirstLineIndent="0.0"'

def _list_content_attrs():
    return ' SpaceAbove="0.0" SpaceBelow="0.0" Hanging="0.0"'

def _native_bullet_attrs(list_id="1000", list_level=0):
    return f' Bulleted="true" BulletType="BULLET_TYPE_ELLIPSE" ListLevel="{int(list_level)}" ListId="{list_id}"'

def _bullet_display_marker(marker=None):
    return "•"

def _estimate_marker_hanging_pt(marker, font_size_pt=11.0):
    try:
        marker_len = max(len((marker or "").strip()), 1)
        font_size = float(font_size_pt or 11.0)
        width_pt = (marker_len * font_size * 0.34) + 2.0
        return max(6.0, min(width_pt, 16.0))
    except Exception:
        return 8.0

def _pseudo_list_indent_attrs(marker=None, font_size_pt=11.0):
    if marker in _BULLET_MARKERS:
        return _bullet_list_indent_attrs()

    hanging_pt = _estimate_marker_hanging_pt(marker, font_size_pt)
    left_indent_pt = max(hanging_pt + 1.0, 8.0)
    return f' LeftIndent="{left_indent_pt:.1f}" FirstLineIndent="-{hanging_pt:.1f}"'

def _real_list_indent_attrs(paragraph, document):
    try:
        num_id, ilvl = _get_numid_ilvl(paragraph)
        if document and num_id is not None and ilvl is not None:
            list_type = _get_list_type_from_word_numbering(paragraph, document)
            if list_type == 'bullet':
                return _bullet_list_indent_attrs()

            left_pt, hanging_pt = _get_numbering_left_hanging_pt(document, num_id, ilvl)
            attrs = []
            if left_pt is not None:
                text_left_pt = left_pt
                if hanging_pt is not None:
                    text_left_pt = max(left_pt - hanging_pt, 0.0)
                attrs.append(f' LeftIndent="{text_left_pt:.1f}"')
                if hanging_pt is not None and hanging_pt > 0:
                    attrs.append(f' FirstLineIndent="-{hanging_pt:.1f}"')
            return "".join(attrs)
    except Exception:
        pass
    return _pseudo_list_indent_attrs()

def _format_number_marker(counter, fmt_val):
    fmt = (fmt_val or "decimal").lower()
    if fmt == "decimal":
        return f"{counter}."
    if fmt == "lowerletter":
        return f"{chr(ord('a') + ((counter - 1) % 26))}."
    if fmt == "upperletter":
        return f"{chr(ord('A') + ((counter - 1) % 26))}."
    if fmt in {"lowerroman", "upperroman"}:
        numerals = [
            (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
            (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
            (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
        ]
        value = counter
        result = []
        for arabic, roman in numerals:
            while value >= arabic:
                result.append(roman)
                value -= arabic
        roman_text = "".join(result) or str(counter)
        if fmt == "lowerroman":
            roman_text = roman_text.lower()
        return f"{roman_text}."
    return f"{counter}."

# ---------- ANA İŞLEV: process_paragraph ----------

def process_paragraph(paragraph, document, current_offset, styles_map=None):
    EMPTY_PARAGRAPH_PLACEHOLDER = '\u00a0'
    para_text = ""
    para_elements = []
    options = styles_map or {}
    raw_paragraph_text = ''.join((run.text or '') for run in paragraph.runs)
    pseudo_items = _split_pseudo_list_items(raw_paragraph_text)
    force_split_list = len(pseudo_items) >= 2

    if not hasattr(process_paragraph, 'list_counters'):
        process_paragraph.list_counters = {}

    alignment_val = _map_alignment(paragraph)

    numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
    is_real_list = numPr is not None

    # --- PSEUDO LIST ---
    if _is_pseudo_list_paragraph(paragraph) or force_split_list:
        items = pseudo_items

        if items:
            first_run = paragraph.runs[0] if paragraph.runs else None
            bullet_font = "Times New Roman"
            try:
                if first_run and first_run.font and first_run.font.name:
                    bullet_font = first_run.font.name
                elif paragraph.style and paragraph.style.font and paragraph.style.font.name:
                    bullet_font = paragraph.style.font.name
            except Exception:
                pass

            bullet_size = _effective_font_size_pt(first_run, paragraph, document, default_pt=11)
            paragraph_is_bold = _is_bold_in_paragraph(paragraph)
            paragraph_is_italic = _is_italic_in_paragraph(paragraph)
            item_font_color = get_font_color(first_run) if first_run is not None else -16777216
            bullet_bold_attr = ' bold="true"' if paragraph_is_bold else ""
            item_style_attrs = [f'foreground="{item_font_color}"']
            if paragraph_is_bold:
                item_style_attrs.append('bold="true"')
            if paragraph_is_italic:
                item_style_attrs.append('italic="true"')
            item_style_attr_str = " " + " ".join(item_style_attrs) if item_style_attrs else ""

            combined_xml = ""
            combined_text = ""
            offset = current_offset

            for marker, txt in items:
                indent_attr = _pseudo_list_indent_attrs(marker, bullet_size)
                is_bullet_marker = marker in _BULLET_MARKERS
                list_attr = ""
                line = f"{_bullet_display_marker(marker)} {txt}" if is_bullet_marker else f"{marker} {txt}"

                combined_text += line + "\n"

                combined_xml += (
                    f'<paragraph Alignment="{alignment_val}"{indent_attr}{_list_spacing_attrs()}{list_attr}>'
                    f'<content startOffset="{offset}" length="{len(line)}" family="{bullet_font}" '
                    f'size="{int(round(bullet_size))}"{_list_content_attrs()}{item_style_attr_str} />'
                    f'</paragraph>'
                )
                offset += len(line) + 1

            return combined_text, combined_xml, offset

    # --- Normal / gerçek liste ---
    tabset_attr = "" if is_real_list else _build_tabset_attr(paragraph)
    indent_attr = "" if is_real_list else _indent_attrs(paragraph)
    list_indent_attr = _real_list_indent_attrs(paragraph, document) if is_real_list else ""
    list_attrs = _list_spacing_attrs() if is_real_list else ""

    # Inline bullet/num
    real_list_prefix = ""
    real_list_paragraph_attrs = ""
    if is_real_list and not _is_empty_paragraph(paragraph):
        list_type = _get_list_type_from_word_numbering(paragraph, document) or 'bullet'
        num_fmt = _get_number_format_from_word_numbering(paragraph, document)
        num_id, ilvl = _get_numid_ilvl(paragraph)

        if list_type == 'number' and num_id is not None:
            key = f"num_{num_id}_{ilvl or 0}"
            if key not in process_paragraph.list_counters:
                process_paragraph.list_counters[key] = _get_number_start_from_word_numbering(paragraph, document)
            else:
                process_paragraph.list_counters[key] += 1
            real_list_prefix = f"{_format_number_marker(process_paragraph.list_counters[key], num_fmt)} "
        else:
            real_list_prefix = f"{_bullet_display_marker()} "

        first_run = paragraph.runs[0] if paragraph.runs else None
        bullet_font = "Times New Roman"
        try:
            if first_run and first_run.font and first_run.font.name:
                bullet_font = first_run.font.name
            elif paragraph.style and paragraph.style.font and paragraph.style.font.name:
                bullet_font = paragraph.style.font.name
        except Exception:
            pass

        bullet_size = _effective_font_size_pt(first_run, paragraph, document, default_pt=11)
        paragraph_is_bold = _is_bold_in_paragraph(paragraph)
        bullet_bold_attr = ' bold="true"' if paragraph_is_bold else ""

        if real_list_prefix:
            para_text += real_list_prefix
            para_elements.append(
                f'<content startOffset="{current_offset}" length="{len(real_list_prefix)}" '
                f'family="{bullet_font}" size="{int(round(bullet_size))}"{bullet_bold_attr}{_list_content_attrs()} />'
            )
            current_offset += len(real_list_prefix)

    has_page_field = _paragraph_has_page_field(paragraph)
    field_emitted = False

    for run in paragraph.runs:
        if has_page_field:
            if not field_emitted:
                para_elements.append('<field fieldName="PageNumber" fieldType="number"/>')
                field_emitted = True
            if _has_ancestor_tag(run._element, '{%s}fldSimple' % W_NS) \
               or _has_ancestor_tag(run._element, '{%s}fldChar' % W_NS) \
               or _has_ancestor_tag(run._element, '{%s}instrText' % W_NS):
                continue
            if (run.text or '').strip().isdigit():
                continue

        drawings = run._element.findall('.//{%s}drawing' % W_NS)
        if drawings:
            for drawing in drawings:
                image_data, width, height = process_image(drawing, document)
                if image_data:
                    para_elements.append(
                        f'<image imageData="{image_data}" width="{width}" height="{height}" description="Paragraf Resmi"/>'
                    )

        text = run.text or ''
        if not text:
            continue

        font_name = run.font.name or "Times New Roman"
        if run.font.size:
            font_size = run.font.size.pt
        elif paragraph.style and styles_map and getattr(paragraph.style, 'style_id', None) in styles_map:
            font_size = styles_map[paragraph.style.style_id]
        else:
            font_size = 11

        is_bold = False
        is_italic = False
        if run.bold:
            is_bold = True
        if run.italic:
            is_italic = True
        if run._element.find('.//{%s}b' % W_NS) is not None:
            is_bold = True
        if run._element.find('.//{%s}i' % W_NS) is not None:
            is_italic = True

        pPr = paragraph._element.find('.//{%s}pPr' % W_NS)
        if pPr is not None:
            rPr = pPr.find('.//{%s}rPr' % W_NS)
            if rPr is not None:
                if rPr.find('.//{%s}b' % W_NS) is not None:
                    is_bold = True
                if rPr.find('.//{%s}i' % W_NS) is not None:
                    is_italic = True

        if paragraph.style:
            try:
                style_element = paragraph.style._element
                if style_element is not None:
                    rPr = style_element.find('.//{%s}rPr' % W_NS)
                    if rPr is not None:
                        if rPr.find('.//{%s}b' % W_NS) is not None:
                            is_bold = True
                        if rPr.find('.//{%s}i' % W_NS) is not None:
                            is_italic = True
            except Exception:
                pass

        font_col = get_font_color(run)

        style_attrs = [
            f'family="{font_name}"',
            f'size="{int(round(font_size))}"',
            f'foreground="{font_col}"'
        ]
        if is_bold:
            style_attrs.append('bold="true"')
        if is_italic:
            style_attrs.append('italic="true"')
        style_attr_str = " ".join(style_attrs)

        parts = text.split('\t')
        for idx, seg in enumerate(parts):
            if seg:
                para_elements.append(
                    f'<content startOffset="{current_offset}" length="{len(seg)}" {style_attr_str}{_list_content_attrs() if is_real_list else ""} />'
                )
                para_text += seg
                current_offset += len(seg)
            if idx < len(parts) - 1:
                para_elements.append(
                    f'<tab startOffset="{current_offset}" length="1" />'
                )
                para_text += '\t'
                current_offset += 1

    if not para_text and not para_elements:
        para_text = EMPTY_PARAGRAPH_PLACEHOLDER
        para_elements.append(
            f'<content startOffset="{current_offset}" length="1" family="Times New Roman" size="11" />'
        )
        current_offset += 1

    paragraph_element = (
        f'<paragraph Alignment="{alignment_val}"{tabset_attr}{indent_attr}{list_indent_attr}{list_attrs}{real_list_paragraph_attrs}>'
        f'{"".join(para_elements)}</paragraph>'
    )
    para_text += '\n'
    current_offset += 1

    extra_paras = []
    spacing_after = 0
    try:
        if paragraph.paragraph_format and paragraph.paragraph_format.space_after:
            spacing_after = int(paragraph.paragraph_format.space_after.pt * 20)
    except Exception:
        pass

    if spacing_after > 0 and not options.get("suppress_space_after"):
        placeholder = "\u00a0"
        empty_para = (
            f'<paragraph Alignment="0">'
            f'<content startOffset="{current_offset}" length="{len(placeholder)}" '
            f'family="Times New Roman" size="11" />'
            f'</paragraph>'
        )
        para_text += placeholder
        current_offset += len(placeholder)
        extra_paras.append(empty_para)

    return para_text, "".join([paragraph_element] + extra_paras), current_offset
