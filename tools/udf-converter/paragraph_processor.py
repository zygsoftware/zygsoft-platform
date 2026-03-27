from image_processor import process_image
from docx.oxml.ns import qn

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
        if align is None:
            return 0
        name = getattr(align, "name", str(align)).lower()
        if "center" in name:
            return 1
        if "right" in name:
            return 2
        if "justify" in name:
            return 3
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

def _get_numbering_left_hanging_pt(document, num_id, ilvl):
    try:
        numbering_part = document.part.numbering_part
        if numbering_part is None:
            return None, None
        root = numbering_part.element

        abstract_id = None
        for num in root.findall(qn('w:num')):
            if int(num.get(qn('w:numId'))) == int(num_id):
                abs_elem = num.find(qn('w:abstractNumId'))
                if abs_elem is not None:
                    abstract_id = int(abs_elem.get(qn('w:val')))
                break
        if abstract_id is None:
            return None, None

        for absnum in root.findall(qn('w:abstractNum')):
            if int(absnum.get(qn('w:abstractNumId'))) != int(abstract_id):
                continue
            for lvl in absnum.findall(qn('w:lvl')):
                if int(lvl.get(qn('w:ilvl'))) != int(ilvl):
                    continue
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

        numbering_part = getattr(document.part, 'numbering_part', None)
        if numbering_part is None:
            return None

        root = numbering_part.element
        num_elem = root.find(f'.//{{{W_NS}}}num[@{{{W_NS}}}numId="{num_id}"]')
        if num_elem is None:
            return None

        abstract_num_id_elem = num_elem.find(f'.//{{{W_NS}}}abstractNumId')
        if abstract_num_id_elem is None:
            return None

        abstract_num_id = abstract_num_id_elem.get(f'{{{W_NS}}}val')
        abstract_num = root.find(f'.//{{{W_NS}}}abstractNum[@{{{W_NS}}}abstractNumId="{abstract_num_id}"]')
        if abstract_num is None:
            return None

        lvl = abstract_num.find(f'.//{{{W_NS}}}lvl[@{{{W_NS}}}ilvl="{ilvl}"]')
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

def _is_empty_paragraph(paragraph):
    if not paragraph.runs:
        return True
    full_text = ''.join(run.text or '' for run in paragraph.runs)
    return not full_text.strip()

def _is_numbered_heading(paragraph):
    if not paragraph.text:
        return False
    text = paragraph.text.strip()
    import re
    return bool(re.match(r'^\d+\.\s+.+', text) or re.match(r'^[IVX]+\.\s+.+', text))

# ---------- PSEUDO LIST ----------

_BULLET_MARKERS = ("•", "◦", "▪", "▫", "‣", "-", "*", "–", "—")

def _normalize_newlines(s: str) -> str:
    return (s or "").replace("\r\n", "\n").replace("\r", "\n")

def _split_pseudo_list_items(raw_text: str):
    raw = _normalize_newlines(raw_text)
    raw = raw.replace("\t", "\n")
    lines = [ln.strip() for ln in raw.split("\n")]
    lines = [ln for ln in lines if ln != ""]

    items = []

    def _consume_line(line: str):
        for mk in _BULLET_MARKERS:
            if line.startswith(mk + " ") or line == mk or line.startswith(mk):
                text = line[len(mk):].strip()
                if text:
                    items.append((mk, text))
                return True

        if " • " in line or "• " in line:
            parts = [p.strip() for p in line.split("•")]
            parts = [p for p in parts if p]
            if len(parts) >= 2:
                for p in parts:
                    items.append(("•", p.strip()))
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
        for mk in _BULLET_MARKERS:
            if s.startswith(mk):
                return True
    return False

# ---------- UDF attrs ----------

def _list_spacing_attrs():
    return ' SpaceBefore="0.0" SpaceAfter="0.0"'

def _pseudo_list_indent_attrs():
    return ' LeftIndent="36.0" FirstLineIndent="-18.0"'

def _real_list_indent_attrs(paragraph, document):
    try:
        num_id, ilvl = _get_numid_ilvl(paragraph)
        if document and num_id is not None and ilvl is not None:
            left_pt, hanging_pt = _get_numbering_left_hanging_pt(document, num_id, ilvl)
            attrs = []
            if left_pt is not None:
                attrs.append(f' LeftIndent="{left_pt:.1f}"')
            if hanging_pt is not None:
                attrs.append(f' FirstLineIndent="{-hanging_pt:.1f}"')
            return "".join(attrs)
    except Exception:
        pass
    return _pseudo_list_indent_attrs()

# ---------- ANA İŞLEV: process_paragraph ----------

def process_paragraph(paragraph, document, current_offset, styles_map=None):
    EMPTY_PARAGRAPH_PLACEHOLDER = ' '
    para_text = ""
    para_elements = []

    if not hasattr(process_paragraph, 'list_counters'):
        process_paragraph.list_counters = {}

    alignment_val = _map_alignment(paragraph)

    numPr = paragraph._element.find('.//{%s}numPr' % W_NS)
    is_real_list = numPr is not None

    # --- PSEUDO LIST ---
    if _is_pseudo_list_paragraph(paragraph):
        raw = ''.join((run.text or '') for run in paragraph.runs)
        items = _split_pseudo_list_items(raw)

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
            bullet_bold_attr = ' bold="true"' if paragraph_is_bold else ""

            combined_xml = ""
            combined_text = ""
            offset = current_offset

            for mk, txt in items:
                bullet = "• "
                line = bullet + txt

                combined_text += line + "\n"

                combined_xml += (
                    f'<paragraph Alignment="{alignment_val}"{_pseudo_list_indent_attrs()}{_list_spacing_attrs()}>'
                    f'<content startOffset="{offset}" length="{len(bullet)}" family="{bullet_font}" '
                    f'size="{int(round(bullet_size))}"{bullet_bold_attr} />'
                    f'<content startOffset="{offset + len(bullet)}" length="{len(txt)}" family="{bullet_font}" '
                    f'size="{int(round(bullet_size))}" />'
                    f'<content startOffset="{offset + len(line)}" length="1" family="{bullet_font}" size="{int(round(bullet_size))}" />'
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
    if is_real_list and not _is_empty_paragraph(paragraph):
        list_type = _get_list_type_from_word_numbering(paragraph, document) or 'bullet'
        num_id, ilvl = _get_numid_ilvl(paragraph)

        if list_type == 'number' and num_id is not None:
            key = f"num_{num_id}_{ilvl or 0}"
            if key not in process_paragraph.list_counters:
                process_paragraph.list_counters[key] = 0
            process_paragraph.list_counters[key] += 1
            bullet_char = f"{process_paragraph.list_counters[key]}. "
        else:
            bullet_char = "• "

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

        para_text += bullet_char
        para_elements.append(
            f'<content startOffset="{current_offset}" length="{len(bullet_char)}" '
            f'family="{bullet_font}" size="{int(round(bullet_size))}"{bullet_bold_attr} />'
        )
        current_offset += len(bullet_char)

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
                    f'<content startOffset="{current_offset}" length="{len(seg)}" {style_attr_str} />'
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

    para_elements.append(
        f'<content startOffset="{current_offset}" length="1" family="Times New Roman" size="11" />'
    )
    para_text += '\n'
    current_offset += 1

    paragraph_element = (
        f'<paragraph Alignment="{alignment_val}"{tabset_attr}{indent_attr}{list_indent_attr}{list_attrs}>'
        f'{"".join(para_elements)}</paragraph>'
    )

    extra_paras = []
    spacing_after = 0
    try:
        if paragraph.paragraph_format and paragraph.paragraph_format.space_after:
            spacing_after = int(paragraph.paragraph_format.space_after.pt * 20)
    except Exception:
        pass

    if spacing_after > 0:
        placeholder = " \n\t "
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