import { test, expect } from "@playwright/test";

test("task 1: scan bottle, read handling guidance and finish", async ({
  page,
}) => {
  await page.goto("/?station=library-03&scenario=confident");
  await expect(
    page.getByRole("heading", { name: "What are you throwing away?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Recycling", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Empty any liquid first.")).toBeVisible();
  await expect(
    page.getByText("Plastic drink bottle", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Got it, thank you" }).click();
  await expect(
    page.getByRole("heading", {
      name: "A little less waste. A little more care.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sort another item" }).click();
  await expect(
    page.getByRole("button", { name: "Scan item", exact: true }),
  ).toBeVisible();
});

test("task 2: resolve uncertain coffee-cup recognition", async ({ page }) => {
  await page.goto("/?scenario=ambiguous");
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Which one looks right?" }),
  ).toBeVisible();
  await expect(page.locator(".candidate-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: /Takeaway coffee cup Paper cup/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "General waste", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Empty leftover coffee first.")).toBeVisible();
});

test("task 3: unrecognised packet has a searchable fallback", async ({
  page,
}) => {
  await page.goto("/?scenario=unknown");
  await page.getByRole("button", { name: "Scan item", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Not quite sure this time." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Search for my item" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search waste items" }),
  ).toBeFocused();
  await page.getByRole("textbox", { name: "Search waste items" }).fill("chips");
  await expect(page.locator(".search-result")).toHaveCount(1);
  await page.getByRole("button", { name: "Chip packet General waste" }).click();
  await expect(
    page.getByRole("heading", { name: "General waste", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Keep it out of the recycling bin."),
  ).toBeVisible();
});

test("no search match offers recovery without invented advice", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Search for an item instead" })
    .click();
  await page.getByRole("textbox").fill("battery");
  await expect(
    page.getByRole("heading", { name: "No match yet." }),
  ).toBeVisible();
  await expect(page.locator(".search-result")).toHaveCount(0);
  await expect(page.getByText(/We won’t guess/)).toBeVisible();
  await page.getByRole("button", { name: "Browse common items" }).click();
  await expect(page.locator(".search-result")).toHaveCount(8);
});

test("none of the candidate matches can open search and return", async ({
  page,
}) => {
  await page.goto("/?scenario=ambiguous&view=candidates");
  await page
    .getByRole("button", { name: "None of these? Search instead" })
    .click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Which one looks right?" }),
  ).toBeVisible();
});

test("denied camera access keeps sample and search working", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        throw new DOMException("Denied", "NotAllowedError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByRole("status")).toContainText("Camera access is off");
  await expect(page.getByText("Sample preview")).toBeVisible();
  await page
    .getByRole("button", { name: "Search for an item instead" })
    .click();
  await expect(page.getByRole("textbox")).toBeVisible();
});

test("searching from a result preserves that result when going back", async ({
  page,
}) => {
  await page.goto("/?view=result&item=coffee-cup");
  await page
    .getByRole("button", { name: "Not your item? Search instead" })
    .click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByText("Takeaway coffee cup", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "General waste", exact: true }),
  ).toBeVisible();
});

test("live camera stream stops when leaving the scanner", async ({ page }) => {
  await page.addInitScript(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const stream = canvas.captureStream();
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => stream,
    });
    Object.assign(window, { testStream: stream });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByText("Live camera", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Search for an item instead" })
    .click();
  const stopped = await page.evaluate(() =>
    (window as unknown as { testStream: MediaStream }).testStream
      .getTracks()
      .every((track) => track.readyState === "ended"),
  );
  expect(stopped).toBe(true);
});

test("unknown QR station never silently uses a different location", async ({
  page,
}) => {
  await page.goto("/?station=unverified-station");
  await expect(
    page.getByRole("heading", { name: "Station not recognised." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Scan item", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Try the demo station" }).click();
  await expect(page.getByText("Demo Library")).toBeVisible();
});

test("missing organics bin does not redirect food into another bin", async ({
  page,
}) => {
  await page.goto("/?station=library-03&view=result&item=banana");
  await expect(
    page.getByRole("heading", { name: "Not at this station." }),
  ).toBeVisible();
  await expect(page.getByText("Keep this item with you")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Got it, thank you" }),
  ).toHaveCount(0);
  await page.goto("/?station=food-court-01&view=result&item=banana");
  await expect(
    page.getByRole("heading", { name: "Food organics" }),
  ).toBeVisible();
  await expect(page.getByText("Remove any stickers first.")).toBeVisible();
});

test("search uses all words, supports aliases and clears results", async ({
  page,
}) => {
  await page.goto("/?view=search");
  await page.getByRole("textbox").fill("food plastic");
  await expect(page.locator(".search-result")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Plastic food container Recycling" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("");
  await expect(page.locator(".search-result")).toHaveCount(8);
});

test("prototype works at narrow phone and desktop widths without overflow or JS errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of [
      "scanner",
      "candidates",
      "unknown",
      "search",
      "result",
      "complete",
    ]) {
      await page.goto(`/?view=${view}`);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("keyboard can search and choose a result", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Search for an item instead" })
    .focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("chips");
  await page.keyboard.press("Tab"); // clear button
  await page.keyboard.press("Tab"); // matching item
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "In the right place." }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "General waste", exact: true }),
  ).toBeVisible();
});
