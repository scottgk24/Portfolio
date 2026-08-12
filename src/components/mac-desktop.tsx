"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { projects, type Project } from "@/data/projects";

function formatClock(now: Date, compact: boolean) {
  return now.toLocaleString(
    "en-US",
    compact
      ? {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        },
  );
}

const SERVER_CLOCK = {
  compact: "Aug 6  7:00 PM",
  full: "Fri Aug 6  7:00 PM",
};

let clientClock = SERVER_CLOCK;

function readClock() {
  const now = new Date();
  const next = {
    compact: formatClock(now, true),
    full: formatClock(now, false),
  };
  if (
    next.compact === clientClock.compact &&
    next.full === clientClock.full
  ) {
    return clientClock;
  }
  clientClock = next;
  return clientClock;
}

function useClock() {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const id = window.setInterval(onStoreChange, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useSyncExternalStore(subscribe, readClock, () => SERVER_CLOCK);
}

export function MacDesktop() {
  const clock = useClock();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  const active = useMemo(
    () => projects.find((p) => p.id === (pinnedId ?? activeId)) ?? null,
    [activeId, pinnedId],
  );

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const scheduleLeave = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = window.setTimeout(() => {
      if (!pinnedId) setActiveId(null);
    }, 180);
  }, [clearLeaveTimer, pinnedId]);

  const showFirstProject = useCallback(() => {
    const first = projects[0];
    if (!first) return;
    clearLeaveTimer();
    setAboutOpen(false);
    setActiveId(first.id);
    setPinnedId(first.id);
  }, [clearLeaveTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedId(null);
        setActiveId(null);
        setAboutOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  const openProject = (project: Project) => {
    if (project.href) {
      window.open(project.href, "_blank", "noopener,noreferrer");
      return;
    }
    setPinnedId(project.id);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden text-[var(--desk-ink)]">
      <Wallpaper />

      <MenuBar
        clock={clock}
        onOpenAbout={() => {
          setPinnedId(null);
          setActiveId(null);
          setAboutOpen(true);
        }}
        onOpenPortfolio={showFirstProject}
      />

      <DesktopStage
        aboutOpen={aboutOpen}
        onOpenAbout={() => {
          setPinnedId(null);
          setActiveId(null);
          setAboutOpen(true);
        }}
        onCloseAbout={() => setAboutOpen(false)}
      />

      {active ? (
        <div
          onMouseEnter={clearLeaveTimer}
          onMouseLeave={scheduleLeave}
        >
          <PreviewWindow
            project={active}
            pinned={pinnedId === active.id}
            onClose={() => {
              setPinnedId(null);
              setActiveId(null);
            }}
            onOpen={() => openProject(active)}
          />
        </div>
      ) : null}

      <Dock
        activeId={pinnedId ?? activeId}
        onHover={(id) => {
          clearLeaveTimer();
          setActiveId(id);
        }}
        onLeave={scheduleLeave}
        onSelect={(project) => {
          clearLeaveTimer();
          setAboutOpen(false);
          if (pinnedId === project.id) {
            setPinnedId(null);
            setActiveId(null);
            return;
          }
          setPinnedId(project.id);
          setActiveId(project.id);
        }}
      />
    </div>
  );
}

function Wallpaper() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="wallpaper-drift absolute inset-[-4%]"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 65% 50% at 18% 22%, rgba(56, 140, 180, 0.28), transparent 55%)",
            "radial-gradient(ellipse 55% 45% at 82% 16%, rgba(200, 140, 70, 0.18), transparent 50%)",
            "radial-gradient(ellipse 50% 40% at 72% 78%, rgba(45, 120, 100, 0.16), transparent 55%)",
            "radial-gradient(ellipse 40% 35% at 10% 80%, rgba(30, 70, 100, 0.22), transparent 50%)",
            "linear-gradient(165deg, #12161f 0%, #0c1018 35%, #080b12 70%, #05070c 100%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

function MenuBar({
  clock,
  onOpenAbout,
  onOpenPortfolio,
}: {
  clock: { compact: string; full: string };
  onOpenAbout: () => void;
  onOpenPortfolio: () => void;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div
        className="flex h-8 items-center justify-between gap-3 px-3 text-[13px] font-medium text-white/95 backdrop-blur-xl sm:px-4"
        style={{ background: "var(--menubar-bg)" }}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onOpenAbout}
            className="font-brand truncate bg-gradient-to-r from-white via-[#ffe7a3] to-[#9aecff] bg-clip-text text-[13px] font-extrabold tracking-tight text-transparent sm:text-[14px]"
          >
            Scott Kluempke
          </button>
          <button
            type="button"
            onClick={onOpenAbout}
            className="hidden text-white/85 transition hover:text-white sm:inline"
          >
            About
          </button>
          <button
            type="button"
            onClick={onOpenPortfolio}
            className="hidden text-white/70 transition hover:text-white md:inline"
          >
            Portfolio
          </button>
        </div>
        <div className="shrink-0 tabular-nums text-[12px] text-white/90 sm:text-[13px]">
          <span className="sm:hidden">{clock.compact}</span>
          <span className="hidden sm:inline">{clock.full}</span>
        </div>
      </div>
    </header>
  );
}

const stickyNotes = [
  {
    id: "tools",
    title: "Tools",
    tint: "#f5e6a8",
    ink: "#2a2410",
    muted: "#5c5330",
    tilt: "-3deg",
    position: "top-[22%] right-[4%] sm:right-[6%] lg:right-[8%]",
    lines: [
      { name: "Cursor Pro", cost: "$20/mo" },
      { name: "GitHub", cost: "Free" },
      { name: "Vercel Hobby", cost: "Free" },
      { name: "Neon", cost: "Free tier" },
      { name: "Clerk", cost: "Free tier" },
      { name: "Plaid", cost: "Sandbox" },
    ],
  },
  {
    id: "stack",
    title: "Stack",
    tint: "#c8e6d4",
    ink: "#14241a",
    muted: "#3d5a48",
    tilt: "2.5deg",
    position: "top-[46%] right-[7%] sm:right-[11%] lg:right-[14%]",
    lines: [
      { name: "TypeScript · Swift · SQL" },
      { name: "Next.js · Tailwind" },
      { name: "Prisma · SwiftUI" },
      { name: "Neon · Clerk · Plaid" },
    ],
  },
  {
    id: "workflow",
    title: "Workflow",
    tint: "#f0cfc0",
    ink: "#2a1810",
    muted: "#6a4538",
    tilt: "-1.5deg",
    position:
      "top-[70%] right-[3%] sm:top-[68%] sm:right-[5%] lg:right-[8%]",
    lines: [
      { name: "Build & iterate in Cursor" },
      { name: "Version with Git" },
      { name: "Ship on Vercel" },
      { name: "Native Mac builds" },
    ],
  },
] as const;

function DesktopStage({
  aboutOpen,
  onOpenAbout,
  onCloseAbout,
}: {
  aboutOpen: boolean;
  onOpenAbout: () => void;
  onCloseAbout: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 px-4 pt-14 sm:px-8">
      <div className="relative z-20 max-w-xl pt-3 sm:max-w-2xl sm:pt-8 lg:max-w-3xl">
        <div
          aria-hidden
          className="glow-pulse pointer-events-none absolute -left-8 top-4 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(200,140,70,0.28),transparent_70%)] blur-2xl sm:h-56 sm:w-56"
        />
        <div
          aria-hidden
          className="glow-pulse pointer-events-none absolute left-40 top-16 h-28 w-48 rounded-full bg-[radial-gradient(circle,rgba(56,160,190,0.22),transparent_70%)] blur-2xl"
          style={{ animationDelay: "1s" }}
        />

        <p className="rise text-[11px] font-bold tracking-[0.28em] text-[#e8c878] uppercase sm:text-xs">
          Portfolio · Built to ship
        </p>

        <h1 className="name-pop relative mt-3 font-brand text-[clamp(2.45rem,11.5vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] sm:text-[clamp(3.2rem,11vw,7rem)] sm:leading-[0.88]">
          <span
            className="name-shine bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(105deg, #f5f7fa 0%, #e8c878 22%, #f5f7fa 40%, #7ec8d8 58%, #f5f7fa 78%, #d4a06a 100%)",
            }}
          >
            Scott
          </span>
          <br />
          <span
            className="name-shine bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(105deg, #e8c878 0%, #f5f7fa 28%, #6eb8c8 52%, #f5f7fa 74%, #d4925a 100%)",
              animationDelay: "0.8s",
            }}
          >
            Kluempke
          </span>
          <span
            aria-hidden
            className="spark-float absolute -top-1 right-[8%] size-2 rotate-45 bg-[#e8c878] shadow-[0_0_16px_rgba(232,200,120,0.7)] sm:-top-1 sm:right-[10%] sm:size-3"
          />
          <span
            aria-hidden
            className="spark-float spark-float-delay absolute top-[46%] -right-0.5 size-1.5 rotate-45 bg-[#7ec8d8] shadow-[0_0_14px_rgba(126,200,216,0.7)] sm:size-2 sm:right-3"
          />
        </h1>

        <p className="rise rise-delay-1 mt-4 max-w-lg font-display text-lg text-white/90 sm:mt-5 sm:text-2xl">
          Tools for families, studios, and everyday work.
        </p>
        <p className="rise rise-delay-2 mt-2.5 max-w-md text-sm leading-relaxed text-white/60 sm:mt-3 sm:text-base">
          <span className="sm:hidden">Tap an app in the dock to preview it.</span>
          <span className="hidden sm:inline">
            Hover an app in the dock for a preview. Click to open it.
          </span>
        </p>

        <button
          type="button"
          onClick={onOpenAbout}
          className="rise rise-delay-2 group mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-2.5 text-left ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/14 hover:ring-white/35 sm:mt-7"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[18%] bg-gradient-to-br from-[#e8c878]/35 to-[#7ec8d8]/25 text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/25 sm:size-12">
            <span className="font-display text-[1.25rem] leading-none">i</span>
          </span>
          <span className="pr-1">
            <span className="block text-[13px] font-semibold tracking-wide text-white sm:text-sm">
              About Me
            </span>
            <span className="mt-0.5 block text-[11px] text-white/55 sm:text-xs">
              How I work · tools & stack
            </span>
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {stickyNotes.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </div>

      {aboutOpen ? <AboutWindow onClose={onCloseAbout} /> : null}
    </div>
  );
}

function StickyNote({
  note,
}: {
  note: (typeof stickyNotes)[number];
}) {
  return (
    <aside
      className={`sticky-note absolute pointer-events-auto w-[200px] rounded-sm px-3.5 py-3 lg:w-[220px] ${note.position}`}
      style={{
        background: note.tint,
        color: note.ink,
        ["--sticky-tilt" as string]: note.tilt,
      }}
    >
      <div
        aria-hidden
        className="absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 rounded-[1px] bg-white/35 shadow-sm"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}
      />
      <p
        className="font-display text-[15px] font-semibold tracking-tight"
        style={{ color: note.ink }}
      >
        {note.title}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {note.lines.map((line) => (
          <li
            key={line.name}
            className="flex items-baseline justify-between gap-2 text-[11px] leading-snug"
          >
            <span className="min-w-0">{line.name}</span>
            {"cost" in line && line.cost ? (
              <span
                className="shrink-0 font-medium tabular-nums"
                style={{ color: note.muted }}
              >
                {line.cost}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function AboutWindow({ onClose }: { onClose: () => void }) {
  return (
    <div className="preview-in absolute inset-x-3 top-[max(3.5rem,env(safe-area-inset-top)+2.75rem)] z-30 mx-auto max-h-[min(78dvh,calc(100dvh-8.5rem))] w-[min(92vw,440px)] overflow-hidden rounded-xl bg-[var(--window-bg)] shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10 sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(80dvh,640px)] sm:w-[min(92vw,440px)] sm:-translate-x-1/2 sm:-translate-y-[42%]">
      <WindowChrome title="About — Scott Kluempke" onClose={onClose} />
      <div className="max-h-[calc(min(78dvh,calc(100dvh-8.5rem))-2.5rem)] space-y-4 overflow-y-auto overscroll-contain px-5 py-5 text-sm leading-relaxed text-[var(--window-body)] sm:max-h-[calc(min(80dvh,640px)-2.5rem)] sm:px-6">
        <p className="font-display text-2xl text-[var(--window-ink)]">
          How I work
        </p>
        <p>
          I design and ship software for real household and studio workflows —
          usually starting from a clear problem, iterating in Cursor, and
          deploying when it&apos;s ready for daily use.
        </p>
        <p className="text-[13px] text-[var(--window-muted)]">
          One paid tool: Cursor at $20/mo. Everything else runs on free or hobby
          tiers.
        </p>

        <div className="grid gap-3 pt-1 lg:hidden">
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg px-3.5 py-3"
              style={{ background: note.tint, color: note.ink }}
            >
              <p
                className="font-display text-[15px] font-semibold tracking-tight"
                style={{ color: note.ink }}
              >
                {note.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {note.lines.map((line) => (
                  <li
                    key={line.name}
                    className="flex items-baseline justify-between gap-2 text-[11px] leading-snug"
                  >
                    <span className="min-w-0">{line.name}</span>
                    {"cost" in line && line.cost ? (
                      <span
                        className="shrink-0 font-medium tabular-nums"
                        style={{ color: note.muted }}
                      >
                        {line.cost}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewWindow({
  project,
  pinned,
  onClose,
  onOpen,
}: {
  project: Project;
  pinned: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="preview-in pointer-events-auto absolute inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-h-[min(62dvh,calc(100dvh-9.5rem))] w-[min(94vw,560px)] overflow-hidden rounded-xl bg-[var(--window-bg)] shadow-[0_28px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:inset-x-auto sm:bottom-[8.5rem] sm:left-1/2 sm:max-h-[min(70dvh,560px)] sm:w-[min(92vw,560px)] sm:-translate-x-1/2">
      <WindowChrome
        title={`${project.name} — ${project.type}`}
        onClose={onClose}
      />
      <div className="max-h-[calc(min(62dvh,calc(100dvh-9.5rem))-2.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(min(70dvh,560px)-2.5rem)]">
        <div className="grid gap-0 sm:grid-cols-[1.15fr_0.85fr]">
          <div
            className="relative min-h-[150px] sm:min-h-[220px]"
            style={{ background: project.surface }}
          >
            <Image
              src={project.screenshot.src}
              alt={project.screenshot.alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 94vw, 320px"
            />
          </div>
          <div className="flex flex-col justify-between px-4 py-4 sm:px-5">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="relative size-11 shrink-0 overflow-hidden rounded-[22%] shadow-md ring-1 ring-white/15 sm:size-12"
                  style={{ background: project.surface }}
                >
                  <Image
                    src={project.logo.src}
                    alt=""
                    fill
                    className={
                      project.logo.fill
                        ? "object-cover"
                        : "object-contain p-1.5"
                    }
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-brand text-base font-bold tracking-tight text-[var(--window-ink)] sm:text-lg">
                    {project.name}
                  </p>
                  <p className="text-xs text-[var(--window-muted)]">
                    {project.tagline}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--window-body)]">
                {project.description}
              </p>
              <p className="mt-3 text-[11px] tracking-wide text-[var(--window-muted)] uppercase">
                {project.stack.join(" · ")}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {project.href ? (
                <button
                  type="button"
                  onClick={onOpen}
                  className="rounded-md bg-[#3b82f6] px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#2563eb]"
                >
                  Open App
                </button>
              ) : (
                <span className="rounded-md bg-white/5 px-3 py-1.5 text-[12px] text-[var(--window-muted)]">
                  Mac desktop app
                </span>
              )}
              {pinned ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[12px] text-[var(--window-muted)] underline-offset-2 hover:underline"
                >
                  Close
                </button>
              ) : (
                <span className="text-[12px] text-[var(--window-muted)]">
                  <span className="sm:hidden">Tap the dock icon again to pin</span>
                  <span className="hidden sm:inline">
                    Click the dock icon to open
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowChrome({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="relative flex h-10 items-center border-b border-white/8 bg-[var(--window-chrome)] px-3">
      <div className="absolute left-3 flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-black/30"
        />
        <span className="size-3 rounded-full bg-[#febc2e] ring-1 ring-black/30" />
        <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-black/30" />
      </div>
      <p className="mx-auto truncate px-16 text-center text-[12px] font-medium text-[var(--window-muted)]">
        {title}
      </p>
    </div>
  );
}

function Dock({
  activeId,
  onHover,
  onLeave,
  onSelect,
}: {
  activeId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (project: Project) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-0 sm:px-3 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Applications"
        className="flex max-w-full items-end gap-2.5 overflow-x-auto rounded-[22px] px-3 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/15 backdrop-blur-2xl sm:gap-5 sm:overflow-visible sm:rounded-[26px] sm:px-5 sm:py-3.5"
        style={{ background: "var(--dock-bg)" }}
        onMouseLeave={() => {
          setHovered(null);
          onLeave();
        }}
      >
        {projects.map((project) => {
          const isHot = hovered === project.id || activeId === project.id;
          const scale = isHot ? 1.18 : hovered ? 1.04 : 1;

          return (
            <button
              key={project.id}
              type="button"
              title={project.name}
              aria-label={`${project.name}. ${project.tagline}`}
              className="group relative flex w-12 shrink-0 flex-col items-center sm:w-16"
              style={{
                transform: `translateY(${isHot ? -12 : 0}px) scale(${scale})`,
                transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={() => {
                setHovered(project.id);
                onHover(project.id);
              }}
              onFocus={() => {
                setHovered(project.id);
                onHover(project.id);
              }}
              onClick={() => onSelect(project)}
            >
              <span
                className="relative block size-12 overflow-hidden rounded-[22%] shadow-[0_8px_18px_rgba(0,0,0,0.28)] ring-1 ring-white/25 sm:size-14"
                style={{ background: project.surface }}
              >
                <Image
                  src={project.logo.src}
                  alt=""
                  fill
                  className={
                    project.logo.fill
                      ? "object-cover"
                      : "object-contain p-[12%]"
                  }
                  sizes="56px"
                />
              </span>
              <span
                className={`dock-dot mt-1.5 size-1 rounded-full bg-white/90 ${
                  activeId === project.id ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="pointer-events-none absolute -top-9 hidden rounded-md bg-black/70 px-2 py-0.5 text-[11px] whitespace-nowrap text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus:opacity-100 sm:block">
                {project.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
