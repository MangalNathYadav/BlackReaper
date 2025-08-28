import PyPDF2

def extract_pdf_pages(input_pdf, output_pdf, start_page, end_page):
    """
    Extracts pages from input_pdf between start_page and end_page (inclusive)
    and saves them to output_pdf.
    start_page and end_page are 1-indexed.
    """

    # Open the original PDF
    with open(input_pdf, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        writer = PyPDF2.PdfWriter()

        total_pages = len(reader.pages)
        
        # Safety check
        if start_page < 1 or end_page > total_pages or start_page > end_page:
            raise ValueError(f"Invalid page range: PDF has {total_pages} pages.")

        # Loop through the required page range
        for i in range(start_page - 1, end_page):  # Convert to 0-index
            writer.add_page(reader.pages[i])

        # Write to a new PDF
        with open(output_pdf, "wb") as output_file:
            writer.write(output_file)

    print(f"✅ Extracted pages {start_page} to {end_page} into '{output_pdf}'")

# Example usage:
# Extract pages 50 to 100 from 'bigbook.pdf' into 'chapter1.pdf'
extract_pdf_pages("inputpdf.pdf", "chapter1 foundation of biochemistry.pdf", 1, 45)
extract_pdf_pages("inputpdf.pdf", "chapter2 structure and catalysts.pdf", 46, 75)
extract_pdf_pages("inputpdf.pdf", "chapter3 amino acids peptides and proteins.pdf",76, 116)
extract_pdf_pages("inputpdf.pdf", "chapter4 3d structure of protein.pdf", 117,157)
extract_pdf_pages("inputpdf.pdf", "chapter5 protein function.pdf", 158, 190)
extract_pdf_pages("inputpdf.pdf", "chapter6 enzymes.pdf", 191, 238)
extract_pdf_pages("inputpdf.pdf", "chapter7 carbohydrates and glycobiology.pdf", 239,273)
extract_pdf_pages("inputpdf.pdf", "chapter8 nucleotides and nucleic acids.pdf", 274, 306)
extract_pdf_pages("inputpdf.pdf", "chapter9 dna based info technologies.pdf", 307, 343)
extract_pdf_pages("inputpdf.pdf", "chapter10 lipids.pdf", 344, 369)
extract_pdf_pages("inputpdf.pdf", "chapter11 biological membranes and transport.pdf", 370, 421)
extract_pdf_pages("inputpdf.pdf", "chapter12 biosignaling.pdf", 422, 480)
extract_pdf_pages("inputpdf.pdf", "chapter13 bioenergetics and metabolism.pdf", 482, 521)
extract_pdf_pages("inputpdf.pdf", "chapter14 glycolysis glyconeogenesis and pentose phosphate pathway.pdf", 522, 560)
extract_pdf_pages("inputpdf.pdf", "chapter15 princples of metabolic regulation glucose and glycogen.pdf", 561, 601)
extract_pdf_pages("inputpdf.pdf", "chapter16 the citric acid cycle.pdf", 602, 631)
extract_pdf_pages("inputpdf.pdf", "chapter17 fatty acid catabolism.pdf", 632, 656)
extract_pdf_pages("inputpdf.pdf", "chapter18 amino acid oxidation and production of urea.pdf", 657, 690)
extract_pdf_pages("inputpdf.pdf", "chapter19 oxidative phosphorylation and photophysplayion.pdf", 691, 751)
extract_pdf_pages("inputpdf.pdf", "chapter20 carbohydrates biosynthesis in plants and bacteria.pdf", 752, 787)
extract_pdf_pages("inputpdf.pdf", "chapter21 Lipid biosynthesis.pdf", 788, 833)
extract_pdf_pages("inputpdf.pdf", "chapter22 Biosynthesis of amino acids nucleotides and related molecules.pdf", 834, 881)
extract_pdf_pages("inputpdf.pdf", "chapter23 harmonal regulation and integration of mammaliaan metabolism.pdf", 882, 921)
extract_pdf_pages("inputpdf.pdf", "chapter24 DNA replication.pdf", 922, 948)
extract_pdf_pages("inputpdf.pdf", "chapter25 DNA metabolism.pdf", 949,995)
extract_pdf_pages("inputpdf.pdf", "chapter26 RNA metabolism.pdf", 996, 1034)
extract_pdf_pages("inputpdf.pdf", "chapter27 Protein metabolism.pdf", 1035, 1081)
extract_pdf_pages("inputpdf.pdf", "chapter28 Regulation of gene expression.pdf", 1082, 1120)




