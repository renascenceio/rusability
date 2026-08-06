import { ImageResponse } from "next/og";

/**
 * Default site-wide Open Graph / Twitter card (1200×630).
 *
 * Next auto-wires `og:image` + `twitter:image` from this file for every route
 * that does not define its own. Rendering it dynamically (rather than shipping a
 * static PNG) guarantees the correct dimensions and Content-Type, which is what
 * validators such as Yandex's microdata checker require — the previous metadata
 * had no `images`, so `og:image` was empty and flagged as an error.
 */
export const runtime = "edge";
export const alt = "Rusability — редакционная платформа нового поколения";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0e10",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top: wordmark + accent rule */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#6a76ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ color: "#f2ede3", fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Rusability
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              color: "#f2ede3",
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "1000px",
            }}
          >
            Редакционная платформа нового поколения
          </div>
          <div style={{ color: "rgba(242, 237, 227, 0.6)", fontSize: "30px", lineHeight: 1.3, maxWidth: "900px" }}>
            Статьи, новости и авторская среда: дизайн, маркетинг, технологии и UX
          </div>
        </div>

        {/* bottom accent bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "120px", height: "8px", borderRadius: "4px", background: "#6a76ff" }} />
          <div style={{ width: "40px", height: "8px", borderRadius: "4px", background: "#e0765c" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
