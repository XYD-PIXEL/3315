import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Category, Item, Scenario, Screen } from "./data";
import { categories, items, searchItems, stations } from "./data";
import Icon from "./Icon";
import ItemArt from "./ItemArt";
import { useImportedPhoto } from "./useImportedPhoto";

const params = new URLSearchParams(window.location.search);
const initialScenario = (
  ["confident", "ambiguous", "unknown"].includes(params.get("scenario") ?? "")
    ? params.get("scenario")
    : "confident"
) as Scenario;
const stationId = params.get("station") ?? "library-03";
const station = stations[stationId as keyof typeof stations];
const exportScreens: Screen[] = [
  "scanner",
  "candidates",
  "unknown",
  "search",
  "result",
  "complete",
];
const initialScreen = !station
  ? "station-error"
  : exportScreens.includes(params.get("view") as Screen)
    ? (params.get("view") as Screen)
    : "scanner";
const scenarioLabels: Record<
  Scenario,
  { number: string; title: string; subtitle: string }
> = {
  confident: {
    number: "01",
    title: "A clear match",
    subtitle: "Scan an empty plastic bottle",
  },
  ambiguous: {
    number: "02",
    title: "A little uncertainty",
    subtitle: "Choose between similar cups",
  },
  unknown: {
    number: "03",
    title: "A helpful fallback",
    subtitle: "Search for a chip packet",
  },
};

function BinTag({
  category,
  small = false,
}: {
  category: Category;
  small?: boolean;
}) {
  const bin = categories[category];
  return (
    <span
      className={`bin-tag ${small ? "small" : ""}`}
      style={{ background: bin.background, color: bin.color }}
    >
      <Icon name={bin.icon} size={small ? 13 : 16} />
      {bin.short}
    </span>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [found, setFound] = useState<Item>(
    items.find((item) => item.id === params.get("item")) ?? items[0],
  );
  const [query, setQuery] = useState("");
  const [searchOrigin, setSearchOrigin] = useState<Screen>("scanner");
  const [cameraWanted, setCameraWanted] = useState(
    params.get("camera") === "live",
  );
  const [cameraRequest, setCameraRequest] = useState(0);
  const [cameraState, setCameraState] = useState<
    "sample" | "loading" | "live" | "error"
  >("sample");
  const [cameraMessage, setCameraMessage] = useState("");
  const [showReturn, setShowReturn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const importPhotoButtonRef = useRef<HTMLButtonElement>(null);
  const imported = useImportedPhoto();
  const firstRender = useRef(true);
  const sample =
    scenario === "confident"
      ? items[0]
      : scenario === "ambiguous"
        ? items[1]
        : items[4];
  const results = searchItems(query);
  const bin = categories[found.category];
  const available = !!station?.bins.includes(found.category);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (screen === "search") inputRef.current?.focus();
    else headingRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    if (screen !== "matching") return;
    const timer = window.setTimeout(() => {
      if (scenario === "confident") {
        setFound(items[0]);
        setScreen("result");
      } else setScreen(scenario === "ambiguous" ? "candidates" : "unknown");
    }, 750);
    return () => window.clearTimeout(timer);
  }, [screen, scenario]);

  useEffect(() => {
    if (!cameraWanted || screen !== "scanner") {
      setCameraState("sample");
      return;
    }
    let cancelled = false;
    let activeStream: MediaStream | undefined;
    setCameraState("loading");
    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraState("live");
      } catch (error) {
        if (cancelled) return;
        setCameraState("error");
        const name = error instanceof Error ? error.name : "";
        setCameraMessage(
          name === "NotAllowedError"
            ? "Camera access is off. Try the sample or search below."
            : "Camera unavailable. Try the sample or search below.",
        );
      }
    }
    void startCamera();
    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraWanted, cameraRequest, screen]);

  function reset(nextScenario = scenario) {
    imported.clear();
    setScenario(nextScenario);
    setScreen(station ? "scanner" : "station-error");
    setQuery("");
    setShowReturn(false);
    setCameraWanted(false);
    setCameraMessage("");
  }
  function openSearch() {
    setSearchOrigin(screen === "search" ? searchOrigin : screen);
    setQuery("");
    setCameraWanted(false);
    setScreen("search");
  }
  function selectItem(item: Item) {
    setFound(item);
    setShowReturn(false);
    setScreen("result");
  }
  function scan() {
    setCameraWanted(false);
    setScreen("matching");
  }
  function useCamera() {
    imported.clear();
    setCameraWanted(true);
    setCameraRequest((value) => value + 1);
  }
  async function importPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (await imported.selectFile(file)) {
      setCameraWanted(false);
      setCameraMessage("");
    }
  }

  return (
    <div className="presentation">
      <aside className="intro-panel" aria-label="Prototype presentation">
        <div className="project-label">
          <span className="label-dot" />
          INFO3315 · SDG 11
        </div>
        <div className="intro-copy">
          <p className="eyebrow">A LITTLE CLARITY. A CLEANER CAMPUS.</p>
          <h1>
            One item.
            <br />
            The right bin.
            <br />
            <span>In seconds.</span>
          </h1>
          <p className="intro-description">
            A small moment of certainty, right where
            <br className="desktop-break" /> you need it. Meet your campus
            sorting companion.
          </p>
        </div>
        <div className="scenario-panel">
          <div className="panel-caption">
            <span>TRY THE PROTOTYPE</span>
            <span>3 everyday moments</span>
          </div>
          {(Object.keys(scenarioLabels) as Scenario[]).map((key) => (
            <button
              key={key}
              onClick={() => reset(key)}
              className={`scenario-button ${scenario === key ? "selected" : ""}`}
              aria-pressed={scenario === key}
            >
              <span className="scenario-number">
                {scenarioLabels[key].number}
              </span>
              <span>
                <strong>{scenarioLabels[key].title}</strong>
                <span className="scenario-subtitle">
                  {scenarioLabels[key].subtitle}
                </span>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
        <div className="intro-footer">
          <Icon name="leaf" size={18} />
          <span>Designed around your next small decision.</span>
        </div>
        <p className="study-note">
          Study prototype. Recognition, locations and sorting rules are
          simulated. No photos are uploaded.
        </p>
      </aside>

      <div className="phone-stage">
        <div className="phone-topline">
          <span>INTERACTIVE PROTOTYPE</span>
          <span className="version">v0.1</span>
        </div>
        <main
          className="app-shell"
          id="prototype"
          aria-label="Binwise waste sorting prototype"
        >
          <header className="app-header">
            <a
              className="brand"
              href={`/?station=${encodeURIComponent(stationId)}&scenario=${scenario}`}
              aria-label="Binwise: start over"
            >
              <span className="brand-symbol">
                <Icon name="leaf" size={23} />
              </span>
              binwise<span className="brand-period">.</span>
            </a>
            <span className="prototype-badge">PROTOTYPE</span>
          </header>
          {station && (
            <div className="station-context">
              <Icon name="pin" size={16} />
              <span>
                {station.name}
                <span className="station-divider">/</span>Station{" "}
                {station.number}
              </span>
              <span
                className="connected-dot"
                aria-label="Example station loaded"
              />
            </div>
          )}

          <div className="screen-content">
            {screen === "scanner" && (
              <section>
                <div className="section-title">
                  <span className="step-label">POINT. SCAN. SORT.</span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    What are you
                    <br />
                    throwing away?
                  </h2>
                  <p>One item at a time. We’ll help with the bin.</p>
                </div>
                <div
                  className={`camera-frame ${cameraState === "live" ? "is-live" : ""}`}
                >
                  {cameraWanted && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      aria-label="Live camera preview"
                      style={{
                        display: cameraState === "live" ? "block" : "none",
                      }}
                    />
                  )}
                  {imported.photo ? (
                    <img
                      className="imported-preview"
                      src={imported.photo.url}
                      alt="Imported waste item"
                    />
                  ) : (
                    cameraState !== "live" && (
                      <>
                        <div className="camera-texture" />
                        <ItemArt kind={sample.art} className="scan-art" />
                      </>
                    )
                  )}
                  <span className="preview-label">
                    <span
                      className={`preview-dot ${cameraState === "live" ? "live" : ""}`}
                    />
                    {imported.photo
                      ? "Imported photo"
                      : cameraState === "live"
                        ? "Live camera"
                        : cameraState === "loading"
                          ? "Opening camera…"
                          : "Sample preview"}
                  </span>
                  <span className="focus-corner top-left" />
                  <span className="focus-corner top-right" />
                  <span className="focus-corner bottom-left" />
                  <span className="focus-corner bottom-right" />
                  <span className="camera-hint">
                    {imported.photo
                      ? imported.photo.name
                      : cameraState === "live"
                        ? "Keep the item inside the frame"
                        : sample.name}
                  </span>
                </div>
                <input
                  ref={photoInputRef}
                  className="photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  aria-label="Choose an image from your device"
                  onChange={(event) => void importPhoto(event)}
                  tabIndex={-1}
                />
                {imported.error && (
                  <p className="camera-error" role="alert">
                    <Icon name="info" size={16} />
                    {imported.error}
                  </p>
                )}
                {cameraState === "error" && (
                  <p className="camera-error" role="status">
                    <Icon name="info" size={16} />
                    {cameraMessage}
                  </p>
                )}
                <div className="camera-utilities">
                  <button
                    ref={importPhotoButtonRef}
                    className="text-button import-photo-button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={imported.loading}
                  >
                    <Icon name="image" size={16} />
                    {imported.loading
                      ? "Opening photo…"
                      : imported.photo
                        ? "Change photo"
                        : "Import photo"}
                  </button>
                  <button
                    className="text-button"
                    onClick={
                      cameraWanted && cameraState !== "error"
                        ? () => setCameraWanted(false)
                        : useCamera
                    }
                  >
                    {cameraWanted && cameraState !== "error"
                      ? "Use sample"
                      : "Use camera"}
                    <Icon
                      name={
                        cameraWanted && cameraState !== "error"
                          ? "refresh"
                          : "camera"
                      }
                      size={15}
                    />
                  </button>
                  {imported.photo && (
                    <button
                      className="text-button remove-photo-button"
                      onClick={() => {
                        imported.clear();
                        importPhotoButtonRef.current?.focus();
                      }}
                    >
                      <Icon name="close" size={15} />
                      Remove
                    </button>
                  )}
                </div>
                <p className="recognition-note" aria-live="polite">
                  <Icon name="spark" size={13} />
                  {imported.photo
                    ? "Photo stays on your device · recognition is simulated"
                    : "Import from your device · max 10 MB · simulated recognition"}
                </p>
                <button
                  className="primary-button"
                  onClick={scan}
                  disabled={cameraState === "loading" || imported.loading}
                >
                  <Icon name="camera" />
                  Scan item
                  <Icon name="arrow" />
                </button>
                <button
                  className="secondary-button search-fallback"
                  onClick={openSearch}
                >
                  <Icon name="search" />
                  Search for an item instead
                </button>
                <p className="privacy-note">
                  No sign-up. No photo storage. Just a little help.
                </p>
              </section>
            )}

            {screen === "matching" && (
              <section className="matching-screen" aria-live="polite">
                <div className="matching-art">
                  {imported.photo ? (
                    <img
                      className="imported-preview"
                      src={imported.photo.url}
                      alt="Imported waste item"
                    />
                  ) : (
                    <ItemArt kind={sample.art} />
                  )}
                  <div className="scan-line" />
                </div>
                <span className="step-label">A LITTLE HELP IS ON THE WAY</span>
                <h2 ref={headingRef} tabIndex={-1}>
                  Finding your match…
                </h2>
                <p>Using this station’s example rules.</p>
                <div className="loading-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <button className="secondary-button" onClick={openSearch}>
                  <Icon name="search" />
                  Search instead
                </button>
              </section>
            )}

            {screen === "candidates" && (
              <section>
                <button className="back-button" onClick={() => reset()}>
                  <Icon name="back" size={17} />
                  Retake
                </button>
                <div className="section-title">
                  <span className="step-label">LET’S DOUBLE-CHECK</span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    Which one
                    <br />
                    looks right?
                  </h2>
                  <p>These can look alike. You know your item best.</p>
                </div>
                <div className="candidate-list">
                  {[items[1], items[2], items[3]].map((item) => (
                    <button
                      className="candidate-card"
                      key={item.id}
                      onClick={() => selectItem(item)}
                    >
                      <div className="candidate-art">
                        <ItemArt kind={item.art} />
                      </div>
                      <span className="candidate-copy">
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                        <BinTag category={item.category} small />
                      </span>
                      <Icon name="chevron" size={18} />
                    </button>
                  ))}
                </div>
                <button className="secondary-button" onClick={openSearch}>
                  <Icon name="search" />
                  None of these? Search instead
                </button>
                <p className="privacy-note">
                  A quick check helps keep recycling clean.
                </p>
              </section>
            )}

            {screen === "unknown" && (
              <section>
                <button className="back-button" onClick={() => reset()}>
                  <Icon name="back" size={17} />
                  Retake
                </button>
                <div className="unknown-art">
                  <ItemArt kind="packet" />
                  <span className="question-mark">?</span>
                </div>
                <div className="section-title">
                  <span className="step-label">NO NEED TO GUESS</span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    Not quite
                    <br />
                    sure this time.
                  </h2>
                  <p>Let’s find your item by name instead.</p>
                </div>
                <button className="primary-button" onClick={openSearch}>
                  <Icon name="search" />
                  Search for my item
                  <Icon name="arrow" />
                </button>
                <button className="secondary-button" onClick={() => reset()}>
                  <Icon name="refresh" />
                  Try another scan
                </button>
                <p className="privacy-note">
                  It’s okay. Some packaging is tricky.
                </p>
              </section>
            )}

            {screen === "search" && (
              <section>
                <button
                  className="back-button"
                  onClick={() =>
                    setScreen(
                      searchOrigin === "matching" ? "scanner" : searchOrigin,
                    )
                  }
                >
                  <Icon name="back" size={17} />
                  Back
                </button>
                <div className="section-title">
                  <span className="step-label">A QUICK LOOKUP</span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    Find your item.
                  </h2>
                  <p>A name or a material is all you need.</p>
                </div>
                <div className="search-field">
                  <Icon name="search" size={21} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try “coffee cup” or “chips”"
                    aria-label="Search waste items"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  )}
                </div>
                <div className="search-caption" aria-live="polite">
                  {query.trim()
                    ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
                    : "COMMON CAMPUS ITEMS"}
                </div>
                <div className="search-results">
                  {results.map((item) => (
                    <button
                      className="search-result"
                      key={item.id}
                      onClick={() => selectItem(item)}
                    >
                      <span className="search-item-art">
                        <ItemArt kind={item.art} />
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <span className="search-bin">
                          <span
                            style={{
                              background: categories[item.category].background,
                            }}
                          />
                          {categories[item.category].short}
                        </span>
                      </span>
                      <Icon name="chevron" size={17} />
                    </button>
                  ))}
                </div>
                {!results.length && (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <Icon name="search" size={28} />
                    </span>
                    <h3>No match yet.</h3>
                    <p>Try a simpler name, like “cup” or “plastic”.</p>
                    <p>
                      Still unsure? Check the label on your bin or ask campus
                      facilities. We won’t guess.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      Browse common items
                    </button>
                  </div>
                )}
              </section>
            )}

            {screen === "result" && (
              <section>
                <button className="back-button" onClick={() => reset()}>
                  <Icon name="back" size={17} />
                  Scan again
                </button>
                <div className="result-heading">
                  <span className="step-label">
                    {available ? "HERE’S YOUR MATCH" : "A BIN IS MISSING HERE"}
                  </span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    {available ? "In the right place." : "Not at this station."}
                  </h2>
                  <p>{found.name}</p>
                </div>
                <div
                  className={`bin-result ${available ? "" : "unavailable"}`}
                  style={{ background: bin.background, color: bin.color }}
                >
                  <span className="bin-result-caption">
                    {available ? "PUT IT IN" : "THIS ITEM NEEDS"}
                  </span>
                  <div className="bin-illustration">
                    <div className="bin-lid" />
                    <div className="bin-body">
                      <Icon name={bin.icon} size={58} />
                    </div>
                    <span className="bin-wheel left" />
                    <span className="bin-wheel right" />
                  </div>
                  <h3>{bin.name}</h3>
                  <span className="bin-location">
                    {available
                      ? `Station ${station?.number} · match the label on the bin`
                      : "No matching bin at this example station"}
                  </span>
                </div>
                <div className="handling-note">
                  <span className="handling-icon">
                    <Icon name={available ? "check" : "info"} size={19} />
                  </span>
                  <span>
                    <strong>
                      {available
                        ? "Before you drop it"
                        : "Keep this item with you"}
                    </strong>
                    <span>
                      {available
                        ? found.note
                        : "Use a station with a food-organics bin. Check campus facilities for a verified location."}
                    </span>
                  </span>
                </div>
                {found.returnable && available && (
                  <>
                    <button
                      className="return-link"
                      onClick={() => setShowReturn(!showReturn)}
                      aria-expanded={showReturn}
                    >
                      <Icon name="recycle" size={17} />
                      <span>A bottle return may be another option</span>
                      <Icon name="chevron" size={16} />
                    </button>
                    {showReturn && (
                      <div className="return-details">
                        <strong>Example bottle-return point</strong>
                        <p>
                          Demo Student Centre. Check eligibility and a verified
                          return-point directory before using a real service.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {available ? (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setCameraWanted(false);
                      setScreen("complete");
                    }}
                  >
                    <Icon name="check" />
                    Got it, thank you
                    <Icon name="arrow" />
                  </button>
                ) : (
                  <button className="primary-button" onClick={openSearch}>
                    <Icon name="search" />
                    Look up another item
                    <Icon name="arrow" />
                  </button>
                )}
                <button className="secondary-button" onClick={openSearch}>
                  <Icon name="search" />
                  Not your item? Search instead
                </button>
              </section>
            )}

            {screen === "complete" && (
              <section className="complete-screen">
                <div className="complete-illustration">
                  <span className="complete-circle">
                    <Icon name="leaf" size={70} />
                  </span>
                  <span className="complete-check">
                    <Icon name="check" size={23} />
                  </span>
                  <i className="confetti c1" />
                  <i className="confetti c2" />
                  <i className="confetti c3" />
                </div>
                <span className="step-label">
                  ONE SMALL ACTION. A BETTER CAMPUS.
                </span>
                <h2 ref={headingRef} tabIndex={-1}>
                  A little less waste.
                  <br />A little more care.
                </h2>
                <p>Thanks for taking a moment to sort.</p>
                <div className="completed-summary">
                  <Icon name={bin.icon} size={22} />
                  <span>
                    <strong>{found.name}</strong>
                    <span>{bin.name} · example rule</span>
                  </span>
                  <Icon name="check" size={18} />
                </div>
                <button className="primary-button" onClick={() => reset()}>
                  <Icon name="camera" />
                  Sort another item
                  <Icon name="arrow" />
                </button>
                <p className="privacy-note">
                  You’re all set. You can close this page.
                </p>
              </section>
            )}

            {screen === "station-error" && (
              <section className="station-error">
                <div className="empty-icon">
                  <Icon name="pin" size={32} />
                </div>
                <span className="step-label">LET’S CHECK THE LOCATION</span>
                <h2 ref={headingRef} tabIndex={-1}>
                  Station not recognised.
                </h2>
                <p>
                  This QR link doesn’t match an example station. We can’t give a
                  station-specific bin result.
                </p>
                <a className="primary-button" href="/?station=library-03">
                  Try the demo station
                  <Icon name="arrow" />
                </a>
              </section>
            )}
          </div>
          <footer className="app-footer">
            <Icon name="info" size={13} />
            <span>Example rules &amp; locations · check your bin label</span>
          </footer>
        </main>
        <div className="phone-bottomline">
          <span>LESS GUESSING.</span>
          <span>BETTER SORTING.</span>
        </div>
        <details className="mobile-controls">
          <summary>
            <Icon name="sliders" size={15} />
            Prototype scenarios
          </summary>
          <div>
            {(Object.keys(scenarioLabels) as Scenario[]).map((key) => (
              <button
                onClick={() => reset(key)}
                key={key}
                aria-pressed={scenario === key}
              >
                {scenarioLabels[key].number} · {scenarioLabels[key].title}
              </button>
            ))}
          </div>
          <p>Simulation controls for testing. No real AI classification.</p>
        </details>
      </div>
    </div>
  );
}

export default App;
