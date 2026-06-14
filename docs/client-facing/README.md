# GrothOS Client-Facing Pilot Kit

Ready-to-send pilot packet artifacts:

- [DOCX: GrothOS Pilot Kit v1](grothos-pilot-kit-v1.docx)
- [PDF: GrothOS Pilot Kit v1](grothos-pilot-kit-v1.pdf)

Source:

- [Markdown source](../client-facing-pilot-kit-v1.md)

## QA Status

- DOCX structural check: passed with `python-docx`.
- DOCX content check: title, intake, Day 7 review, and closeout sections present.
- PDF generation: fallback PDF generated directly from Markdown with ReportLab.
- PDF visual QA: passed after rendering 6 PNG pages with Poppler.
- LibreOffice DOCX render QA: not used for final gate because local `soffice` dependencies were incomplete on this machine.

Use the PDF for send-ready review. Use the DOCX when the client needs an editable working copy.
