# Production UI smoke — Windows

The Codex browser exercised the production service on loopback port 4173 with its per-launch capability. The screenshots are from actual interactions, not mockups.

1. Imported the original ten-page `fixtures/fieldnotes.pdf` through the file chooser. The PDF rendered sequentially and opened in the shared animated reader.
2. Restarted from development into production and reopened the project from its filesystem-backed library.
3. Changed title to “Fieldnotes · Quiet places”, selected background `#dce5db`, toggled cover-alone off (pages 1–2) then back on (page 1), and saved.
4. Verified revision increased from 3 to 4 while current build remained `1544525c-b9f8-4630-acf0-ff32685321c2`: appearance did not reconvert the PDF.
5. Returned to the library, reopened the saved project, and exported through the UI with original-PDF inclusion unchecked. Both folder and ZIP were created; ZIP size 2,709,655 bytes.
6. Returned to preview and opened source spread 2–3. `reader-spread.png` shows the saved production appearance.

This smoke used the initial illustration edition of the source PDF. The final M0 fixture also includes licensed NASA photographic content; see its attribution and current motion evidence.
