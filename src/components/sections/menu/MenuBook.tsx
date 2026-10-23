"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import type { Brand, MenuCategory, MenuItem } from "@/config/types";
import { Reveal } from "@/components/Reveal";
import { formatPrice } from "@/lib/links";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div className="menu-flip-skeleton" aria-hidden="true" />,
});

type BookPage =
  | { kind: "logo"; key: string }
  | { kind: "dish"; key: string; category: string; item: MenuItem }
  | {
      kind: "category";
      key: string;
      category: string;
      description?: string;
      items: MenuItem[];
      continued: boolean;
    };

/** Cut-out dishes get a showcase page, then every item is listed in page-sized chunks. */
function buildPages(menu: MenuCategory[], perPage: number, isPortrait: boolean): BookPage[] {
  const pages: BookPage[] = [];

  for (const category of menu) {
    for (const item of category.items) {
      if (item.cutout) {
        pages.push({
          kind: "dish",
          key: `dish-${category.id}-${item.name}`,
          category: category.name,
          item,
        });
      }
    }
    for (let start = 0; start < category.items.length; start += perPage) {
      pages.push({
        kind: "category",
        key: `cat-${category.id}-${start}`,
        category: category.name,
        description: start === 0 ? category.description : undefined,
        items: category.items.slice(start, start + perPage),
        continued: start > 0,
      });
    }
  }

  if (!isPortrait) {
    pages.unshift({ kind: "logo", key: "logo-start" });
    if (pages.length % 2 === 1) pages.push({ kind: "logo", key: "logo-end" });
  }
  return pages;
}

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

function BrandMark({ brand, className }: { brand: Brand; className: string }) {
  if (brand.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={brand.logo} alt="" className={className} draggable={false} />
    );
  }
  return <span className={`${className} is-text`}>{brand.name}</span>;
}

function CoverFace({ brand, note }: { brand: Brand; note?: string }) {
  return (
    <div className="flip-cover-inner">
      <div className="flip-cover-frame" aria-hidden="true" />
      <div className="flip-cover-brand">
        {brand.logo && <BrandMark brand={brand} className="flip-cover-logo" />}
        <h2 className="flip-cover-title">{brand.name}</h2>
        <p className="flip-cover-sub">{brand.kind}</p>
      </div>
      <div className="flip-cover-footer">
        <div className="flip-cover-rule" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
        <p className="flip-cover-menu-label">Menu</p>
        <p>{note ?? brand.city}</p>
      </div>
    </div>
  );
}

function Ornament() {
  return (
    <div className="flip-rule" aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  );
}

type PageProps = { page: BookPage; brand: Brand };

const BookPageView = forwardRef<HTMLDivElement, PageProps>(function BookPageView(
  { page, brand },
  ref
) {
  if (page.kind === "logo") {
    return (
      <div className="flip-page flip-logo-page" ref={ref}>
        <div className="flip-page-frame" aria-hidden="true" />
        <div className="flip-logo-engrave">
          <BrandMark brand={brand} className="flip-logo-mark" />
        </div>
      </div>
    );
  }

  if (page.kind === "dish") {
    const { item } = page;
    return (
      <div className="flip-page flip-dish" ref={ref}>
        <div className="flip-page-frame" aria-hidden="true" />
        <div className="flip-dish-inner">
          <div className="flip-dish-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cutout}
              alt={item.name}
              className="flip-dish-photo-img"
              draggable={false}
            />
          </div>
          <div className="flip-dish-copy">
            <p className="flip-kicker">{page.category}</p>
            <h3>{item.name}</h3>
            <Ornament />
            {item.description && <p className="flip-dish-ingredients">{item.description}</p>}
            <p className="flip-dish-price">{formatPrice(item.price, brand.currency)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flip-page flip-category" ref={ref}>
      <div className="flip-page-frame" aria-hidden="true" />
      <div className="flip-category-inner">
        <header className="flip-category-head">
          <p className="flip-kicker">{brand.name}</p>
          <h3>
            {page.category}
            {page.continued && <span> (suite)</span>}
          </h3>
          <Ornament />
          {page.description && <p className="flip-category-desc">{page.description}</p>}
        </header>
        <ul className="flip-category-items">
          {page.items.map((item) => (
            <li key={item.name}>
              <div className="flip-category-row">
                <span className="flip-category-name">{item.name}</span>
                <span className="flip-category-leader" aria-hidden="true" />
                <span className="flip-category-price">
                  {formatPrice(item.price, brand.currency)}
                </span>
              </div>
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

type FlipApi = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    turnToPage: (page: number) => void;
    turnToNextPage: () => void;
    getCurrentPageIndex: () => number;
    getBoundsRect: () => { left: number; top: number; width: number; height: number };
    getFlipController: () => { flip: (pos: { x: number; y: number }) => void };
  };
};

type Gate = "closed" | "open" | "ended";
type CoverMotion = "idle" | "opening" | "closing" | "to-end" | "from-end";

function useBookSize() {
  const [size, setSize] = useState({
    pageW: 520,
    pageH: 770,
    shellW: 1040,
    coverW: 480,
    coverH: 710,
    isPortrait: false,
  });

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 720;

      if (isPortrait) {
        const pageW = Math.round(Math.min(vw - 24, 380, Math.max(280, (vh * 0.6) / 1.48)));
        const pageH = Math.round(pageW * 1.48);
        setSize({ pageW, pageH, shellW: pageW, coverW: pageW, coverH: pageH, isPortrait: true });
        return;
      }

      const maxByWidth = Math.min(560, Math.max(168, Math.min(1280, vw - 36) / 2));
      const maxByHeight = Math.floor((vh * 0.78) / 1.48);
      const pageW = Math.round(Math.min(maxByWidth, Math.max(168, maxByHeight)));
      const pageH = Math.round(pageW * 1.48);
      const coverW = Math.round(Math.min(pageW * 1.12, Math.min(580, vw - 48), (vh * 0.8) / 1.48));
      const coverH = Math.round(coverW * 1.48);
      setSize({ pageW, pageH, shellW: pageW * 2, coverW, coverH, isPortrait: false });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

type MenuBookProps = {
  menu: MenuCategory[];
  brand: Brand;
  coverNote?: string;
};

export function MenuBook({ menu, brand, coverNote }: MenuBookProps) {
  const bookRef = useRef<FlipApi | null>(null);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const [gate, setGate] = useState<Gate>("closed");
  const [coverMotion, setCoverMotion] = useState<CoverMotion>("idle");
  const { pageW, pageH, shellW, coverW, coverH, isPortrait } = useBookSize();

  const perPage = pageH > 640 ? 6 : pageH > 480 ? 5 : 4;
  const pages = useMemo(
    () => buildPages(menu, perPage, isPortrait),
    [menu, perPage, isPortrait]
  );

  const innerPageCount = pages.length;
  const lastContentIndex = isPortrait ? innerPageCount - 1 : innerPageCount - 2;
  const spreadCount = isPortrait ? innerPageCount : innerPageCount / 2;

  const isBusy = coverMotion !== "idle";
  const isOpening = coverMotion === "opening";
  const isClosing = coverMotion === "closing";
  const isToEnd = coverMotion === "to-end";
  const isFromEnd = coverMotion === "from-end";

  const isClosed = gate === "closed" && !isBusy;
  const isEnded = gate === "ended" && !isBusy;
  const bookInteractive = gate === "open" && !isBusy;

  const showFrontCover = (gate === "closed" || isOpening || isClosing) && !isToEnd && !isFromEnd;
  const showEndCover = (gate === "ended" || isToEnd || isFromEnd) && !isOpening && !isClosing;
  const showOpenShell = gate === "open" || isOpening || isClosing || isToEnd || isFromEnd;

  const spreadIndex = isPortrait ? page : Math.floor(page / 2);
  const spreadPage = isPortrait ? pages[page] : (pages[page + 1] ?? pages[page]);
  const spreadLabel =
    spreadPage && spreadPage.kind !== "logo" ? spreadPage.category : brand.name;

  const finishMotion = useCallback((nextGate: Gate) => {
    setGate(nextGate);
    setCoverMotion("idle");
  }, []);

  const closeBook = useCallback(() => {
    if (isBusy) return;
    bookRef.current?.pageFlip()?.turnToPage(0);
    setPage(0);
    setCoverMotion("closing");
  }, [isBusy]);

  const openBook = useCallback(() => {
    if (!ready || isBusy || gate === "open") return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    api.turnToPage(0);
    setPage(0);
    setCoverMotion("opening");
  }, [ready, isBusy, gate]);

  const goToEnd = useCallback(() => {
    if (isBusy) return;
    bookRef.current?.pageFlip()?.turnToPage(lastContentIndex);
    setPage(lastContentIndex);
    setCoverMotion("to-end");
  }, [isBusy, lastContentIndex]);

  const reopenFromEnd = useCallback(() => {
    if (!ready || isBusy) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    api.turnToPage(lastContentIndex);
    setPage(lastContentIndex);
    setCoverMotion("from-end");
  }, [ready, isBusy, lastContentIndex]);

  useEffect(() => {
    if (!isBusy) return;
    const nextGate: Gate =
      coverMotion === "opening" || coverMotion === "from-end"
        ? "open"
        : coverMotion === "closing"
          ? "closed"
          : "ended";
    const timer = window.setTimeout(() => finishMotion(nextGate), 560);
    return () => window.clearTimeout(timer);
  }, [isBusy, coverMotion, finishMotion]);

  const getFlipApi = useCallback(() => {
    try {
      return bookRef.current?.pageFlip() ?? null;
    } catch {
      return null;
    }
  }, []);

  const syncPageFromApi = useCallback(() => {
    const idx = getFlipApi()?.getCurrentPageIndex?.();
    if (typeof idx === "number" && Number.isFinite(idx)) setPage(idx);
  }, [getFlipApi]);

  const onFlip = useCallback(
    (e: { data: number }) => {
      const next = typeof e?.data === "number" ? e.data : 0;
      setPage(Math.max(0, Math.min(next, innerPageCount - 1)));
      setGate("open");
    },
    [innerPageCount]
  );

  const flipNext = useCallback(() => {
    if (gate === "closed") {
      openBook();
      return;
    }
    if (gate === "ended" || isBusy) return;

    const api = getFlipApi();
    if (!api) return;

    const current = api.getCurrentPageIndex?.() ?? page;
    const spread = isPortrait ? current : Math.floor(current / 2);
    const lastSpread = isPortrait ? innerPageCount - 1 : Math.floor(lastContentIndex / 2);

    if (spread >= lastSpread) {
      goToEnd();
      return;
    }

    try {
      api.flipNext("top");
    } catch {
      api.turnToNextPage();
      syncPageFromApi();
    }
  }, [gate, isBusy, openBook, getFlipApi, page, isPortrait, innerPageCount, lastContentIndex, goToEnd, syncPageFromApi]);

  const flipPrev = useCallback(() => {
    if (gate === "ended") {
      reopenFromEnd();
      return;
    }
    if (gate === "closed" || isBusy) return;

    const api = getFlipApi();
    if (!api) return;

    const apiIndex = api.getCurrentPageIndex?.();
    const current = typeof apiIndex === "number" && Number.isFinite(apiIndex) ? apiIndex : page;
    const spread = isPortrait ? current : Math.floor(current / 2);

    if (spread <= 0) {
      closeBook();
      return;
    }

    // StPageFlip.flipPrev() hardcodes x:10 (window), which fails when the book is centered.
    // Drive the same animation from the book's actual left edge.
    try {
      const rect = api.getBoundsRect();
      api.getFlipController().flip({ x: rect.left + 12, y: rect.top + 8 });
    } catch {
      const target = isPortrait ? current - 1 : (spread - 1) * 2;
      api.turnToPage(target);
      setPage(target);
    }
  }, [gate, isBusy, reopenFromEnd, getFlipApi, page, isPortrait, closeBook]);

  // StPageFlip moves the page nodes itself, so React must never reconcile them in place:
  // any change to the pages' content or order remounts the whole book.
  const contentHash = useMemo(
    () => hashString(JSON.stringify([pages, brand.name, brand.logo, brand.currency])),
    [pages, brand.name, brand.logo, brand.currency]
  );
  const bookKey = `${pageW}x${pageH}-${isPortrait ? "p" : "l"}-${contentHash}`;

  useEffect(() => {
    setReady(false);
    setPage(0);
  }, [bookKey]);

  const coverClass = (extra: (string | false)[]) =>
    ["menu-cover-gate", ...extra].filter(Boolean).join(" ");

  const shellClass = [
    "menu-flip-shell",
    showOpenShell ? "is-open" : "is-gated",
    (isOpening || isFromEnd) && "is-revealing",
    (isClosing || isToEnd) && "is-exiting",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Reveal className="menu-book-stage" delay={100}>
      <div className="menu-flip-frame" style={{ minHeight: Math.max(coverH, pageH) }}>
        {showFrontCover && (
          <button
            type="button"
            className={coverClass([isOpening && "is-opening", isClosing && "is-closing"])}
            style={{ width: coverW, height: coverH } as CSSProperties}
            onClick={openBook}
            aria-label={`Ouvrir le menu ${brand.name}`}
            disabled={isBusy}
          >
            <div className="flip-page flip-cover menu-cover-gate-face">
              <CoverFace brand={brand} note={coverNote} />
            </div>
          </button>
        )}

        {showEndCover && (
          <button
            type="button"
            className={coverClass([isToEnd && "is-to-end", isFromEnd && "is-from-end"])}
            style={{ width: coverW, height: coverH } as CSSProperties}
            onClick={reopenFromEnd}
            aria-label="Revenir au menu"
            disabled={isBusy}
          >
            <div className="flip-page flip-cover menu-cover-gate-face">
              <CoverFace brand={brand} note={coverNote} />
            </div>
          </button>
        )}

        <div
          className={shellClass}
          data-lenis-prevent
          aria-hidden={!bookInteractive}
          style={{ width: shellW, height: pageH }}
        >
          {bookInteractive && (
            <>
              <button
                type="button"
                className="menu-side-hit menu-side-hit-left"
                onClick={flipPrev}
                aria-label="Page précédente"
              />
              <button
                type="button"
                className="menu-side-hit menu-side-hit-right"
                onClick={flipNext}
                aria-label="Page suivante"
              />
            </>
          )}
          <HTMLFlipBook
            key={bookKey}
            ref={bookRef as never}
            className="menu-flipbook"
            style={{}}
            width={pageW}
            height={pageH}
            size="fixed"
            minWidth={240}
            maxWidth={600}
            minHeight={340}
            maxHeight={900}
            drawShadow
            flippingTime={900}
            usePortrait={isPortrait}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.35}
            showCover={false}
            mobileScrollSupport={false}
            clickEventForward={false}
            useMouseEvents={false}
            swipeDistance={30}
            showPageCorners={false}
            disableFlipByClick
            startPage={0}
            onFlip={onFlip}
            onInit={() => {
              setReady(true);
              setPage(0);
            }}
          >
            {pages.map((bookPage) => (
              <BookPageView key={bookPage.key} page={bookPage} brand={brand} />
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div className="menu-book-controls">
        <button
          type="button"
          className="menu-nav-btn"
          onClick={flipPrev}
          disabled={!ready || isClosed || isBusy}
        >
          Précédent
        </button>
        <p className="menu-book-hint">
          {isClosed || isOpening || isClosing
            ? "Cliquez pour ouvrir"
            : isEnded || isToEnd || isFromEnd
              ? "Fin du menu — cliquez pour revenir"
              : `${spreadLabel} · ${spreadIndex + 1} / ${spreadCount}`}
        </p>
        <button
          type="button"
          className={`menu-nav-btn${isClosed || isOpening ? " menu-nav-btn-primary" : ""}`}
          onClick={flipNext}
          disabled={!ready || isEnded || isBusy}
        >
          {isClosed || isOpening ? "Ouvrir" : "Suivant"}
        </button>
      </div>
    </Reveal>
  );
}
