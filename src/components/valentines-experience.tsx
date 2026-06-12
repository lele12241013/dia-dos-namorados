"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Track = {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  audio: string;
  video?: string;
};

type TimelineEvent = {
  title: string;
  subtitle: string;
};

type FlowerParticleKind = "rose" | "petal" | "cherry" | "spark";

type FlowerParticle = {
  id: number;
  kind: FlowerParticleKind;
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  vr: number;
  life: number;
  size: number;
  depth: number;
  swaySeed: number;
  colorA: string;
  colorB: string;
};

// Base URL for audio/video assets (CDN). Use env var when available.
const MEDIA_BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_URL || "https://diadosnamorados.b-cdn.net";

function buildMediaUrl(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${MEDIA_BASE}/${encodeURIComponent(pathOrUrl)}`;
}

const tracks: Track[] = [
  // Build audio/video URLs from a CDN base. Configure `NEXT_PUBLIC_AUDIO_BASE_URL`
  // or fallback to the provided CDN domain. Filenames are encoded to avoid
  // spaces or special characters breaking requests.
  // Example final url: https://diadosnamorados.b-cdn.net/Daylight.mp4
  {
    id: 1,
    title: "Your Name",
    artist: "Radwimps",
    duration: 243,
    cover: "/yn.jpg",
    audio: "your name.mp4",
    video: "your name.mp4",
  },
  {
    id: 2,
    title: "Daylight",
    artist: "David Kushner",
    duration: 228,
    cover: "/dl.jpg",
    audio: "Daylight.mp4",
    video: "Daylight.mp4",
  },
  {
    id: 3,
    title: "Perfect",
    artist: "Ed Sheeran",
    duration: 204,
    cover: "/pf.jpg",
    audio: "Perfect.mp4",
    video: "Perfect.mp4",
  },
  {
    id: 4,
    title: "Holligan",
    artist: "Holligan",
    duration: 246,
    cover: "/bt.jpg",
    audio: "holligan.mp4",
    video: "holligan.mp4",
  },
];

const timelineEvents: TimelineEvent[] = [
  { title: "Primeiro encontro", subtitle: "O instante em que o mundo desacelerou." },
  { title: "Primeiro beijo", subtitle: "Quando o tempo aprendeu a sorrir." },
  { title: "Hoje", subtitle: "Ainda escrevendo o nosso infinito, juntos." },
];

const galleryImages = [
  "/mao.jpeg",
];

const letterLines = [
  "Desde o primeiro olhar, eu soube que havia algo raro em voce.",
  "Voce trouxe calma para os meus dias e intensidade para os meus sonhos.",
  "Cada risada sua virou trilha sonora das minhas melhores memorias.",
  "Quando segura minha mao, o mundo inteiro parece no lugar certo.",
  "Obrigado por escolher caminhar comigo, hoje e em todos os proximos capitulos.",
  "Eu te amo alem de qualquer palavra que eu consiga escrever.",
];

const floatingHearts = [
  { left: "10%", top: "22%", delay: "0s", duration: "12s", size: "text-xl" },
  { left: "23%", top: "60%", delay: "1.2s", duration: "13s", size: "text-sm" },
  { left: "68%", top: "18%", delay: "0.4s", duration: "11s", size: "text-lg" },
  { left: "79%", top: "54%", delay: "1.8s", duration: "14s", size: "text-base" },
  { left: "50%", top: "34%", delay: "0.9s", duration: "10s", size: "text-xs" },
];

const relationshipStart = new Date("2023-06-12T20:00:00").getTime();

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getDurationParts(now: number) {
  const diff = Math.max(0, now - relationshipStart);
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function handleProgressClick(
  e: React.MouseEvent,
  progressBarRef: React.RefObject<HTMLDivElement | null>,
  duration: number,
  audioRef: React.RefObject<HTMLAudioElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  if (!progressBarRef.current) return;

  const rect = progressBarRef.current.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration;

  if (audioRef.current) {
    audioRef.current.currentTime = newTime;
  }
  if (videoRef.current) {
    videoRef.current.currentTime = newTime;
  }
}

export function ValentinesExperience() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const phoneSectionRef = useRef<HTMLElement | null>(null);
  const letterSectionRef = useRef<HTMLElement | null>(null);
  const phoneCardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const flowerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstScrimRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<FlowerParticle[]>([]);
  const burstRafRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(tracks[0].duration);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [visibleLetterLines, setVisibleLetterLines] = useState(0);
  const [expandedLetter, setExpandedLetter] = useState(false);
  const [clock, setClock] = useState(0);
  const [autoStarted, setAutoStarted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isSiteLoading, setIsSiteLoading] = useState(true);
  const [showFlowerBurst, setShowFlowerBurst] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const activeTrack = tracks[currentTrackIndex];
  const letterInView = useInView(letterSectionRef, { amount: 0.35, once: true });

  const { scrollYProgress } = useScroll();
  const heroDepth = useTransform(scrollYProgress, [0, 0.22], [0, -130]);

  useEffect(() => {
    let rafId: number;
    const startedAt = performance.now();
    const durationMs = 2500;

    const tick = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - raw, 2.7);
      setLoadProgress(Math.round(eased * 100));

      if (raw < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setLoadProgress(100);
        window.setTimeout(() => {
          setIsSiteLoading(false);
          setShowFlowerBurst(true);
        }, 140);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!showFlowerBurst) return;

    const canvas = flowerCanvasRef.current;
    const scrim = burstScrimRef.current;
    if (!canvas || !scrim) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rosePalette = ["#6d28d9", "#5b21b6", "#8b5cf6"];
    const petalPalette = ["#e9d5ff", "#c4b5fd", "#a78bfa"];
    const cherryPalette = ["#ddd6fe", "#c084fc", "#a855f7"];
    const sparkPalette = ["#ede9fe", "#c4b5fd", "#ddd6fe"];

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const createParticle = (id: number, width: number, height: number): FlowerParticle => {
      const kindRoll = Math.random();
      const kind: FlowerParticleKind =
        kindRoll < 0.12 ? "rose" : kindRoll < 0.62 ? "petal" : kindRoll < 0.88 ? "cherry" : "spark";
      const depth = rand(0.55, 1.35);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(260, 780) * depth;
      const palette =
        kind === "rose" ? rosePalette : kind === "petal" ? petalPalette : kind === "cherry" ? cherryPalette : sparkPalette;

      return {
        id,
        kind,
        x: width * 0.5 + rand(-18, 18),
        y: height * 0.5 + rand(-18, 18),
        px: width * 0.5,
        py: height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(140, 300),
        gravity: rand(240, 420) / depth,
        rotation: rand(0, 360),
        vr: rand(-180, 180),
        life: rand(0.88, 1.2),
        size:
          kind === "rose" ? rand(11, 22) : kind === "petal" ? rand(7, 16) : kind === "cherry" ? rand(9, 18) : rand(2, 5),
        depth,
        swaySeed: rand(0, Math.PI * 2),
        colorA: palette[Math.floor(rand(0, palette.length))],
        colorB: palette[Math.floor(rand(0, palette.length))],
      };
    };

    const drawPetal = (particle: FlowerParticle) => {
      ctx.rotate((particle.rotation * Math.PI) / 180);
      const w = particle.size * (particle.kind === "petal" ? 0.82 : 0.9);
      const h = particle.size * (particle.kind === "spark" ? 1 : 1.5);

      const grad = ctx.createLinearGradient(-w, -h, w, h);
      grad.addColorStop(0, particle.colorA);
      grad.addColorStop(1, particle.colorB);
      ctx.fillStyle = grad;

      if (particle.kind === "spark") {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.bezierCurveTo(w * 0.9, -h * 0.55, w * 0.75, h * 0.8, 0, h);
      ctx.bezierCurveTo(-w * 0.75, h * 0.8, -w * 0.9, -h * 0.55, 0, -h);
      ctx.fill();

      if (particle.kind === "rose") {
        ctx.globalAlpha *= 0.72;
        ctx.fillStyle = "rgba(49, 20, 100, 0.38)";
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha /= 0.72;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = width < 768 ? 240 : 420;
    particlesRef.current = Array.from({ length: count }, (_, i) => createParticle(i, width, height));

    const startedAt = performance.now();
    const explosionDuration = 900;
    const totalDuration = 6200;
    let lastTime = startedAt;

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      const elapsed = now - startedAt;
      lastTime = now;
      const isExploding = elapsed < explosionDuration;
      const fadeFactor = Math.max(0, 1 - (elapsed - explosionDuration) / (totalDuration - explosionDuration));

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particlesRef.current) {
        particle.px = particle.x;
        particle.py = particle.y;

        if (isExploding) {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vy += particle.gravity * 0.36 * dt;
          particle.vx *= 0.985;
        } else {
          const wind = Math.sin(elapsed * 0.0024 + particle.swaySeed) * (36 / particle.depth);
          particle.vy += particle.gravity * dt;
          particle.vx += wind * dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vx *= 0.993;
        }

        particle.rotation += particle.vr * dt;
        particle.life -= isExploding ? 0.04 * dt : 0.1 * dt;

        const alpha = Math.max(0, Math.min(1, particle.life * fadeFactor));
        if (alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = particle.kind === "spark" ? 18 : 8;
        ctx.shadowColor = particle.kind === "spark" ? "rgba(221, 214, 254, 0.8)" : "rgba(167, 139, 250, 0.3)";
        ctx.translate(particle.x, particle.y);
        drawPetal(particle);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha * 0.18;
        ctx.strokeStyle = particle.kind === "spark" ? "#ddd6fe" : "#c4b5fd";
        ctx.lineWidth = Math.max(1, particle.size * 0.16);
        ctx.beginPath();
        ctx.moveTo(particle.px, particle.py);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
        ctx.restore();
      }

      if (scrim) {
        const scrimOpacity = elapsed < 900 ? 0.9 : Math.max(0, 0.9 - ((elapsed - 900) / (totalDuration - 900)) * 0.9);
        scrim.style.opacity = `${scrimOpacity}`;
      }

      if (elapsed < totalDuration) {
        burstRafRef.current = window.requestAnimationFrame(frame);
      } else {
        setShowFlowerBurst(false);
      }
    };

    burstRafRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (burstRafRef.current) {
        window.cancelAnimationFrame(burstRafRef.current);
      }
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [showFlowerBurst]);

  useEffect(() => {
    // Force scroll to top on mount using multiple RAF calls to override browser restoration
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    // Reset immediately
    resetScroll();

    // Reset on next few frames to override browser history restoration
    let frameCount = 0;
    const raf = () => {
      frameCount++;
      resetScroll();
      if (frameCount < 5) {
        requestAnimationFrame(raf);
      }
    };
    requestAnimationFrame(raf);

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    // Reset scroll when loading state changes (especially when loading finishes)
    if (!isSiteLoading) {
      const resetScroll = () => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };

      resetScroll();

      let frameCount = 0;
      const raf = () => {
        frameCount++;
        resetScroll();
        if (frameCount < 5) {
          requestAnimationFrame(raf);
        }
      };
      requestAnimationFrame(raf);
      // Try to start audio playback when loading finishes.
      // Autoplay may be blocked by the browser; handle promise rejection.
      const audio = audioRef.current;
      const video = videoRef.current;
      if (audio) {
        const tryPlay = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
            if (video) {
              try {
                await video.play();
              } catch {}
            }
          } catch (err) {
            // Autoplay blocked or other error — keep isPlaying false
            setIsPlaying(false);
          }
        };
        void tryPlay();
      }
    }
  }, [isSiteLoading]);

  useEffect(() => {
    // Note: overflow is now controlled exclusively by CSS.
    // During loading/burst, main element uses fixed positioning with full coverage,
    // which naturally prevents scrolling without modifying body.style.overflow.
  }, [isSiteLoading, showFlowerBurst]);

  useEffect(() => {
    const updateScrub = () => {
      ScrollTrigger.update();
    };

    gsap.ticker.add(updateScrub);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateScrub);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current && heroSectionRef.current) {
        gsap.to(heroTitleRef.current, {
          scale: 0.66,
          y: -120,
          opacity: 0.58,
          ease: "none",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (phoneCardRef.current && phoneSectionRef.current) {
        gsap.fromTo(
          phoneCardRef.current,
          { autoAlpha: 0, y: 120, scale: 0.8, filter: "blur(16px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            ease: "power2.out",
            scrollTrigger: {
              trigger: phoneSectionRef.current,
              start: "top 75%",
              end: "top 30%",
              scrub: true,
            },
          },
        );
      }

      gsap.fromTo(
        "#timelineLine",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: "#timeline",
            start: "top 65%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        ".timeline-item",
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#timeline",
            start: "top 60%",
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".scroll-section").forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 72, scale: 0.985, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.to(".parallax-card", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (!audio) return;

    if (isPlaying) {
      void audio.play().catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        setIsPlaying(false);
      });
      if (video) {
        void video.play().catch(() => {});
      }
    } else {
      audio.pause();
      if (video) {
        video.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video || !activeTrack.video) return;

    const playWhenReady = () => {
      if (!isPlaying) return;
      void audio.play().catch(() => {});
      void video.play().catch(() => {});
    };

    audio.addEventListener("canplay", playWhenReady, { once: true });

    audio.load();
    video.load();
    setElapsed(0);
    setDuration(activeTrack.duration);

    return () => {
      audio.removeEventListener("canplay", playWhenReady);
    };
  }, [activeTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    // Keep the video element muted to avoid duplicate audio (video files contain audio tracks).
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!letterInView || expandedLetter) {
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleLetterLines((prev) => {
        const next = prev + 1;
        if (next >= letterLines.length) {
          window.clearInterval(interval);
        }
        return Math.min(next, letterLines.length);
      });
    }, 850);

    return () => {
      window.clearInterval(interval);
    };
  }, [letterInView, expandedLetter]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleProgressClick(
        e as any,
        progressBarRef,
        duration,
        audioRef,
        videoRef,
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, duration]);

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  const safeLoadProgress = Math.max(0, Math.min(100, loadProgress));
  const relationship = useMemo(() => getDurationParts(clock), [clock]);

  return (
    <main className="relative overflow-x-clip text-violet-50">
      <AnimatePresence>
        {isSiteLoading ? (
          <motion.div
            key="loading-screen"
            className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-[#120f0c]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 16% 10%, rgba(236, 72, 153, 0.22), transparent 38%), radial-gradient(circle at 82% 0%, rgba(147, 51, 234, 0.26), transparent 36%), radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.2), transparent 44%), linear-gradient(150deg, #0f0a17 4%, #171026 45%, #050308 100%)",
                backgroundAttachment: "fixed",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.11]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                animation: "ambient-grid-shift 26s linear infinite",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5))]" />

            <div className="relative w-[min(92vw,760px)] px-6 py-10 text-center sm:px-10">
              <motion.h2
                className="hero-title mt-5 text-4xl text-violet-50 sm:text-5xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Florescendo nossa historia
              </motion.h2>

              <div className="mt-10 flex items-center justify-center gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <motion.span
                    key={`loading-flower-${index}`}
                    className="text-3xl text-fuchsia-200"
                    animate={{ y: [0, -10, 0], opacity: [0.45, 1, 0.45], rotate: [0, 12, -10, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.3,
                      delay: index * 0.12,
                    }}
                  >
                    ✿
                  </motion.span>
                ))}
              </div>

              <div className="mx-auto mt-9 w-[min(78vw,520px)]">
                <div className="h-3 overflow-hidden rounded-full border border-fuchsia-100/25 bg-black/35 shadow-[inset_0_0_16px_rgba(0,0,0,0.46)]">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6_0%,#d946ef_42%,#f472b6_78%,#c4b5fd_100%)] shadow-[0_0_22px_rgba(212,70,239,0.52)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${safeLoadProgress}%` }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/80">
                  <span>Aquecendo o cenario</span>
                  <span>{safeLoadProgress}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showFlowerBurst ? (
          <motion.div
            key="flower-burst"
            className="pointer-events-none fixed inset-0 z-[130] overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            aria-hidden
          >
            <div
              ref={burstScrimRef}
              className="absolute inset-0"
              style={{
                opacity: 0.9,
                background:
                  "radial-gradient(circle at 50% 40%, rgba(255,235,224,0.28), rgba(12,8,7,0.92) 48%, rgba(6,4,3,0.97) 100%)",
              }}
            />
            <canvas ref={flowerCanvasRef} className="absolute inset-0 h-full w-full" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {activeTrack.audio ? (
        <audio
          ref={audioRef}
          src={buildMediaUrl(activeTrack.audio)}
          crossOrigin="anonymous"
          preload="metadata"
          onTimeUpdate={(event) => {
            setElapsed(event.currentTarget.currentTime);
          }}
          onLoadedMetadata={(event) => {
            const loaded = Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : activeTrack.duration;
            setDuration(Math.max(activeTrack.duration, loaded));
          }}
          onEnded={() => {
            setIsPlaying(false);
            setElapsed(0);
          }}
        />
      ) : null}

      <section id="hero" ref={heroSectionRef} className="scroll-section relative flex min-h-[88vh] items-center justify-center overflow-x-clip px-4 py-12 sm:min-h-screen sm:px-6 sm:py-16">
        <motion.div
          style={{ y: heroDepth }}
          className="pointer-events-none absolute inset-0 overflow-visible"
          aria-hidden
        >
          <div
            className="absolute inset-[-10%] blur-2xl"
            style={{
              background:
                "radial-gradient(52% 44% at 50% 8%, rgba(168,85,247,0.28), transparent 72%), radial-gradient(44% 36% at 18% 72%, rgba(236,72,153,0.2), transparent 74%), radial-gradient(40% 34% at 82% 64%, rgba(139,92,246,0.22), transparent 76%)",
            }}
          />
        </motion.div>

        {Array.from({ length: 28 }).map((_, index) => (
          <motion.span
            key={`spark-${index}`}
            className="pointer-events-none absolute h-1 w-1 rounded-full bg-violet-100/90"
            style={{
              left: `${(index * 13) % 100}%`,
              top: `${(index * 23) % 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.8, 0.8] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.8 + (index % 7),
              delay: (index % 6) * 0.2,
            }}
          />
        ))}

        {floatingHearts.map((heart) => (
          <span
            key={`${heart.left}-${heart.top}`}
            className={clsx(
              "floating-heart pointer-events-none absolute text-pink-300/75",
              heart.size,
            )}
            style={{
              left: heart.left,
              top: heart.top,
              animationDelay: heart.delay,
              ["--duration" as string]: heart.duration,
            }}
            aria-hidden
          >
            ❤
          </span>
        ))}

        <div className="relative z-10 max-w-5xl px-2 text-center sm:px-0">
          <h1
            ref={heroTitleRef}
            className="hero-title text-3xl leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            Para a pessoa mais especial do meu universo.
          </h1>
        </div>
      </section>

      <motion.section
        id="playlist"
        ref={phoneSectionRef}
        className="scroll-section relative px-4 py-16 sm:px-6 sm:py-36"
        onViewportEnter={() => {
          if (autoStarted) {
            return;
          }
          setAutoStarted(true);
          setIsPlaying(true);
        }}
        viewport={{ amount: 0.55, once: true }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9 }}
          className="mx-auto flex max-w-6xl justify-center px-0 sm:px-6"
        >
          <div className="flex justify-center" style={{ perspective: "1200px" }}>
            <div
              ref={phoneCardRef}
              className="glass-panel w-full max-w-[280px] rounded-[2rem] p-4 sm:max-w-[340px] sm:rounded-[2.5rem] sm:p-5 transform-none sm:[transform:rotateX(7deg)_rotateY(-12deg)]"
              style={{ transformStyle: "preserve-3d" }}
            >
                <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-white/25" />
                <div className="relative overflow-hidden rounded-[1.8rem] bg-[#0f0a1d] p-4 shadow-[inset_0_0_30px_rgba(173,123,255,.18)]">

                  <motion.div
                    className="mx-auto mb-5 h-60 w-full max-w-sm overflow-hidden rounded-xl border border-white/15 shadow-[0_0_28px_rgba(177,132,255,.35)] sm:mb-6 sm:h-72"
                  >
                    {activeTrack.video ? (
                      <video
                        ref={videoRef}
                        src={buildMediaUrl(activeTrack.video)}
                        crossOrigin="anonymous"
                        muted
                        className="h-full w-full object-cover"
                        loop
                        playsInline
                        preload="auto"
                        onTimeUpdate={(event) => {
                          setElapsed(event.currentTarget.currentTime);
                        }}
                        onLoadedMetadata={(event) => {
                          const loaded = Number.isFinite(event.currentTarget.duration)
                            ? event.currentTarget.duration
                            : activeTrack.duration;
                          setDuration(Math.max(activeTrack.duration, loaded));
                        }}
                      />
                    ) : (
                      <Image
                        src={activeTrack.cover}
                        alt={activeTrack.title}
                        width={420}
                        height={420}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </motion.div>

                  <p className="text-center text-lg font-semibold text-white sm:text-xl">{activeTrack.title}</p>
                  <p className="mt-1 text-center text-xs text-violet-200/70 sm:text-sm">{activeTrack.artist}</p>

                  <div
                    ref={progressBarRef}
                    className="mt-6 h-1.5 w-full cursor-pointer rounded-full bg-white/12 hover:h-2"
                    onClick={(e) =>
                      handleProgressClick(e, progressBarRef, duration, audioRef, videoRef)
                    }
                    onMouseDown={() => setIsDragging(true)}
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 to-violet-200"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-violet-200/75">
                    <span>{formatTime(elapsed)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
                    <button
                      onClick={() => {
                        setCurrentTrackIndex(
                          (prev) => (prev - 1 + tracks.length) % tracks.length,
                        );
                        setIsPlaying(true);
                      }}
                      className="text-violet-200/70 transition hover:text-white hover:scale-110"
                      aria-label="Anterior"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:h-[22px] sm:w-[22px]">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)] transition hover:scale-105 sm:h-12 sm:w-12"
                      aria-label={isPlaying ? "Pausar" : "Tocar"}
                    >
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:h-5 sm:w-5">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:h-5 sm:w-5">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
                        setIsPlaying(true);
                      }}
                      className="text-violet-200/70 transition hover:text-white hover:scale-110"
                      aria-label="Próxima"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:h-[22px] sm:w-[22px]">
                        <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-3 sm:mt-6">
                    <button
                      onClick={() => {
                        if (isMuted) {
                          setIsMuted(false);
                          setVolume(previousVolume);
                        } else {
                          setPreviousVolume(volume);
                          setIsMuted(true);
                        }
                      }}
                      className="text-violet-200/70 transition hover:text-white flex-shrink-0"
                      aria-label={isMuted ? "Desmutar" : "Mutar"}
                    >
                      {isMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02z" opacity="0.3"/><path d="M3 9v6h4l5 5V4L7 9H3z"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVolume = Number(e.target.value);
                        if (isMuted && newVolume > 0) {
                          setIsMuted(false);
                        }
                        setVolume(newVolume);
                      }}
                      className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-violet-300 sm:w-24"
                    />
                  </div>

                  <div className="mt-6 flex h-8 items-end justify-center gap-1.5">
                    {Array.from({ length: 18 }).map((_, barIndex) => (
                      <motion.span
                        key={`bar-${barIndex}`}
                        className="w-1 rounded-full bg-violet-200/70"
                        animate={{ height: isPlaying ? [6, 24, 10, 20] : [6] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.3,
                          delay: barIndex * 0.05,
                        }}
                      />
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <section className="scroll-section px-4 py-16 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center text-3xl text-white sm:text-5xl">Nossas musicas</h2>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((track, index) => (
              <motion.button
                key={track.id}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className={clsx(
                  "glass-panel group relative min-w-60 snap-center rounded-3xl p-5 text-left",
                  index === currentTrackIndex && "border-violet-200/60",
                )}
              >
                <div className="vinyl-spin relative mx-auto h-40 w-40 rounded-full bg-[#060608] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_10px_28px_rgba(3,2,6,.72)]">
                  <div className="absolute inset-[9px] overflow-hidden rounded-full border border-white/8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                    <Image
                      src={track.cover}
                      alt={track.title}
                      width={220}
                      height={220}
                      className="h-full w-full object-cover opacity-100"
                    />
                  </div>
                  <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_16%,rgba(0,0,0,0)_36%),radial-gradient(circle_at_50%_50%,transparent_58%,rgba(255,255,255,0.03)_59%,transparent_61%)]" />
                  <div className="absolute inset-[18px] rounded-full border border-white/5" />
                  <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[#0b0b10] shadow-[inset_0_0_8px_rgba(255,255,255,0.05)]" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">{track.title}</h3>
                <p className="text-sm text-violet-200/75">{track.artist}</p>
                <p className="mt-3 text-xs tracking-[0.2em] text-violet-200/55 uppercase">
                  {formatTime(track.duration)}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section id="timeline" className="scroll-section relative px-4 py-16 sm:px-6 sm:py-36">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-title text-center text-3xl text-white sm:text-5xl">Nossa Historia</h2>

          <div className="relative mt-10 pl-6 sm:mt-14 sm:pl-12">
            <span
              id="timelineLine"
              className="absolute left-1 top-0 h-full w-px origin-top bg-gradient-to-b from-fuchsia-200/90 via-violet-300/40 to-transparent sm:left-4"
            />

            <div className="space-y-7 sm:space-y-9">
              {timelineEvents.map((event) => (
                <article key={event.title} className="timeline-item parallax-card glass-panel relative rounded-2xl p-4 sm:p-5 sm:p-6">
                  <span className="absolute -left-[1.9rem] top-6 sm:-left-[3rem] sm:top-7" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20.5l-1.2-1.1C5.8 14.8 2.5 11.7 2.5 7.9 2.5 4.8 4.9 2.5 8 2.5c1.8 0 3.5.8 4.6 2.1C13.7 3.3 15.4 2.5 17.2 2.5c3.1 0 5.5 2.3 5.5 5.4 0 3.8-3.3 6.9-8.3 11.5L12 20.5z" fill="rgba(251,191,116,.92)"/>
                    </svg>
                  </span>
                  <h3 className="text-xl text-white">{event.title}</h3>
                  <p className="mt-2 text-sm text-violet-100/75 sm:text-base">{event.subtitle}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-section px-4 py-16 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center text-3xl text-white sm:text-5xl">Galeria</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-violet-100/75">
            Por enquanto temos só uma foto, mas estamos construindo nossa galeria e nossas memorias juntos.
          </p>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((photo, index) => (
              <motion.button
                key={photo}
                className="parallax-card glass-panel group relative overflow-hidden rounded-3xl"
                onClick={() => setActiveImage(index)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, delay: index * 0.08 }}
              >
                <Image
                  src={photo}
                  alt={`Memoria ${index + 1}`}
                  width={900}
                  height={650}
                  className="h-56 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-64"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 transition group-hover:opacity-95" />
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {activeImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#06030d]/90 px-6 py-10 backdrop-blur-md"
            >
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.94 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-[#0c0914]/90 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative flex max-h-[78vh] items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                  <Image
                    src={galleryImages[activeImage]}
                    alt="Memoria ampliada"
                    width={1200}
                    height={900}
                    className="max-h-[78vh] w-auto max-w-full object-contain"
                    sizes="(max-width: 768px) 92vw, 720px"
                    priority
                  />
                  <button
                    onClick={() => setActiveImage(null)}
                    className="absolute right-3 top-3 rounded-full bg-black/55 px-4 py-2 text-sm text-white backdrop-blur"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section id="letter" ref={letterSectionRef} className="scroll-section px-4 py-16 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-4xl rounded-3xl border border-violet-200/20 bg-gradient-to-b from-[#130924] to-[#0d0718] p-6 shadow-[0_0_40px_rgba(150,98,255,.2)] sm:p-8 sm:p-12">
          <h2 className="section-title text-3xl text-white sm:text-5xl">Carta romantica</h2>

          <div className="mt-8 space-y-3 text-violet-50/90">
            {letterLines
              .slice(0, expandedLetter ? letterLines.length : visibleLetterLines)
              .map((line, index) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="text-base leading-relaxed sm:text-lg"
                >
                  {line}
                </motion.p>
              ))}
          </div>

          {!expandedLetter && visibleLetterLines < letterLines.length && (
            <button
              onClick={() => {
                setExpandedLetter(true);
                setVisibleLetterLines(letterLines.length);
              }}
              className="mt-8 rounded-full border border-violet-100/40 px-6 py-3 text-sm text-violet-50 transition hover:bg-violet-50/10"
            >
              Ler tudo
            </button>
          )}
        </div>
      </section>

      <section id="finale" className="scroll-section px-4 py-16 pb-24 sm:px-6 sm:py-32 sm:pb-44">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            className="pulse-heart mx-auto w-fit text-fuchsia-300"
            animate={{ scale: [0.95, 1.06, 0.95] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.8 }}
            aria-hidden
          >
            <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
              <path d="M12 20.5l-1.2-1.1C5.8 14.8 2.5 11.7 2.5 7.9 2.5 4.8 4.9 2.5 8 2.5c1.8 0 3.5.8 4.6 2.1C13.7 3.3 15.4 2.5 17.2 2.5c3.1 0 5.5 2.3 5.5 5.4 0 3.8-3.3 6.9-8.3 11.5L12 20.5z" fill="currentColor"/>
            </svg>
          </motion.div>

          <h2 className="section-title mt-8 text-3xl text-white sm:text-6xl">
            Obrigado por fazer parte da minha historia.
          </h2>
        </div>
      </section>
    </main>
  );
}
