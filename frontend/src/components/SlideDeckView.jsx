import { useState } from "react";

function parseSlides(text) {
  const slides = [];
  const blocks = text.split(/SLIDE:\s*\d+/i).filter(b => b.trim());
  for (const block of blocks) {
    const titleMatch = block.match(/TITLE:\s*(.+)/i);
    const bullets = [...block.matchAll(/[•\-\*]\s*(.+)/g)].map(m => m[1].trim());
    if (titleMatch) slides.push({ title: titleMatch[1].trim(), bullets });
  }
  return slides;
}

const SLIDE_COLORS = [
  "linear-gradient(135deg, #071428, #06080e)",
  "linear-gradient(135deg, #081630, #06080e)",
  "linear-gradient(135deg, #060e24, #06080e)",
  "linear-gradient(135deg, #071220, #080b18)",
  "linear-gradient(135deg, #081530, #06080e)",
];

export default function SlideDeckView({ content }) {
  const slides = parseSlides(content);
  const [current, setCurrent] = useState(0);

  if (slides.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  const slide = slides[current];
  const bg = SLIDE_COLORS[current % SLIDE_COLORS.length];

  return (
    <div className="slideDeckWrap">
      <div className="slide" style={{ background: bg }}>
        <div className="slideNum">Slide {current + 1} of {slides.length}</div>
        <div className="slideTitle">{slide.title}</div>
        {slide.bullets.length > 0 && (
          <ul className="slideBullets">
            {slide.bullets.map((b, i) => (
              <li key={i} className="slideBullet">{b}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="slideThumbs">
        {slides.map((s, i) => (
          <button
            key={i}
            className={`slideThumb ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            type="button"
          >
            <div className="slideThumbNum">{i + 1}</div>
            <div className="slideThumbTitle">{s.title}</div>
          </button>
        ))}
      </div>

      <div className="fcNavRow">
        <button className="fcNavBtn" onClick={() => setCurrent(c => c - 1)} disabled={current === 0} type="button">← Prev</button>
        <button className="fcNavBtn" onClick={() => setCurrent(c => c + 1)} disabled={current === slides.length - 1} type="button">Next →</button>
      </div>
    </div>
  );
}
