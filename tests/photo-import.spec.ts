import { test, expect } from "@playwright/test";

// A decodable 2 × 2 PNG fixture; no external image service is needed.
const photo = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGNQ9rMGIgYIBQASfgKxU8A5NgAAAABJRU5ErkJggg==",
  "base64",
);
const imageFile = (name = "bottle.png") => ({
  name,
  mimeType: "image/png",
  buffer: photo,
});

test("import button opens device picker and the chosen photo can be scanned", async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT"].includes(request.method())) uploads.push(request.url());
  });
  await page.goto("/");
  const picker = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import photo", exact: true }).click();
  await (await picker).setFiles(imageFile());
  await expect(
    page.getByRole("img", { name: "Imported waste item" }),
  ).toBeVisible();
  await expect(page.getByText("Imported photo", { exact: true })).toBeVisible();
  await expect(page.getByText("bottle.png", { exact: true })).toBeVisible();
  const source = await page.getByRole("img").getAttribute("src");
  expect(source).toMatch(/^blob:/);
  await expect(page.getByText(/Photo stays on your device/)).toBeVisible();
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await expect(page.getByRole("img")).toHaveAttribute("src", source!);
  await expect(
    page.getByRole("heading", { name: "Recycling", exact: true }),
  ).toBeVisible();
  expect(uploads).toEqual([]);
});

test("replacement, removal and selecting the same file again release old previews", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = URL.revokeObjectURL.bind(URL);
    const revoked: string[] = [];
    Object.assign(window, { revokedPhotoUrls: revoked });
    URL.revokeObjectURL = (value) => {
      revoked.push(value);
      original(value);
    };
  });
  await page.goto("/");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(imageFile());
  const preview = page.getByRole("img", { name: "Imported waste item" });
  await expect(preview).toBeVisible();
  const first = await preview.getAttribute("src");
  await input.setInputFiles(imageFile("cup.png"));
  await expect(page.getByText("cup.png", { exact: true })).toBeVisible();
  const second = await preview.getAttribute("src");
  expect(second).not.toEqual(first);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(page.getByText("Sample preview")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Import photo", exact: true }),
  ).toBeFocused();
  const revoked = await page.evaluate(
    () =>
      (window as unknown as { revokedPhotoUrls: string[] }).revokedPhotoUrls,
  );
  expect(revoked).toContain(first);
  expect(revoked).toContain(second);
  await input.setInputFiles(imageFile("cup.png"));
  await expect(preview).toBeVisible();
});

test("unsupported, oversized and corrupt files show recovery and preserve a good photo", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(imageFile());
  const preview = page.getByRole("img");
  await expect(preview).toBeVisible();
  const source = await preview.getAttribute("src");
  for (const [file, message] of [
    [
      {
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("not an image"),
      },
      "Choose a JPG",
    ],
    [
      {
        name: "large.png",
        mimeType: "image/png",
        buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
      },
      "too large",
    ],
    [
      {
        name: "broken.png",
        mimeType: "image/png",
        buffer: Buffer.from("not a decodable image"),
      },
      "couldn’t open",
    ],
  ] as const) {
    await input.setInputFiles(file);
    await expect(page.getByRole("alert")).toContainText(message);
    await expect(preview).toHaveAttribute("src", source!);
    await expect(
      page.getByRole("button", { name: "Scan item", exact: true }),
    ).toBeEnabled();
  }
  await input.setInputFiles(imageFile("fixed.png"));
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("fixed.png", { exact: true })).toBeVisible();
});

test("cancelled selection preserves the image and search can return to it", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(imageFile());
  await expect(page.getByRole("img")).toBeVisible();
  await input.setInputFiles([]);
  await expect(page.getByRole("img")).toBeVisible();
  await page
    .getByRole("button", { name: "Search for an item instead" })
    .click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("img")).toBeVisible();
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await page.getByRole("button", { name: "Got it, thank you" }).click();
  await page.getByRole("button", { name: "Sort another item" }).click();
  await expect(page.getByRole("img")).toHaveCount(0);
});

test("importing a photo closes a live camera and switching back clears the photo", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    Object.assign(window, { photoTestStreams: streams });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const stream = canvas.captureStream();
        streams.push(stream);
        return stream;
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByText("Live camera", { exact: true })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(imageFile());
  await expect(page.getByRole("img")).toBeVisible();
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { photoTestStreams: MediaStream[] }
      ).photoTestStreams[0]
        .getTracks()
        .every((track) => track.readyState === "ended"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByText("Live camera", { exact: true })).toBeVisible();
  await expect(page.getByRole("img")).toHaveCount(0);
});

test("a photo can be imported after camera permission is denied", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        throw new DOMException("Denied", "NotAllowedError");
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByRole("status")).toContainText("Camera access is off");
  await page.locator('input[type="file"]').setInputFiles(imageFile());
  await expect(page.getByRole("img")).toBeVisible();
  await expect(
    page.getByText("Camera access is off", { exact: false }),
  ).toHaveCount(0);
});

test("late image decoding cannot restore a photo after a scenario reset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };
  });
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(imageFile());
  await expect(
    page.getByRole("button", { name: "Opening photo…" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /A little uncertainty/ }).click();
  await expect(
    page.getByRole("button", { name: "Import photo", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(600);
  await expect(page.getByRole("img")).toHaveCount(0);
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Which one looks right?" }),
  ).toBeVisible();
});
