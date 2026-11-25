const { chromium } = require("playwright"),
  fs = require("fs");
(async () => {
  const b = await chromium.launch(),
    p = await b.newPage({ reducedMotion: "reduce" }),
    rows = [];
  for (let i = 1; i <= 15; i++) {
    await p.goto(
      (process.env.QYX_BASE || "http://127.0.0.1:4173") +
        "/?edition=" +
        String(i).padStart(2, "0"),
    );
    rows.push(
      await p.evaluate(() => {
        const css = getComputedStyle(document.documentElement),
          header = getComputedStyle(document.querySelector(".site-header"));
        const c = document.createElement("canvas");
        c.width = c.height = 1;
        const x = c.getContext("2d", { willReadFrequently: true });
        const color = (s, bg) => {
          x.clearRect(0, 0, 1, 1);
          x.fillStyle = bg || "#000";
          x.fillRect(0, 0, 1, 1);
          x.fillStyle = s;
          x.fillRect(0, 0, 1, 1);
          return [...x.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        const lum = (a) =>
          a
            .map((v) => {
              v /= 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            })
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a, b) => {
          let l = lum(a),
            r = lum(b);
          return (Math.max(l, r) + 0.05) / (Math.min(l, r) + 0.05);
        };
        return {
          edition: document.documentElement.dataset.edition,
          glassTextOnBackdrops: ["#000000", "#ffffff", "#808080"].map((bg) => ({
            background: bg,
            ratio: ratio(
              color(header.color),
              color(header.backgroundColor, bg),
            ),
          })),
          boundaries: ["--canvas", "--surface", "--elevated"].map((role) => ({
            role,
            ratio: ratio(
              color(css.getPropertyValue("--border")),
              color(css.getPropertyValue(role)),
            ),
          })),
        };
      }),
    );
  }
  fs.writeFileSync(
    (process.env.QYX_EVIDENCE || "/tmp/qyx-evidence") +
      "/composed-contrast.json",
    JSON.stringify(
      {
        method:
          "Canvas compositing of computed header colors over black/white/midgray backdrops; semantic border pairs. Not pixel sampling of artwork or a full WCAG audit.",
        rows,
      },
      null,
      2,
    ),
  );
  console.log(
    "Minimum composed header text contrast",
    Math.min(
      ...rows.flatMap((r) => r.glassTextOnBackdrops.map((a) => a.ratio)),
    ),
  );
  console.log(
    "Minimum boundary contrast",
    Math.min(...rows.flatMap((r) => r.boundaries.map((a) => a.ratio))),
  );
  if (
    rows.some(
      (r) =>
        r.glassTextOnBackdrops.some((a) => a.ratio < 4.5) ||
        r.boundaries.some((a) => a.ratio < 3),
    )
  )
    process.exitCode = 1;
  await b.close();
})();
