import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Run from the repository root with the development server already running.
const baseURL = process.env.PROTOTYPE_BASE_URL || "http://127.0.0.1:5173";
const output = path.resolve("deliverables/figma");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const screens = [
  {
    name: "01-scan-bottle",
    query: "?scenario=confident",
    title: "Scan an empty bottle",
  },
  {
    name: "02-result-recycling",
    query: "?view=result&item=bottle",
    title: "Recycling result and handling note",
  },
  {
    name: "03-complete",
    query: "?view=complete&item=bottle",
    title: "Bottle sorting confirmation",
  },
  {
    name: "04-scan-cup",
    query: "?scenario=ambiguous",
    title: "Scan a confusing cup",
  },
  {
    name: "05-candidates",
    query: "?scenario=ambiguous&view=candidates",
    title: "Choose from three candidate items",
  },
  {
    name: "06-result-general",
    query: "?view=result&item=coffee-cup",
    title: "Coffee cup: general waste",
  },
  {
    name: "07-scan-packet",
    query: "?scenario=unknown",
    title: "Scan an unrecognised packet",
  },
  {
    name: "08-unrecognised",
    query: "?scenario=unknown&view=unknown",
    title: "Recognition fallback",
  },
  { name: "09-search", query: "?view=search", title: "Browse common items" },
  {
    name: "10-search-chips",
    query: "?view=search",
    fill: "chips",
    title: "Search for chips",
  },
  {
    name: "11-result-packet",
    query: "?view=result&item=packet",
    title: "Chip packet: general waste",
  },
  {
    name: "12-search-empty",
    query: "?view=search",
    fill: "battery",
    title: "No matching rule: recovery",
  },
  {
    name: "13-missing-bin",
    query: "?view=result&item=banana&station=library-03",
    title: "The station has no food-organics bin",
  },
  {
    name: "14-result-container",
    query: "?view=result&item=container",
    title: "Plastic container: recycling",
  },
  {
    name: "15-result-compostable",
    query: "?view=result&item=compostable-cup",
    title: "Compostable cup: example rule",
  },
  {
    name: "16-station-error",
    query: "?station=unverified",
    title: "Unrecognised QR location",
  },
  {
    name: "17-complete-cup",
    query: "?view=complete&item=coffee-cup",
    title: "Coffee cup sorting confirmation",
  },
  {
    name: "18-complete-packet",
    query: "?view=complete&item=packet",
    title: "Packet sorting confirmation",
  },
  {
    name: "19-result-organics",
    query: "?view=result&item=banana&station=food-court-01",
    title: "Food organics at an equipped station",
  },
  {
    name: "20-imported-photo",
    query: "?scenario=confident",
    importPhoto: true,
    title: "Import a photo from your device",
  },
  {
    name: "21-photo-import-error",
    query: "?scenario=confident",
    invalidPhoto: true,
    title: "Unsupported image: choose another file",
  },
];

// Static SVG: export visible DOM shapes, text and inline SVG illustrations.
// Shadows, gradients, animation and video are not represented as editable layers.
async function vectorSnapshot() {
  return page.locator("main").evaluate((root) => {
    const bounds = root.getBoundingClientRect();
    const escape = (value) =>
      String(value).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&apos;",
          })[c],
      );
    const n = (value) => Math.round(value * 100) / 100;
    const layers = [];
    function visible(element) {
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        parseFloat(style.opacity) !== 0 &&
        element.getBoundingClientRect().width > 0
      );
    }
    function svgCopy(element, box) {
      const clone = element.cloneNode(true);
      const originals = [element, ...element.querySelectorAll("*")];
      const copies = [clone, ...clone.querySelectorAll("*")];
      originals.forEach((original, index) => {
        const style = getComputedStyle(original);
        const copied = copies[index];
        for (const attr of [
          "fill",
          "stroke",
          "stroke-width",
          "stroke-linecap",
          "stroke-linejoin",
          "font-family",
          "font-size",
          "font-weight",
          "text-anchor",
          "opacity",
        ]) {
          const value = style.getPropertyValue(attr);
          if (value) copied.setAttribute(attr, value);
        }
        if (style.transform && style.transform !== "none")
          copied.style.transform = style.transform;
        copied.removeAttribute("class");
      });
      clone.setAttribute("x", n(box.left - bounds.left));
      clone.setAttribute("y", n(box.top - bounds.top));
      clone.setAttribute("width", n(box.width));
      clone.setAttribute("height", n(box.height));
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return clone.outerHTML;
    }
    function text(node, parent) {
      const style = getComputedStyle(parent);
      const size = parseFloat(style.fontSize);
      const lines = [];
      const value = node.textContent ?? "";
      for (let index = 0; index < value.length; index++) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const box = range.getBoundingClientRect();
        if (box.width <= 0 || box.height <= 0) continue;
        let line = lines.find((line) => Math.abs(line.top - box.top) < 1);
        if (!line) {
          line = {
            top: box.top,
            left: box.left,
            bottom: box.bottom,
            value: "",
          };
          lines.push(line);
        }
        line.value += value[index];
      }
      return lines
        .map(
          (line) =>
            `<text x="${n(line.left - bounds.left)}" y="${n(line.bottom - bounds.top - size * 0.2)}" fill="${escape(style.color)}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${style.fontWeight}"${style.letterSpacing !== "normal" ? ` letter-spacing="${escape(style.letterSpacing)}"` : ""}>${escape(line.value)}</text>`,
        )
        .join("");
    }
    function visit(element) {
      if (!visible(element)) return;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const label =
        element.id || element.classList[0] || element.tagName.toLowerCase();
      layers.push(`<g id="${escape(label)}">`);
      if (element instanceof SVGElement) {
        layers.push(svgCopy(element, box));
        layers.push("</g>");
        return;
      }
      if (
        element instanceof HTMLImageElement &&
        element.complete &&
        element.naturalWidth
      ) {
        const canvas = document.createElement("canvas");
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        canvas.getContext("2d").drawImage(element, 0, 0);
        const left = parseFloat(style.paddingLeft) || 0;
        const right = parseFloat(style.paddingRight) || 0;
        const top = parseFloat(style.paddingTop) || 0;
        const bottom = parseFloat(style.paddingBottom) || 0;
        layers.push(
          `<image x="${n(box.left - bounds.left + left)}" y="${n(box.top - bounds.top + top)}" width="${n(box.width - left - right)}" height="${n(box.height - top - bottom)}" href="${canvas.toDataURL("image/png")}" preserveAspectRatio="xMidYMid meet"/>`,
        );
        layers.push("</g>");
        return;
      }
      const background = element.classList.contains("camera-frame")
        ? "#e7eadc"
        : style.backgroundColor;
      const hasBackground =
        background !== "rgba(0, 0, 0, 0)" && background !== "transparent";
      const borders = ["Top", "Right", "Bottom", "Left"].map((side) => ({
        width: parseFloat(style[`border${side}Width`]),
        color: style[`border${side}Color`],
      }));
      if (hasBackground || borders.some((border) => border.width)) {
        const radius = style.borderTopLeftRadius.endsWith("%")
          ? Math.min(box.width, box.height) / 2
          : parseFloat(style.borderTopLeftRadius) || 0;
        const x = n(box.left - bounds.left),
          y = n(box.top - bounds.top);
        const w = n(box.width),
          h = n(box.height);
        const uniform = borders.every(
          (border) =>
            border.width === borders[0].width &&
            border.color === borders[0].color,
        );
        layers.push(
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${n(radius)}" fill="${hasBackground ? escape(background) : "none"}"${uniform && borders[0].width ? ` stroke="${escape(borders[0].color)}" stroke-width="${borders[0].width}"` : ""}/>`,
        );
        if (!uniform) {
          const edges = [
            [x, y, x + w, y],
            [x + w, y, x + w, y + h],
            [x, y + h, x + w, y + h],
            [x, y, x, y + h],
          ];
          borders.forEach((border, index) => {
            if (border.width)
              layers.push(
                `<line x1="${n(edges[index][0])}" y1="${n(edges[index][1])}" x2="${n(edges[index][2])}" y2="${n(edges[index][3])}" stroke="${escape(border.color)}" stroke-width="${border.width}"/>`,
              );
          });
        }
      }
      if (element instanceof HTMLInputElement) {
        layers.push(
          `<text x="${n(box.left - bounds.left)}" y="${n(box.top - bounds.top + box.height / 2 + parseFloat(style.fontSize) * 0.34)}" fill="${escape(element.value ? style.color : "#9a9f90")}" font-family="Arial, sans-serif" font-size="${style.fontSize}">${escape(element.value || element.placeholder)}</text>`,
        );
      }
      element.childNodes.forEach((node) => {
        if (node instanceof Element) visit(node);
        else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
          layers.push(text(node, element));
      });
      layers.push("</g>");
    }
    visit(root);
    return {
      width: n(bounds.width),
      height: n(bounds.height),
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${n(bounds.width)}" height="${n(bounds.height)}" viewBox="0 0 ${n(bounds.width)} ${n(bounds.height)}"><title>Binwise static prototype screen</title>${layers.join("")}</svg>`,
    };
  });
}

try {
  const index = [];
  let samplePhoto;
  for (const screen of screens) {
    await page.goto(new URL(screen.query, baseURL).href);
    await page.locator("main").waitFor();
    if (screen.fill) await page.getByRole("textbox").fill(screen.fill);
    if (screen.name === "01-scan-bottle") {
      const art = await page.locator(".scan-art").evaluate((element) => {
        const clone = element.cloneNode(true);
        clone.removeAttribute("class");
        clone.setAttribute("width", "200");
        clone.setAttribute("height", "230");
        return clone.outerHTML;
      });
      const photoPage = await browser.newPage({
        viewport: { width: 200, height: 230 },
        deviceScaleFactor: 2,
      });
      await photoPage.setContent(`<body style="margin:0">${art}</body>`);
      samplePhoto = await photoPage.screenshot({ omitBackground: true });
      await photoPage.close();
    }
    if (screen.importPhoto) {
      await page.locator('input[type="file"]').setInputFiles({
        name: "bottle.png",
        mimeType: "image/png",
        buffer: samplePhoto,
      });
      await page.getByRole("img", { name: "Imported waste item" }).waitFor();
    }
    if (screen.invalidPhoto) {
      await page.locator('input[type="file"]').setInputFiles({
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Not an image"),
      });
      await page.getByRole("alert").waitFor();
    }
    await page.locator("main").screenshot({
      path: path.join(output, `${screen.name}.png`),
      animations: "disabled",
    });
    const snapshot = await vectorSnapshot();
    await writeFile(path.join(output, `${screen.name}.svg`), snapshot.svg);
    index.push({ ...screen, width: snapshot.width, height: snapshot.height });
    console.log(
      `Exported ${screen.name} (${snapshot.width} × ${snapshot.height})`,
    );
  }
  await writeFile(
    path.resolve("deliverables/screens.json"),
    JSON.stringify(index, null, 2) + "\n",
  );
  await page.setViewportSize({ width: 1440, height: 1040 });
  await page.goto(baseURL);
  await page.screenshot({
    path: path.resolve("deliverables/desktop-preview.png"),
    fullPage: true,
  });
  console.log(
    `Exported ${screens.length} SVG screens, ${screens.length} PNG previews and desktop preview.`,
  );
} finally {
  await browser.close();
}
