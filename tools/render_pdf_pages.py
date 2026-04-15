from __future__ import annotations

import argparse
from pathlib import Path

import fitz  # PyMuPDF


def render_pages(pdf_path: Path, out_dir: Path, pages: list[int], dpi: int) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)

    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)

    for page_num in pages:
        if page_num < 1 or page_num > doc.page_count:
            raise SystemExit(f"Invalid page {page_num}; pdf has {doc.page_count} pages")
        page = doc.load_page(page_num - 1)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out_path = out_dir / f"page-{page_num:02d}.png"
        pix.save(out_path)
        print(f"Rendered page {page_num} -> {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default="SmartLingua_PI.pdf")
    parser.add_argument("--out", default="artifacts/pdf-pages")
    parser.add_argument("--pages", default="11-14")
    parser.add_argument("--dpi", type=int, default=200)
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    out_dir = Path(args.out)

    pages: list[int] = []
    for part in str(args.pages).split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            pages.extend(range(int(a), int(b) + 1))
        else:
            pages.append(int(part))

    render_pages(pdf_path, out_dir, pages=sorted(set(pages)), dpi=args.dpi)


if __name__ == "__main__":
    main()
