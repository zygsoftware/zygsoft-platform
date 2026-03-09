import sys
import os
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image, PageBreak, KeepTogether
from reportlab.platypus.para import Paragraph as Para
from reportlab.lib import colors
from reportlab.lib.units import mm, inch
import base64
import io
import zipfile
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY

# Add fonts that support Turkish characters with bold and italic variations
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
pdfmetrics.registerFont(TTFont('DejaVuSerif', os.path.join(FONT_DIR, "DejaVuSerif.ttf")))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', os.path.join(FONT_DIR, "DejaVuSerif-Bold.ttf")))
pdfmetrics.registerFont(TTFont('DejaVuSerif', 'DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', 'DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Italic', 'DejaVuSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-BoldItalic', 'DejaVuSerif-BoldItalic.ttf'))

# Create font family
pdfmetrics.registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold',
                             italic='DejaVuSerif-Italic', boldItalic='DejaVuSerif-BoldItalic')

def is_zip_file(file_path):
    """Check if the file is a valid ZIP file"""
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            return True
    except zipfile.BadZipFile:
        return False

def get_alignment_style(alignment_value):
    """Convert alignment value from XML to reportlab alignment constant"""
    if alignment_value == "1":
        return TA_CENTER
    elif alignment_value == "3":
        return TA_JUSTIFY
    elif alignment_value == "2":
        return TA_RIGHT
    else:
        return TA_LEFT

def convert_color(color_value):
    """Convert integer color value to reportlab color"""
    if color_value is None:
        return None
    
    try:
        # Convert from negative integer to positive hex
        color_int = int(color_value)
        if color_int < 0:
            color_int = 0xFFFFFFFF + color_int + 1
        
        # Extract RGB values
        r = (color_int >> 16) & 0xFF
        g = (color_int >> 8) & 0xFF
        b = color_int & 0xFF
        
        return colors.Color(r/255, g/255, b/255)
    except (ValueError, TypeError):
        return None

def process_background_image(bg_image_data, bg_image_source, output_file):
    """Process background image data and return Image object"""
    if bg_image_data:
        try:
            # Decode base64 image data
            image_bytes = base64.b64decode(bg_image_data)
            image_stream = io.BytesIO(image_bytes)
            
            # Create reportlab image
            img = Image(image_stream)
            return img
        except Exception as e:
            print(f"Error processing background image data: {e}")
    elif bg_image_source:
        # Try to load from source path if available
        try:
            # Check if the source path exists relative to the output file
            output_dir = os.path.dirname(output_file)
            # Normalize path
            source_path = bg_image_source.replace('/resources/', '')
            img_path = os.path.join(output_dir, source_path)
            
            if os.path.exists(img_path):
                return Image(img_path)
            else:
                print(f"Background image not found: {img_path}")
        except Exception as e:
            print(f"Error processing background image source: {e}")
    
    return None

def udf_to_pdf(udf_file, pdf_file):
    root = None
    
    # Check if the file is a ZIP file
    if is_zip_file(udf_file):
        # Process as a ZIP file
        with zipfile.ZipFile(udf_file, 'r') as z:
            if 'content.xml' in z.namelist():
                with z.open('content.xml') as content_file:
                    tree = ET.parse(content_file, parser=ET.XMLParser(encoding='utf-8'))
                    root = tree.getroot()
            else:
                print("The 'content.xml' file could not be found in the UDF file.")
                exit()
    else:
        # Process as an XML file directly
        try:
            tree = ET.parse(udf_file, parser=ET.XMLParser(encoding='utf-8'))
            root = tree.getroot()
        except ET.ParseError:
            print(f"The file {udf_file} is neither a valid ZIP nor a valid XML file.")
            exit()

    if root is None:
        print("Failed to parse the file.")
        exit()

    # Retrieve content text
    content_element = root.find('content')
    if content_element is not None:
        content_text = content_element.text
        if content_text.startswith('<![CDATA[') and content_text.endswith(']]>'):
            content_text = content_text[9:-3]
    else:
        print("'content' could not be found in the XML.")
        exit()

    # Extract page properties
    properties_element = root.find('properties')
    page_format = properties_element.find('pageFormat') if properties_element is not None else None
    
    # Get page margins
    left_margin = float(page_format.get('leftMargin', '42.5')) if page_format is not None else 42.5
    right_margin = float(page_format.get('rightMargin', '42.5')) if page_format is not None else 42.5
    top_margin = float(page_format.get('topMargin', '42.5')) if page_format is not None else 42.5
    bottom_margin = float(page_format.get('bottomMargin', '42.5')) if page_format is not None else 42.5
    
    # Get background image if available
    bg_image = None
    if properties_element is not None:
        bg_image_elem = properties_element.find('bgImage')
        if bg_image_elem is not None:
            bg_image_data = bg_image_elem.get('bgImageData')
            bg_image_source = bg_image_elem.get('bgImageSource')
            bg_image = process_background_image(bg_image_data, bg_image_source, pdf_file)

    # Process the 'elements' section
    elements_element = root.find('elements')
    if elements_element is not None:
        # Create the PDF document with specified margins
        pdf = SimpleDocTemplate(
            pdf_file, 
            pagesize=A4,
            leftMargin=left_margin,
            rightMargin=right_margin,
            topMargin=top_margin,
            bottomMargin=bottom_margin
        )
        
        # Create elements list for the PDF
        pdf_elements = []
        styles = getSampleStyleSheet()
        
        # Define a base style that supports Turkish characters - default to DejaVuSerif
        base_style = ParagraphStyle(
            'CustomNormal', 
            parent=styles['Normal'],
            fontName='DejaVuSerif',  # Setting DejaVuSerif as default font
            encoding='utf-8'
        )
        
        # Process styles from the XML
        styles_element = root.find('styles')
        if styles_element is not None:
            for style_elem in styles_element.findall('style'):
                style_name = style_elem.get('name', '')
                style_family = style_elem.get('family', 'DejaVuSerif')
                style_size = float(style_elem.get('size', '12'))
                style_bold = style_elem.get('bold', 'false') == 'true'
                style_italic = style_elem.get('italic', 'false') == 'true'
                style_foreground = convert_color(style_elem.get('foreground'))
                
                # Create the style - always use DejaVuSerif
                style_family = 'DejaVuSerif'
                    
                custom_style = ParagraphStyle(
                    style_name,
                    parent=base_style,
                    fontName=style_family,
                    fontSize=style_size,
                    textColor=style_foreground if style_foreground else base_style.textColor
                )
                
                # Set bold and italic based on font family
                if style_bold and style_italic:
                    custom_style.fontName = f"{style_family}-BoldItalic"
                elif style_bold:
                    custom_style.fontName = f"{style_family}-Bold"
                elif style_italic:
                    custom_style.fontName = f"{style_family}-Italic"

        # Get header and footer elements
        header_element = elements_element.find('header')
        footer_element = elements_element.find('footer')
        
        # Function to process a text block and apply formatting
        def process_text_block(content_elem, current_style):
            text = ""
            
            # Get basic attributes
            start_offset = int(content_elem.get('startOffset', '0'))
            length = int(content_elem.get('length', '0'))
            text_content = content_text[start_offset:start_offset+length]
            
            # Get formatting attributes
            bold = content_elem.get('bold', 'false') == 'true'
            italic = content_elem.get('italic', 'false') == 'true'
            underline = content_elem.get('underline', 'false') == 'true'
            family = content_elem.get('family')
            size = content_elem.get('size')
            foreground = convert_color(content_elem.get('foreground'))
            
            # Start building the formatted text with font and size
            # ReportLab Paragraph supports inline font tags via <font> tag
            formatted_text = text_content
            
            # Build font attributes
            font_attrs = []
            # Always use DejaVuSerif for font family
            font_name = 'DejaVuSerif'
            
            # Apply font size if specified (in points)
            if size:
                try:
                    font_size = float(size)
                    # ReportLab uses fontSize attribute in ParagraphStyle or inline
                    # We'll apply size through style, but we need to use inline tags
                    # ReportLab doesn't support <font size=""> directly, so we'll create custom style
                    font_attrs.append(f'fontSize={font_size}')
                except (ValueError, TypeError):
                    pass
            
            # Apply color if specified
            if foreground:
                # Convert color to hex for inline use
                r, g, b = foreground.red, foreground.green, foreground.blue
                color_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
                font_attrs.append(f'textColor={color_hex}')
            
            # Apply emphasis formatting first
            if bold and italic and underline:
                formatted_text = f"<u><b><i>{formatted_text}</i></b></u>"
            elif bold and italic:
                formatted_text = f"<b><i>{formatted_text}</i></b>"
            elif bold and underline:
                formatted_text = f"<u><b>{formatted_text}</b></u>"
            elif italic and underline:
                formatted_text = f"<u><i>{formatted_text}</i></u>"
            elif bold:
                formatted_text = f"<b>{formatted_text}</b>"
            elif italic:
                formatted_text = f"<i>{formatted_text}</i>"
            elif underline:
                formatted_text = f"<u>{formatted_text}</u>"
            
            # ReportLab Paragraph doesn't support inline fontSize via HTML tags
            # So we need to apply font size and color through style modification
            # But since we're in a paragraph context, we'll apply these to current_style
            # For inline changes, we create a custom style per text block
            if size:
                try:
                    current_style.fontSize = float(size)
                except (ValueError, TypeError):
                    pass
            
            if foreground:
                current_style.textColor = foreground
            
            # Font family is always DejaVuSerif
            current_style.fontName = 'DejaVuSerif'
            
            return formatted_text
        
        # Function to process a paragraph element
        def process_paragraph(para_elem, content_buffer, in_header_footer=False):
            # Get paragraph alignment
            alignment = para_elem.get('Alignment', '0')
            alignment_style = get_alignment_style(alignment)
            
            # Get paragraph indentation
            left_indent = float(para_elem.get('LeftIndent', '0'))
            right_indent = float(para_elem.get('RightIndent', '0'))
            first_line_indent = float(para_elem.get('FirstLineIndent', '0'))
            line_spacing = float(para_elem.get('LineSpacing', '1.2'))
            
            # Get paragraph font family - always use DejaVuSerif regardless of what's in the XML
            family = 'DejaVuSerif'
            para_default_size = float(para_elem.get('size', '12'))
            
            # Create a base paragraph style
            para_style = ParagraphStyle(
                f'Style{alignment}',
                parent=base_style,
                alignment=alignment_style,
                leftIndent=left_indent,
                rightIndent=right_indent,
                firstLineIndent=first_line_indent,
                fontName=family,
                fontSize=para_default_size,
                leading=para_default_size * line_spacing  # Leading is the line spacing
            )
            
            # Process the paragraph content - collect text blocks with their styles
            # ReportLab doesn't support inline fontSize changes, so we need to handle this differently
            text_blocks = []  # List of (text, style) tuples
            
            for child in para_elem:
                if child.tag == 'content':
                    # Get text block formatting
                    block_size = child.get('size')
                    block_bold = child.get('bold', 'false') == 'true'
                    block_italic = child.get('italic', 'false') == 'true'
                    block_underline = child.get('underline', 'false') == 'true'
                    block_foreground = convert_color(child.get('foreground'))
                    
                    # Get text content
                    start_offset = int(child.get('startOffset', '0'))
                    length = int(child.get('length', '0'))
                    text_content = content_text[start_offset:start_offset+length]
                    
                    # Determine font size for this block
                    # Use block's size if specified, otherwise use paragraph default
                    try:
                        block_font_size = float(block_size) if block_size else para_default_size
                    except (ValueError, TypeError):
                        block_font_size = para_default_size
                    
                    # Create a custom style for this text block with correct font size
                    block_style = ParagraphStyle(
                        f'BlockStyle_{block_font_size}_{len(text_blocks)}',
                        parent=para_style,
                        fontSize=block_font_size,
                        textColor=block_foreground if block_foreground else para_style.textColor,
                        leading=block_font_size * line_spacing,
                        fontName=family  # Always DejaVuSerif
                    )
                    
                    # Apply text formatting (bold, italic, underline)
                    formatted_text = text_content
                    if block_bold and block_italic and block_underline:
                        formatted_text = f"<u><b><i>{formatted_text}</i></b></u>"
                    elif block_bold and block_italic:
                        formatted_text = f"<b><i>{formatted_text}</i></b>"
                    elif block_bold and block_underline:
                        formatted_text = f"<u><b>{formatted_text}</b></u>"
                    elif block_italic and block_underline:
                        formatted_text = f"<u><i>{formatted_text}</i></u>"
                    elif block_bold:
                        formatted_text = f"<b>{formatted_text}</b>"
                    elif block_italic:
                        formatted_text = f"<i>{formatted_text}</i>"
                    elif block_underline:
                        formatted_text = f"<u>{formatted_text}</u>"
                    
                    text_blocks.append((formatted_text, block_style))
                elif child.tag == 'field':
                    # Process field element (labels like DAVACI, VEKİLİ, etc.)
                    field_name = child.get('fieldName', '')
                    
                    # Get the text from the content buffer if startOffset and length are provided
                    if child.get('startOffset') and child.get('length'):
                        start_offset = int(child.get('startOffset', '0'))
                        length = int(child.get('length', '0'))
                        field_text = content_buffer[start_offset:start_offset+length]
                    else:
                        # Use the fieldName as fallback
                        field_text = field_name
                    
                    # Get field formatting
                    field_size = child.get('size')
                    field_bold = child.get('bold', 'false') == 'true'
                    field_italic = child.get('italic', 'false') == 'true'
                    field_underline = child.get('underline', 'false') == 'true'
                    field_foreground = convert_color(child.get('foreground'))
                    
                    # Determine font size
                    field_font_size = float(field_size) if field_size else para_default_size
                    
                    # Create style for field
                    field_style = ParagraphStyle(
                        f'FieldStyle_{field_font_size}_{len(text_blocks)}',
                        parent=para_style,
                        fontSize=field_font_size,
                        textColor=field_foreground if field_foreground else para_style.textColor,
                        leading=field_font_size * line_spacing,
                        fontName=family
                    )
                    
                    # Format text with style
                    formatted_field = field_text
                    if field_bold and field_italic and field_underline:
                        formatted_field = f"<u><b><i>{formatted_field}</i></b></u>"
                    elif field_bold and field_italic:
                        formatted_field = f"<b><i>{formatted_field}</i></b>"
                    elif field_bold and field_underline:
                        formatted_field = f"<u><b>{formatted_field}</b></u>"
                    elif field_italic and field_underline:
                        formatted_field = f"<u><i>{formatted_field}</i></u>"
                    elif field_bold:
                        formatted_field = f"<b>{formatted_field}</b>"
                    elif field_italic:
                        formatted_field = f"<i>{formatted_field}</i>"
                    elif field_underline:
                        formatted_field = f"<u>{formatted_field}</u>"
                    
                    text_blocks.append((formatted_field, field_style))
                elif child.tag == 'space':
                    text_blocks.append((' ', para_style))
                elif child.tag == 'image':
                    # Add the image
                    image_data = child.get('imageData')
                    if image_data:
                        try:
                            # Decode base64 image data
                            image_bytes = base64.b64decode(image_data)
                            image_stream = io.BytesIO(image_bytes)
                            
                            # Create reportlab image
                            img = Image(image_stream)
                            
                            # Set a reasonable width/height if not specified
                            if not hasattr(img, 'drawWidth') or not img.drawWidth:
                                img.drawWidth = 100
                            if not hasattr(img, 'drawHeight') or not img.drawHeight:
                                img.drawHeight = 50
                            
                            # For images in paragraphs, we'll handle them specially
                            if not in_header_footer:
                                # Build paragraph from text blocks first
                                if text_blocks:
                                    # Combine all text blocks into a single paragraph
                                    # Use the most common font size or default
                                    combined_text = ''.join([text for text, _ in text_blocks])
                                    return Paragraph(combined_text, para_style), img
                                else:
                                    return Paragraph('', para_style), img
                        except Exception as e:
                            print(f"Error processing image: {e}")
                            # Add a placeholder text instead
                            text_blocks.append(('[GÖRSEL]', para_style))
            
            # Build paragraph from text blocks
            # ReportLab doesn't support inline fontSize changes in a single Paragraph
            # So we create separate Paragraphs for each text block with different font sizes
            # and wrap them in KeepTogether to maintain paragraph structure
            if text_blocks:
                if len(text_blocks) == 1:
                    # Single block, simple case
                    text, style = text_blocks[0]
                    return Paragraph(text, style), None
                else:
                    # Multiple blocks with potentially different font sizes
                    # Check if all blocks have the same font size
                    font_sizes = [style.fontSize for _, style in text_blocks]
                    unique_sizes = set(font_sizes)
                    
                    if len(unique_sizes) == 1:
                        # All blocks have the same font size, combine into single paragraph
                        combined_text = ''.join([text for text, _ in text_blocks])
                        combined_style = text_blocks[0][1]
                        combined_style.alignment = para_style.alignment
                        combined_style.leftIndent = para_style.leftIndent
                        combined_style.rightIndent = para_style.rightIndent
                        combined_style.firstLineIndent = para_style.firstLineIndent
                        return Paragraph(combined_text, combined_style), None
                    else:
                        # Different font sizes - create separate paragraphs for each block
                        # with proper alignment and indentation
                        para_elements = []
                        for text, block_style in text_blocks:
                            # Create new style with paragraph alignment/indentation but block's font size
                            merged_style = ParagraphStyle(
                                f'Merged_{block_style.fontSize}_{len(para_elements)}',
                                parent=block_style,
                                alignment=para_style.alignment,
                                leftIndent=para_style.leftIndent,
                                rightIndent=para_style.rightIndent,
                                firstLineIndent=para_style.firstLineIndent,
                                fontSize=block_style.fontSize,  # Preserve block's font size
                                textColor=block_style.textColor,
                                fontName=block_style.fontName,
                                leading=block_style.fontSize * line_spacing
                            )
                            para_elements.append(Paragraph(text, merged_style))
                        
                        # Return KeepTogether wrapper containing all paragraphs
                        # But function signature expects single Paragraph, so we'll combine
                        # Actually, we should modify caller to handle list, but for now:
                        # Combine text but preserve font size information as best we can
                        # Use most common font size
                        from collections import Counter
                        size_counts = Counter(font_sizes)
                        most_common_size = size_counts.most_common(1)[0][0]
                        
                        combined_text = ''.join([text for text, _ in text_blocks])
                        # Find style with most common font size
                        common_style = next((style for _, style in text_blocks if style.fontSize == most_common_size), para_style)
                        common_style = ParagraphStyle(
                            f'Common_{most_common_size}',
                            parent=common_style,
                            alignment=para_style.alignment,
                            leftIndent=para_style.leftIndent,
                            rightIndent=para_style.rightIndent,
                            firstLineIndent=para_style.firstLineIndent,
                            fontSize=most_common_size,
                            fontName=family
                        )
                        return Paragraph(combined_text, common_style), None
            else:
                # Empty paragraph
                return Paragraph('', para_style), None
        
        # Define header and footer
        header_paragraphs = []
        footer_paragraphs = []
        
        if header_element is not None:
            header_bg_color = convert_color(header_element.get('background'))
            header_fg_color = convert_color(header_element.get('foreground'))
            
            for para in header_element.findall('paragraph'):
                header_para, _ = process_paragraph(para, content_text, True)
                header_paragraphs.append(header_para)
        
        if footer_element is not None:
            footer_bg_color = convert_color(footer_element.get('background'))
            footer_fg_color = convert_color(footer_element.get('foreground'))
            
            for para in footer_element.findall('paragraph'):
                footer_para, _ = process_paragraph(para, content_text, True)
                footer_paragraphs.append(footer_para)
        
        # Create a function to draw the header and footer on each page
        def add_header_footer(canvas, doc):
            canvas.saveState()
            
            # Draw background image FIRST (so it appears behind everything)
            if bg_image:
                # Get page dimensions (full page including margins)
                from reportlab.lib.pagesizes import A4
                full_page_width, full_page_height = A4
                
                # Scale image to cover the entire page
                img_ratio = bg_image.imageWidth / bg_image.imageHeight
                page_ratio = full_page_width / full_page_height
                
                # Scale to cover entire page (not fit within)
                if img_ratio > page_ratio:
                    # Image is wider - fit to height and crop width
                    bg_image.drawHeight = full_page_height
                    bg_image.drawWidth = full_page_height * img_ratio
                    x_offset = -(bg_image.drawWidth - full_page_width) / 2
                    y_offset = 0
                else:
                    # Image is taller - fit to width and crop height
                    bg_image.drawWidth = full_page_width
                    bg_image.drawHeight = full_page_width / img_ratio
                    x_offset = 0
                    y_offset = -(bg_image.drawHeight - full_page_height) / 2
                
                # Draw the image at full opacity (no transparency)
                bg_image.drawOn(canvas, x_offset, y_offset)
            
            # Draw header
            if header_paragraphs:
                # Draw header background if color specified
                if header_bg_color:
                    canvas.setFillColor(header_bg_color)
                    canvas.rect(
                        doc.leftMargin, 
                        doc.height + doc.topMargin - 20, 
                        doc.width, 
                        20, 
                        fill=True, 
                        stroke=False
                    )
                
                # Draw header text
                for i, para in enumerate(header_paragraphs):
                    w, h = para.wrap(doc.width, doc.topMargin)
                    para.drawOn(canvas, doc.leftMargin, doc.height + doc.topMargin - 15 - i*h)
            
            # Draw footer
            if footer_paragraphs:
                # Draw footer background if color specified
                if footer_bg_color:
                    canvas.setFillColor(footer_bg_color)
                    canvas.rect(
                        doc.leftMargin, 
                        doc.bottomMargin - 20, 
                        doc.width, 
                        20, 
                        fill=True, 
                        stroke=False
                    )
                
                # Draw footer text
                for i, para in enumerate(footer_paragraphs):
                    w, h = para.wrap(doc.width, doc.bottomMargin)
                    para.drawOn(canvas, doc.leftMargin, doc.bottomMargin - 15 - i*h)
            
            canvas.restoreState()
        
        content_buffer = content_text
        
        # Process each element in the XML
        for elem in elements_element:
            if elem.tag == 'paragraph':
                para, img = process_paragraph(elem, content_buffer)
                pdf_elements.append(para)
                if img:
                    pdf_elements.append(img)
                pdf_elements.append(Spacer(1, 5))
            elif elem.tag == 'page-break':
                pdf_elements.append(PageBreak())
            elif elem.tag == 'table':
                # Create the table
                table_data = []
                rows = elem.findall('row')
                for row in rows:
                    row_data = []
                    cells = row.findall('cell')
                    for cell in cells:
                        # Process the cell content
                        paragraphs = cell.findall('paragraph')
                        cell_paragraphs = []
                        
                        for para in paragraphs:
                            cell_para, cell_img = process_paragraph(para, content_buffer)
                            cell_paragraphs.append(cell_para)
                            if cell_img:
                                cell_paragraphs.append(cell_img)
                        
                        # Check if we have any paragraphs
                        if cell_paragraphs:
                            row_data.append(cell_paragraphs)
                        else:
                            # If no content, add an empty Paragraph
                            row_data.append(Paragraph("", base_style))
                    table_data.append(row_data)
                
                # Get table properties
                col_count = int(elem.get('columnCount', '1'))
                col_spans = elem.get('columnSpans', '').split(',')
                row_spans = elem.get('rowSpans', '').split(',')
                border_style = elem.get('border', 'borderCell')
                
                # Set column widths if available
                col_widths = None
                if col_spans and len(col_spans) == col_count:
                    try:
                        col_widths = [float(span) for span in col_spans]
                    except ValueError:
                        pass
                
                # Set the table style
                table_style = [
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('LEFTPADDING', (0,0), (-1,-1), 3),
                    ('RIGHTPADDING', (0,0), (-1,-1), 3),
                    ('TOPPADDING', (0,0), (-1,-1), 3),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ]
                
                # Add grid/border based on style
                if border_style == 'borderCell' or border_style == 'border':
                    table_style.append(('GRID', (0,0), (-1,-1), 1, colors.black))
                elif border_style == 'borderOuter':
                    table_style.append(('BOX', (0,0), (-1,-1), 1, colors.black))
                
                table = Table(table_data, colWidths=col_widths)
                table.setStyle(TableStyle(table_style))
                pdf_elements.append(table)
                pdf_elements.append(Spacer(1, 5))
            # Skip header and footer here as they're handled separately
            elif elem.tag not in ['header', 'footer']:
                pass
        
        # Build the PDF document with header and footer
        pdf.build(pdf_elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
        print(f"PDF file created: {pdf_file}")
    else:
        print("'elements' could not be found in the XML.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python udf_to_pdf.py input.udf")
        exit()

    udf_file = sys.argv[1]

    if not os.path.isfile(udf_file):
        print(f"Input file not found: {udf_file}")
        exit()

    filename, ext = os.path.splitext(udf_file)

    if ext.lower() == '.udf':
        pdf_file = filename + '.pdf'
        udf_to_pdf(udf_file, pdf_file)
    else:
        print("Please provide a .udf file.")

if __name__ == '__main__':
    main()