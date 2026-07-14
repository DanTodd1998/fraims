// L&K house style, lifted from the Gloucester Terrace report.
module.exports = {
  colors: {
    navy: "#1f3a5f",
    steel: "#2f5c8f",
    light: "#eef3f8",
    text: "#222222",
    muted: "#666666",
    line: "#cccccc",
    white: "#ffffff",
    // risk matrix ratings
    trivial: "#4a9e5c",
    tolerable: "#8cc63f",
    moderate: "#f4c430",
    substantial: "#f39c2d",
    intolerable: "#e04b3a",
    cellIdle: "#f4f6f9"
  },
  ratingColor: {
    "Trivial": "#4a9e5c",
    "Tolerable": "#8cc63f",
    "Moderate": "#f4c430",
    "Substantial": "#f39c2d",
    "Intolerable": "#e04b3a"
  },
  pageMargins: [50, 90, 50, 60], // L,T,R,B  (top leaves room for banner)
  banner: "assets/banner.png"
};
