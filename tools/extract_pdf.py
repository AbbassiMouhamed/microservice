from __future__ import annotations

from pathlib import Path

from PyPDF2 import PdfReader


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    pdf_path = repo_root / "SmartLingua_PI.pdf"
    out_path = repo_root / "SmartLingua_PI.extracted.txt"

    reader = PdfReader(str(pdf_path))

    out: list[str] = [f"pages: {len(reader.pages)}\n"]
    for i, page in enumerate(reader.pages, start=1):
        try:
            txt = page.extract_text() or ""
        except Exception as exc:  # pragma: no cover
            txt = f"__EXTRACT_ERROR__ {exc}"
        out.append(f"\n\n===== PAGE {i} =====\n{txt}")

    out_path.write_text("".join(out), encoding="utf-8", errors="ignore")
    print(f"Wrote {out_path} (chars={out_path.stat().st_size})")


if __name__ == "__main__":
    main()
