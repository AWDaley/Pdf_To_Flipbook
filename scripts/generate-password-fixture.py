"""Optional regeneration: python scripts/generate-password-fixture.py (requires pypdf + cryptography)."""
from pathlib import Path
from pypdf import PdfReader, PdfWriter

fixtures = Path(__file__).resolve().parent.parent / "fixtures"
writer = PdfWriter()
writer.append(PdfReader(fixtures / "pages-1.pdf"))
writer.encrypt("fixture-password", algorithm="AES-256")
writer.write(fixtures / "password-required.pdf")
print("Generated password-required.pdf; test password: fixture-password")
