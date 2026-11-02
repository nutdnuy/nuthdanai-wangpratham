"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  essays,
  expertise,
  links,
  manifestoRows,
  navigation,
  projects,
  research,
  statement,
  stats,
} from "./content";
import {
  clamp,
  contourPaths,
  isOnScreen,
  lerp,
  pinnedProgress,
  useFrame,
  useHydrated,
  useMediaQuery,
  useReducedMotion,
} from "./motion";

const heroContours = [...contourPaths(1260, 220, 15, 36, 44, 0.6), ...contourPaths(180, 900, 13, 30, 48, 2.1)];
const darkContours = [...contourPaths(300, 260, 14, 40, 46, 1.4), ...contourPaths(1380, 860, 14, 34, 50, 3.3)];

const vars = (values: Record<string, string | number>) => values as CSSProperties;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Contours({ paths, className }: { paths: string[]; className: string }) {
  return (
    <svg className={`nw-contours ${className}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, index) => (
        <path key={index} d={d} pathLength={1} style={vars({ "--i": index % 15 })} />
      ))}
    </svg>
  );
}

function SplitChars({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {Array.from(text).map((char, index) => (
        <span key={index} className="nw-char" style={vars({ "--i": index + offset })}>
          {char === " " ? " " : char}
        </span>
      ))}
    </>
  );
}

function Arrow() {
  return (
    <svg className="nw-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Loader() {
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = count.current;
    if (!element || reducedMotion()) return;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = clamp((now - startedAt) / 1000);
      element.textContent = String(Math.round((1 - (1 - progress) ** 3) * 100)).padStart(3, "0");
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="nw-loader" aria-hidden="true">
      <span className="nw-loader__name">Nuthdanai Wangpratham</span>
      <span className="nw-loader__count" ref={count}>
        000
      </span>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = "";
      html.style.scrollbarGutter = "";
    };
  }, [open]);

  return (
    <>
      <header className="nw-header">
        <a className="nw-brand" href="#top" aria-label="Nuthdanai Wangpratham, back to top">
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/quantcorner-mark-light.svg`} width={32} height={32} alt="" priority unoptimized />
          <span>
            Nuthdanai
            <br />
            Wangpratham
          </span>
        </a>
        <div className="nw-header__actions">
          <a className="nw-pill" href={links.medium} target="_blank" rel="noreferrer">
            Medium <Arrow />
          </a>
          <button
            ref={button}
            type="button"
            className={`nw-menu-btn${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="nw-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nw-menu-btn__bar" />
            <span className="nw-menu-btn__bar" />
          </button>
        </div>
      </header>
      <nav id="nw-menu" className={`nw-menu${open ? " is-open" : ""}`} aria-label="Page sections" inert={!open}>
        <ol className="nw-menu__list">
          {navigation.map((item, index) => (
            <li key={item.href} style={vars({ "--i": index })}>
              <a
                ref={index === 0 ? firstLink : undefined}
                className="nw-menu__link"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="nw-menu__index">0{index + 1}</span>
                <span className="nw-menu__word">{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="nw-menu__foot">Bangkok, Thailand · Quant · AI for Investment</p>
      </nav>
    </>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const lens = useRef({ x: 0.5, y: 0.35, r: 0, tx: 0.5, ty: 0.35, tr: 0, mx: 0, my: 0, tmx: 0, tmy: 0 });

  useFrame(() => {
    const heroEl = hero.current;
    const portraitEl = portrait.current;
    if (!heroEl || !portraitEl) return;
    const progress = clamp(window.scrollY / window.innerHeight);
    heroEl.style.setProperty("--hero-p", progress.toFixed(4));
    if (progress >= 1) return;

    const s = lens.current;
    const follow = reduced ? 1 : 0.16;
    const width = portraitEl.offsetWidth;
    const targetRadius = revealed ? width * 1.5 : s.tr;
    s.x = lerp(s.x, s.tx, follow);
    s.y = lerp(s.y, s.ty, follow);
    s.r = lerp(s.r, targetRadius, reduced ? 1 : revealed ? 0.06 : 0.12);
    s.mx = lerp(s.mx, s.tmx, 0.05);
    s.my = lerp(s.my, s.tmy, 0.05);
    portraitEl.style.setProperty("--lx", `${(s.x * 100).toFixed(2)}%`);
    portraitEl.style.setProperty("--ly", `${(s.y * 100).toFixed(2)}%`);
    portraitEl.style.setProperty("--lr", `${s.r.toFixed(1)}px`);
    portraitEl.style.setProperty("--lo", !revealed && s.r > 6 ? "1" : "0");
    heroEl.style.setProperty("--mx", s.mx.toFixed(4));
    heroEl.style.setProperty("--my", s.my.toFixed(4));
  });

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !portrait.current) return;
    const rect = portrait.current.getBoundingClientRect();
    const s = lens.current;
    s.tx = (event.clientX - rect.left) / rect.width;
    s.ty = (event.clientY - rect.top) / rect.height;
    s.tr = Math.min(170, rect.width * 0.26);
    s.tmx = event.clientX / window.innerWidth - 0.5;
    s.tmy = event.clientY / window.innerHeight - 0.5;
  };

  const onPointerLeave = () => {
    lens.current.tr = 0;
  };

  return (
    <section id="top" ref={hero} className="nw-hero" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <Contours paths={heroContours} className="nw-contours--hero" />
      <h1 className="nw-hero__name" aria-label="Nuthdanai Wangpratham">
        <span className="nw-hero__first" aria-hidden="true">
          <SplitChars text="Nuthdanai" />
        </span>
        <span className="nw-hero__last" aria-hidden="true">
          <SplitChars text="Wangpratham" offset={6} />
        </span>
      </h1>
      <div ref={portrait} className="nw-portrait" data-revealed={revealed}>
        <div className="nw-portrait__stack">
          <div className="nw-portrait__layer">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/nuth/nuth-photo.webp`}
              alt="Portrait photo of Nuthdanai Wangpratham"
              fill
              priority
              sizes="(max-width: 700px) 92vw, 640px"
            />
          </div>
          <div className="nw-portrait__layer nw-portrait__illus" aria-hidden="true">
            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/nuth/nuth-signal.webp`} alt="" fill priority sizes="(max-width: 700px) 92vw, 640px" />
          </div>
        </div>
        <span className="nw-lens" aria-hidden="true" />
      </div>
      <div className="nw-hero__meta">
        <div className="nw-hero__card">
          <p className="nw-kicker">Quant · AI for Investment · Bangkok</p>
          <p>
            Former quant at a Thai asset manager. I write, teach and research how data and AI can make investing
            more evidence-based.
          </p>
        </div>
        <button type="button" className="nw-flip" aria-pressed={revealed} onClick={() => setRevealed((value) => !value)}>
          <span className="nw-flip__dot" aria-hidden="true" />
          {revealed ? "Show photo" : "Show signal"}
        </button>
        <span className="nw-scroll-cue" aria-hidden="true">
          Scroll
          <span className="nw-scroll-cue__line" />
        </span>
      </div>
    </section>
  );
}

function Manifesto() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ smooth: 0, drift: 0, last: 0 });

  useFrame((time) => {
    const sectionEl = section.current;
    if (!sectionEl || !isOnScreen(sectionEl)) {
      state.current.last = 0;
      return;
    }
    const s = state.current;
    const delta = s.last ? Math.min(64, time - s.last) : 16;
    s.last = time;
    s.drift += delta * 0.045;
    s.smooth = lerp(s.smooth, pinnedProgress(sectionEl), 0.1);

    rows.current.forEach((row, index) => {
      if (!row) return;
      const half = row.scrollWidth / 2;
      const direction = index % 2 === 0 ? -1 : 1;
      const position = (s.drift * (1 + index * 0.18) + s.smooth * window.innerWidth * 1.4) * direction;
      const offset = ((position % half) + half) % half;
      row.style.transform = `translate3d(${(-offset).toFixed(1)}px, 0, 0)`;
    });
    frame.current?.style.setProperty("--f", s.smooth.toFixed(4));
  }, !reduced);

  return (
    <section id="about" ref={section} className="nw-manifesto nw-on-dark" aria-label="Principles">
      <div className="nw-manifesto__sticky">
        <Contours paths={darkContours} className="nw-contours--dark" />
        {manifestoRows.map((row, index) => (
          <div
            key={row.strong}
            className="nw-row"
            ref={(element) => {
              rows.current[index] = element;
            }}
            aria-hidden={index > 0}
          >
            {Array.from({ length: 6 }, (_, copy) => (
              <span key={copy} className="nw-row__item" aria-hidden={copy > 0}>
                <em>{row.em}</em> <b>{row.strong}</b>
                <span className="nw-row__ring" />
              </span>
            ))}
          </div>
        ))}
        <figure ref={frame} className="nw-frame">
          <div className="nw-frame__img">
            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/nuth/nuth-illustrated.webp`} alt="Illustrated portrait of Nuthdanai Wangpratham" fill sizes="320px" />
          </div>
          <figcaption>
            <span>nutdnuy</span>
            <span>13.75°N 100.50°E</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Stat({ value, decimals, suffix, label }: (typeof stats)[number]) {
  const number = useRef<HTMLSpanElement>(null);
  const format = (current: number) => `${current.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const element = number.current;
    if (!element || reducedMotion()) return;
    const final = `${value.toFixed(decimals)}${suffix}`;
    element.textContent = `${(0).toFixed(decimals)}${suffix}`;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = clamp((now - startedAt) / 1400);
          element.textContent = `${(value * (1 - (1 - progress) ** 4)).toFixed(decimals)}${suffix}`;
          if (progress < 1) frame = requestAnimationFrame(tick);
          else element.textContent = final;
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [decimals, suffix, value]);

  return (
    <div className="nw-stat" data-reveal="">
      <span className="nw-stat__value" ref={number} aria-hidden="true">
        {format(value)}
      </span>
      <span className="nw-sr">{format(value)}</span>
      <span className="nw-stat__label">{label}</span>
    </div>
  );
}

function Story() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const smooth = useRef(0);

  useFrame(() => {
    const sectionEl = section.current;
    if (!sectionEl || !isOnScreen(sectionEl)) return;
    smooth.current = lerp(smooth.current, pinnedProgress(sectionEl), 0.14);
    const lit = smooth.current * 1.15 * statement.length;
    words.current.forEach((word, index) => {
      word?.style.setProperty("--o", clamp(lit - index, 0.14, 1).toFixed(3));
    });
  }, !reduced);

  return (
    <>
      <section ref={section} className="nw-story" aria-labelledby="nw-story-title">
        <div className="nw-story__sticky">
          <p className="nw-eyebrow">About</p>
          <h2 id="nw-story-title" className="nw-statement">
            {statement.map((item, index) => (
              <span
                key={index}
                className="nw-word"
                ref={(element) => {
                  words.current[index] = element;
                }}
              >
                {item.em ? <em>{item.word}</em> : item.word}{" "}
              </span>
            ))}
          </h2>
        </div>
      </section>
      <section className="nw-about" aria-label="Background">
        <div className="nw-about__copy">
          <p data-reveal="">
            I started as a quant at an asset management company in Thailand. Today I work on Responsible AI and spend
            my evenings making quantitative finance easier to learn — through QuantCorner, Quantsera and the QUANT I
            LOVE U publication on Medium.
          </p>
          <ul className="nw-chips" aria-label="Areas of expertise">
            {expertise.map((item, index) => (
              <li key={item} data-reveal="" style={vars({ "--i": index })}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="nw-stats">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </section>
    </>
  );
}

function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const card = useRef<HTMLDivElement>(null);

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = card.current;
    if (event.pointerType !== "mouse" || !element || reducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--tilt-rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
    element.style.setProperty("--tilt-ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
    element.style.setProperty("--tilt-gx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--tilt-gy", `${(y * 100).toFixed(1)}%`);
    element.classList.add("is-tilting", "is-hover");
  };

  const onLeave = () => {
    const element = card.current;
    if (!element) return;
    element.style.setProperty("--tilt-rx", "0deg");
    element.style.setProperty("--tilt-ry", "0deg");
    element.classList.remove("is-tilting", "is-hover");
  };

  return (
    <div className={`t-tilt ${className ?? ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="t-tilt-card" ref={card}>
        {children}
        <div className="t-tilt-glare" />
      </div>
    </div>
  );
}

function Writing() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  const pinned = wide && !reduced;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const motion = useRef({ smooth: 0, distance: 0 });

  useEffect(() => {
    const sectionEl = section.current;
    const trackEl = track.current;
    if (!pinned || !sectionEl || !trackEl) return;
    const size = () => {
      const distance = Math.max(0, trackEl.scrollWidth - document.documentElement.clientWidth);
      motion.current.distance = distance;
      sectionEl.style.height = `${distance + window.innerHeight}px`;
    };
    size();
    window.addEventListener("resize", size);
    return () => {
      window.removeEventListener("resize", size);
      sectionEl.style.removeProperty("height");
      trackEl.style.removeProperty("transform");
    };
  }, [pinned]);

  useFrame(() => {
    const sectionEl = section.current;
    if (!sectionEl || !isOnScreen(sectionEl)) return;
    const m = motion.current;
    m.smooth = lerp(m.smooth, pinnedProgress(sectionEl), 0.12);
    if (track.current) track.current.style.transform = `translate3d(${(-m.smooth * m.distance).toFixed(1)}px, 0, 0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${m.smooth.toFixed(4)})`;
  }, pinned);

  return (
    <section id="writing" ref={section} className={`nw-writing${pinned ? " is-pinned" : ""}`} aria-labelledby="nw-writing-title">
      <div className="nw-writing__sticky">
        <div className="nw-section-head">
          <div>
            <p className="nw-eyebrow">Writing</p>
            <h2 id="nw-writing-title" className="nw-title" data-reveal="">
              Notes from the <em>quant desk</em>
            </h2>
          </div>
          <a className="nw-link" href={links.medium} target="_blank" rel="noreferrer">
            All essays on Medium <Arrow />
          </a>
        </div>
        <div className="nw-track" ref={track}>
          {essays.map((essay, index) => (
            <Tilt key={essay.title} className="nw-card-wrap">
              <a className="nw-card" href={links.medium} target="_blank" rel="noreferrer">
                <span className="nw-card__top">
                  <span className="nw-card__num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="nw-card__tag">Essay · Medium</span>
                </span>
                <span className="nw-card__title" lang={essay.lang}>
                  {essay.title}
                </span>
                <span className="nw-card__cta">
                  Read on Medium <Arrow />
                </span>
              </a>
            </Tilt>
          ))}
          <Tilt className="nw-card-wrap">
            <a className="nw-card nw-card--end" href={links.medium} target="_blank" rel="noreferrer">
              <span className="nw-card__tag">QUANT I LOVE U</span>
              <span className="nw-card__title">
                Every essay lives on <em>Medium</em>.
              </span>
              <span className="nw-card__cta">
                nutdnuy.medium.com <Arrow />
              </span>
            </a>
          </Tilt>
        </div>
        {pinned && (
          <div className="nw-progress" aria-hidden="true">
            <span ref={bar} />
          </div>
        )}
      </div>
    </section>
  );
}

function Research() {
  return (
    <section id="research" className="nw-research" aria-labelledby="nw-research-title">
      <div className="nw-section-head">
        <div>
          <p className="nw-eyebrow">Research</p>
          <h2 id="nw-research-title" className="nw-title" data-reveal="">
            Testing AI on <em>Thai markets</em>
          </h2>
        </div>
      </div>
      <ol className="nw-papers">
        {research.map((paper, index) => (
          <li key={paper.title} className="nw-paper" data-reveal="" style={vars({ "--i": index })}>
            <span className="nw-paper__venue">
              {paper.venue}
              {paper.year && <span> · {paper.year}</span>}
            </span>
            <span className="nw-paper__title">{paper.title}</span>
            <span className="nw-paper__note">{paper.note}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="nw-projects nw-on-dark" aria-labelledby="nw-projects-title">
      <div className="nw-section-head">
        <div>
          <p className="nw-eyebrow">Projects</p>
          <h2 id="nw-projects-title" className="nw-title" data-reveal="">
            Building the <em>quant corner</em> of Thailand
          </h2>
        </div>
      </div>
      <ul className="nw-grid">
        {projects.map((project, index) => {
          const body = (
            <>
              <span className="nw-tile__top">
                <span className="nw-tile__role">{project.role}</span>
                {project.mark ? (
                  <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/quantcorner-mark-dark.svg`} width={40} height={40} alt="" unoptimized />
                ) : (
                  <span className="nw-tile__num">{String(index + 1).padStart(2, "0")}</span>
                )}
              </span>
              <span className="nw-tile__name">{project.name}</span>
              <span className="nw-tile__desc">
                {project.description}
                {project.href && <Arrow />}
              </span>
            </>
          );
          return (
            <li key={project.name} data-reveal="" style={vars({ "--i": index })}>
              {project.href ? (
                <a
                  className="nw-tile"
                  href={project.href}
                  {...(project.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {body}
                </a>
              ) : (
                <div className="nw-tile">{body}</div>
              )}
            </li>
          );
        })}
        <li data-reveal="" style={vars({ "--i": projects.length })}>
          <a className="nw-tile nw-tile--cta" href="#contact">
            <span className="nw-tile__role">Open to</span>
            <span className="nw-tile__name">Talks, teaching &amp; research</span>
            <span className="nw-tile__desc">
              Say hello <Arrow />
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}

function Magnetic({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  const onMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse" || reducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--tx", `${((event.clientX - rect.left - rect.width / 2) * 0.3).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--ty", `${((event.clientY - rect.top - rect.height / 2) * 0.4).toFixed(1)}px`);
  };
  const onLeave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--tx", "0px");
    event.currentTarget.style.setProperty("--ty", "0px");
  };
  return (
    <a
      className="nw-magnetic"
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function Contact() {
  return (
    <footer id="contact" className="nw-contact nw-on-dark" aria-labelledby="nw-contact-title">
      <p className="nw-eyebrow">Contact</p>
      <h2 id="nw-contact-title" className="nw-contact__title" aria-label="Let's talk quant.">
        <span aria-hidden="true">
          <SplitChars text="Let's talk" />
        </span>
        <em aria-hidden="true">
          <SplitChars text="quant." offset={10} />
        </em>
      </h2>
      <div className="nw-contact__links">
        <Magnetic href={links.email}>
          nutdnuy@gmail.com <Arrow />
        </Magnetic>
        <Magnetic href={links.medium}>
          Medium <Arrow />
        </Magnetic>
        <Magnetic href={links.muckRack}>
          Muck Rack <Arrow />
        </Magnetic>
        <Magnetic href={links.learn}>
          QuantCorner <Arrow />
        </Magnetic>
      </div>
      <div className="nw-footer-bar">
        <span className="nw-footer-bar__brand">
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/quantcorner-mark-dark.svg`} width={28} height={28} alt="" unoptimized />
          Part of QuantCorner
        </span>
        <span>© 2026 Nuthdanai Wangpratham</span>
        <a href="#top">Back to top ↑</a>
      </div>
      <p className="nw-giant" data-reveal="" aria-hidden="true">
        Nuthdanai
      </p>
    </footer>
  );
}

export function NuthSite() {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const motion = hydrated && !reduced;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    if (!motion || !rootEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-shown");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -24px 0px" },
    );
    rootEl.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motion]);

  return (
    <div ref={root} className={`nw${motion ? " is-motion" : ""}`} lang="en">
      <Loader />
      <Header />
      <main id="main-content">
        <Hero />
        <Manifesto />
        <Story />
        <Writing />
        <Research />
        <Projects />
      </main>
      <Contact />
    </div>
  );
}
