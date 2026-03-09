from docx.oxml.ns import qn
from docx import Document

def process_table(table, document, current_offset):
    from paragraph_processor import process_paragraph
    table_text = ""
    rows = []
    
    # Get table properties
    column_count = len(table.columns)
    
    # Calculate column widths (simplified - use equal distribution)
    column_spans = ",".join(["100"] * column_count)  # Equal width columns
    
    # Check table borders (simplified - assume borders by default)
    border_type = "borderCell"  # Default to visible borders
    
    # Process table rows
    for row_index, row in enumerate(table.rows):
        cells = []
        for cell in row.cells:
            cell_text, cell_elements, new_offset = process_cell(cell, document, current_offset)
            cells.append(f'<cell>{"".join(cell_elements)}</cell>')
            table_text += cell_text
            current_offset = new_offset

        rows.append(f'<row rowName="row{row_index + 1}" rowType="dataRow">{"".join(cells)}</row>')

    table_element = f'<table tableName="Sabit" columnCount="{column_count}" columnSpans="{column_spans}" border="{border_type}">{"".join(rows)}</table>'
    return table_text, table_element, current_offset


def process_cell(cell, document, current_offset):
    cell_text = ""
    cell_elements = []
    original_offset = current_offset
    
    # Get paragraphs from the cell
    paragraphs = cell.paragraphs
    
    for i, paragraph in enumerate(paragraphs):
        para_text, para_elements, new_offset = process_paragraph(paragraph, document, current_offset, {})
        cell_text += para_text
        cell_elements.append(para_elements)
        current_offset = new_offset
        
        # Add a line break between paragraphs, but not after the last paragraph
        if i < len(paragraphs) - 1 and para_text.strip():
            cell_text += '\n'
            cell_elements.append(f'<content startOffset="{current_offset}" length="1" family="Times New Roman" size="10" />')
            current_offset += 1

    # If cell is empty, add a space character
    if not cell_text:
        cell_text = " "
        cell_elements.append(f'<content startOffset="{current_offset}" length="1" family="Times New Roman" size="10" />')
        current_offset += 1

    return cell_text, cell_elements, current_offset
