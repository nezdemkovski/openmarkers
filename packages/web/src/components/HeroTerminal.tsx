import { useState, useEffect, useRef, useCallback } from "react";

interface Line {
  type: "user" | "assistant" | "tool" | "text" | "gap" | "pause" | "clear";
  content?: string;
  className?: string;
  delay: number;
}

const T = "text-zinc-300";
const D = "text-zinc-500";

const SCRIPT: Line[] = [
  // --- Conversation 1: Trend analysis ---
  { type: "pause", delay: 600 },
  { type: "user", content: "analyze my latest blood work", delay: 30 },
  { type: "pause", delay: 300 },
  { type: "tool", content: "get_profile(id: 1)", delay: 400 },
  { type: "tool", content: "get_trends(profile_id: 1)", delay: 500 },
  { type: "pause", delay: 200 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Your Jan 27 labs look solid overall. Cholesterol is still high at 5.61 mmol/l but down 16.6% from August — that's real progress. HDL and glucose are both in range.", delay: 14 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "One thing to watch: Vitamin D dropped to 68.5 nmol/l, below the 75–125 range. Might be worth supplementing through winter.", delay: 14 },
  { type: "pause", delay: 1000 },

  // --- Conversation 2: Biological age ---
  { type: "user", content: "what's my biological age?", delay: 30 },
  { type: "pause", delay: 300 },
  { type: "tool", content: "get_biological_age(profile_id: 1)", delay: 600 },
  { type: "pause", delay: 200 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Based on 9 biomarkers, your PhenoAge is 34.2 — about 3.8 years younger than your chronological age of 38. That's a great result.", delay: 14 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Your albumin and CRP are pulling the number down (good), while WBC is pushing it slightly up.", delay: 14 },
  { type: "pause", delay: 1000 },

  // --- Conversation 3: Compare dates ---
  { type: "user", content: "compare jan vs aug results", delay: 30 },
  { type: "pause", delay: 300 },
  { type: "tool", content: "compare_dates(date1: 2026-01-27, date2: 2025-08-20)", delay: 600 },
  { type: "pause", delay: 200 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Big improvements since August. Cholesterol dropped 16.6%, LDL down 20.7%, and ApoB fell 15.2% — your lipid strategy is clearly working.", delay: 14 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "The only concern is Vitamin D falling from 153 to 68.5, a 55% drop. Seasonal, but worth addressing.", delay: 14 },
  { type: "pause", delay: 1000 },

  // --- Conversation 4: Correlations ---
  { type: "user", content: "any correlated panels to watch?", delay: 30 },
  { type: "pause", delay: 300 },
  { type: "tool", content: "get_correlations(profile_id: 1)", delay: 500 },
  { type: "pause", delay: 200 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Your lipid panel (cholesterol, HDL, LDL, triglycerides, ApoB) is the most interconnected — changes in one usually affect the others.", delay: 14 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Liver enzymes and thyroid markers also move together. Given your lipid trends, I'd prioritize retesting that panel in 3 months.", delay: 14 },
  { type: "pause", delay: 1000 },

  // --- Conversation 5: Days since last test ---
  { type: "user", content: "when was my last test for each category?", delay: 30 },
  { type: "pause", delay: 300 },
  { type: "tool", content: "get_days_since_last_test(profile_id: 1)", delay: 500 },
  { type: "pause", delay: 200 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Most panels are recent — biochemistry, hematology, and endocrinology were all done 59 days ago on Jan 27.", delay: 14 },
  { type: "gap", delay: 0 },
  { type: "assistant", content: "Your iron panel is overdue though, last tested 219 days ago in August. I'd recommend scheduling that soon.", delay: 14 },
  { type: "pause", delay: 2500 },

  // --- Clear and loop ---
  { type: "clear", content: "/clear", delay: 45 },
];

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function ToolLine({ text, onDone }: { text: string; onDone: () => void }) {
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const interval = setInterval(
      () => setFrame((f) => (f + 1) % SPINNER_FRAMES.length),
      80,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const duration = 500 + Math.random() * 400;
    const id = setTimeout(() => {
      setDone(true);
      onDoneRef.current();
    }, duration);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] leading-none shrink-0 w-2.5 text-center ${done ? "text-zinc-600" : "text-zinc-500"}`}>
        {done ? "●" : SPINNER_FRAMES[frame]}
      </span>
      <span className={done ? "text-zinc-600" : "text-zinc-400"}>
        {text}
      </span>
    </div>
  );
}

function TypedText({
  text,
  className,
  charDelay,
  onDone,
}: {
  text: string;
  className?: string;
  charDelay: number;
  onDone: () => void;
}) {
  const [chars, setChars] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (chars >= text.length) {
      onDoneRef.current();
      return;
    }
    const id = setTimeout(() => setChars((c) => c + 1), charDelay);
    return () => clearTimeout(id);
  }, [chars, text.length, charDelay]);

  return (
    <span className={className}>
      {text.slice(0, chars)}
      {chars < text.length && (
        <span className="text-zinc-600 animate-pulse">▎</span>
      )}
    </span>
  );
}

export default function HeroTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [lineStates, setLineStates] = useState<
    Record<number, "active" | "done">
  >({});
  const containerRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const advanceLineRef = useRef<(idx: number) => void>();

  const start = useCallback(() => {
    setVisibleLines(1);
    setLineStates({ 0: "done" });
    setTimeout(() => advanceLineRef.current?.(0), 50);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleLines, lineStates]);

  const advanceLine = useCallback(
    (idx: number): void => {
      setLineStates((prev) => ({ ...prev, [idx]: "done" }));
      const next = idx + 1;
      if (next >= SCRIPT.length) {
        setTimeout(() => {
          setVisibleLines(0);
          setLineStates({});
          started.current = false;
          setTimeout(() => {
            started.current = true;
            start();
          }, 300);
        }, 500);
        return;
      }

      const nextLine = SCRIPT[next];
      if (nextLine.type === "pause") {
        setTimeout(() => {
          setVisibleLines(next + 1);
          setLineStates((prev) => ({ ...prev, [next]: "done" }));
          advanceLine(next);
        }, nextLine.delay);
      } else if (nextLine.type === "gap") {
        setTimeout(() => {
          setVisibleLines(next + 1);
          setLineStates((prev) => ({ ...prev, [next]: "done" }));
          advanceLine(next);
        }, 80);
      } else {
        setTimeout(() => {
          setVisibleLines(next + 1);
          setLineStates((prev) => ({ ...prev, [next]: "active" }));
        }, 60);
      }
    },
    [start],
  );
  advanceLineRef.current = advanceLine;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] max-w-2xl w-full">
      <div className="h-[420px] flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden px-5 py-4 font-mono text-[13px] leading-[1.7] space-y-0.5"
        >
          <div className="pb-3 mb-2 border-b border-white/[0.04]">
            <div className="text-zinc-500 text-[11px]">Claude Code v2.1.84</div>
            <div className="text-zinc-600 text-[11px]">
              Opus 4.6 (1M context) · ~/Sites/openmarkers
            </div>
          </div>
          {SCRIPT.slice(0, visibleLines).map((line, i) => {
            if (line.type === "pause") return null;
            if (line.type === "gap") return <div key={i} className="h-1" />;

            if (line.type === "user" || line.type === "clear") {
              return (
                <div key={i} className="py-0.5">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-800 rounded px-2 py-0.5">
                    <span className="text-zinc-500 text-[11px] leading-none">❯</span>
                    {lineStates[i] === "active" ? (
                      <TypedText
                        text={line.content!}
                        className="text-zinc-200"
                        charDelay={line.delay}
                        onDone={() => advanceLine(i)}
                      />
                    ) : (
                      <span className="text-zinc-200">{line.content}</span>
                    )}
                  </span>
                </div>
              );
            }

            if (line.type === "tool") {
              return lineStates[i] === "active" || lineStates[i] === "done" ? (
                <ToolLine
                  key={i}
                  text={line.content!}
                  onDone={() => {
                    if (lineStates[i] === "active") advanceLine(i);
                  }}
                />
              ) : null;
            }

            if (line.type === "assistant") {
              return (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className="text-zinc-500 text-[10px] leading-none shrink-0 w-2.5 text-center">●</span>
                  {lineStates[i] === "active" ? (
                    <TypedText
                      text={line.content!}
                      className="text-zinc-300"
                      charDelay={line.delay}
                      onDone={() => advanceLine(i)}
                    />
                  ) : (
                    <span className="text-zinc-300">{line.content}</span>
                  )}
                </div>
              );
            }

            if (line.type === "text") {
              return (
                <div key={i} className="pl-[18px]">
                  {lineStates[i] === "active" ? (
                    <TypedText
                      text={line.content!}
                      className={line.className}
                      charDelay={line.delay}
                      onDone={() => advanceLine(i)}
                    />
                  ) : (
                    <span className={line.className}>{line.content}</span>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
        <div className="px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.015] flex items-center text-[10px] font-mono text-zinc-600">
          <span>Opus 4.6 (1M context)</span>
        </div>
      </div>
    </div>
  );
}
