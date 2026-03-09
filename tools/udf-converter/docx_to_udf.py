import sys
import os

def docx_to_udf():
    if len(sys.argv) < 2:
        print("Usage: python main.py input.docx [template_path]")
        sys.exit(1)

    input_file = sys.argv[1]
    template_path = sys.argv[2] if len(sys.argv) > 2 else "calisanudfcontent.xml"

    if not os.path.isfile(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)

    filename, ext = os.path.splitext(input_file)

    if ext.lower() == '.docx':
        udf_file = filename + '.udf'
        from main import convert_docx_to_udf
        convert_docx_to_udf(input_file, udf_file, template_xml_path=template_path)
    else:
        print("Please provide a .docx file.")
        sys.exit(1)

if __name__ == '__main__':
    docx_to_udf()