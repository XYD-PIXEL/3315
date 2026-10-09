"""Generate review PDFs from real exported screens; no fabricated research results."""
import json
import zipfile
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'deliverables'
GREEN = HexColor('#234e3b')
MUTED = HexColor('#73806b')

def wrapped(pdf, text, x, y, width, size=12, leading=19):
    pdf.setFont('Helvetica', size)
    line = ''
    for word in text.split():
        proposed = (line + ' ' + word).strip()
        if pdf.stringWidth(proposed, 'Helvetica', size) > width and line:
            pdf.drawString(x, y, line)
            y -= leading
            line = word
        else:
            line = proposed
    if line:
        pdf.drawString(x, y, line)
        y -= leading
    return y

def screens_pdf():
    screens = json.loads((OUT / 'screens.json').read_text())
    pdf = canvas.Canvas(str(OUT / 'prototype-screens.pdf'), pagesize=A4)
    pdf.setTitle('Binwise - prototype screens (INFO3315)')
    width, height = A4
    for i, screen in enumerate(screens):
        pdf.setFillColor(GREEN)
        pdf.setFont('Helvetica-Bold', 19)
        pdf.drawString(42, height - 47, 'binwise.')
        pdf.setFont('Helvetica', 11)
        pdf.drawString(42, height - 69, screen['title'])
        img = Image.open(OUT / 'figma' / (screen['name'] + '.png'))
        max_w, max_h = 310, height - 155
        factor = min(max_w / img.width, max_h / img.height)
        img_w, img_h = img.width * factor, img.height * factor
        pdf.drawImage(ImageReader(img), (width - img_w) / 2, 69 + (max_h - img_h) / 2, img_w, img_h)
        pdf.setFillColor(MUTED)
        pdf.setFont('Helvetica', 8)
        pdf.drawString(42, 43, 'Reference prototype. Simulated recognition, rules and locations.')
        pdf.drawString(42, 29, 'Figma interactions and a share link must be created separately by the group.')
        pdf.drawRightString(width - 42, 43, f'{i+1} / {len(screens)}')
        pdf.showPage()
    pdf.save()

def tasks_pdf():
    pdf = canvas.Canvas(str(OUT / 'user-tasks.pdf'), pagesize=A4)
    pdf.setTitle('Binwise - three participant tasks (INFO3315)')
    width, height = A4
    pdf.setFillColor(GREEN)
    pdf.setFont('Helvetica-Bold', 28)
    pdf.drawString(48, height - 66, 'A little help with sorting.')
    pdf.setFont('Helvetica', 12)
    pdf.drawString(48, height - 92, 'Binwise | Participant tasks | INFO3315')
    pdf.setFillColor(MUTED)
    y = wrapped(pdf, 'We are testing the design, not you. Work at your own pace, and tell us what you are thinking. These are example items, rules and locations; recognition is simulated.', 48, height - 132, width - 96, size=11, leading=17)
    tasks = [
        ('01  An empty bottle', 'You are at the Demo Library bin station with an empty plastic drink bottle. Use the prototype to find where it belongs and what you should do before disposing of it. Tell the facilitator when you are ready.'),
        ('02  A confusing coffee cup', 'You have a takeaway coffee cup made of paper with a plastic lining. The scanner may show similar items. Use the prototype to work out which bin to use and any preparation needed. Tell the facilitator when you are ready.'),
        ('03  A packet the scanner cannot identify', 'You have an empty chip packet. Use the prototype to find what to do if the scan cannot identify it. Tell the facilitator the recommended bin and any instruction you find.'),
    ]
    for title, body in tasks:
        y -= 35
        pdf.setStrokeColor(HexColor('#dfe6d5'))
        pdf.line(48, y + 17, width - 48, y + 17)
        pdf.setFillColor(GREEN)
        pdf.setFont('Helvetica-Bold', 15)
        pdf.drawString(48, y - 10, title)
        pdf.setFillColor(MUTED)
        y = wrapped(pdf, body, 48, y - 38, width - 96, size=12, leading=20)
    pdf.setFont('Helvetica', 9)
    pdf.drawString(48, 45, 'No sign-in or personal information is needed. You may stop at any time.')
    pdf.save()

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    screens_pdf()
    tasks_pdf()
    with zipfile.ZipFile(OUT / 'binwise-figma-kit.zip', 'w', compression=zipfile.ZIP_DEFLATED) as kit:
        for file in sorted((OUT / 'figma').glob('*')):
            kit.write(file, 'figma/' + file.name)
        for file in (ROOT / 'docs').glob('*.md'):
            kit.write(file, 'docs/' + file.name)
        kit.write(OUT / 'screens.json', 'screens.json')
        kit.write(OUT / 'prototype-screens.pdf', 'prototype-screens.pdf')
        kit.write(OUT / 'user-tasks.pdf', 'user-tasks.pdf')
    with zipfile.ZipFile(OUT / 'binwise-web-prototype.zip', 'w', compression=zipfile.ZIP_DEFLATED) as source:
        for folder in ['src', 'public', 'tests', 'scripts', 'docs']:
            for file in sorted((ROOT / folder).rglob('*')):
                if file.is_file() and '__pycache__' not in file.parts:
                    source.write(file, 'binwise/' + str(file.relative_to(ROOT)))
        for filename in ['README.md', '.gitignore', '.gitattributes', '.nvmrc', 'package.json', 'package-lock.json', 'index.html', 'tsconfig.json', 'vite.config.ts', 'playwright.config.ts']:
            source.write(ROOT / filename, 'binwise/' + filename)
    print('Generated two PDFs, Figma kit and web prototype source ZIP.')
