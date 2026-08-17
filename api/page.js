const fs = require("fs");
const path = require("path");

const SHARE_IMAGE =
  "https://res.cloudinary.com/dai4kn53o/image/upload/f_jpg,q_auto:good,c_fill,w_1200,h_630,g_auto/v1786528268/background2_hyeraf.jpg";

function parseInviteSearch(rawUrl) {
  const text = String(rawUrl || "");
  const qIndex = text.indexOf("?");
  const search = qIndex >= 0 ? text.slice(qIndex) : "";
  const normalized = search
    .replace(/^[?#&]+/, "")
    .replace(/\/+(?=(?:type|name|l2|wrap|open)=)/gi, "&")
    .replace(/\?/g, "&");
  return new URLSearchParams(normalized);
}

function parseInviteType(rawUrl) {
  return (parseInviteSearch(rawUrl).get("type") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9].*$/, "");
}

function decodeInviteParam(value) {
  if (!value) return "";
  let text = String(value).replace(/\+/g, " ").trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    return text;
  }
  return text.trim();
}

function guestInviteName(rawUrl) {
  return decodeInviteParam(parseInviteSearch(rawUrl).get("name"))
    .replace(/~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coupleWeddingTitle(bride) {
  return bride
    ? "HOÀNG HẠNH & TRINH GIANG WEDDING"
    : "TRINH GIANG & HOÀNG HẠNH WEDDING";
}

function invitePageTitle(bride, guestName) {
  const wedding = coupleWeddingTitle(bride);
  return guestName ? `Kính mời ${guestName} | ${wedding}` : wedding;
}

function inviteShareTitle(bride, guestName) {
  return guestName ? `Kính mời ${guestName}` : coupleWeddingTitle(bride);
}

function inviteShareDescription(bride) {
  return coupleWeddingTitle(bride);
}

function isBrideInviteType(type) {
  return String(type || "").indexOf("nhagai") === 0;
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function shareMeta({ title, shareTitle, description, siteName, url, image }) {
  const t = escapeAttr(title);
  const st = escapeAttr(shareTitle);
  const d = escapeAttr(description);
  const s = escapeAttr(siteName);
  const u = escapeAttr(url);
  const i = escapeAttr(image);
  return `<!-- SHARE_META_START -->
<title>${t}</title>
<meta name="title" content="${st}"/>
<meta name="description" content="${d}"/>
<meta itemprop="name" content="${st}"/>
<meta itemprop="description" content="${d}"/>
<meta itemprop="image" content="${i}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${s}"/>
<meta property="og:title" content="${st}"/>
<meta property="og:description" content="${d}"/>
<meta property="og:url" content="${u}"/>
<meta property="og:locale" content="vi_VN"/>
<meta property="og:image" content="${i}"/>
<meta property="og:image:url" content="${i}"/>
<meta property="og:image:secure_url" content="${i}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${d}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${st}"/>
<meta name="twitter:description" content="${d}"/>
<meta name="twitter:image" content="${i}"/>
<link rel="canonical" href="${u}"/>
<!-- SHARE_META_END -->`;
}

module.exports = (req, res) => {
  const htmlPath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  const type = parseInviteType(req.url);
  const bride = isBrideInviteType(type);
  const guestName = guestInviteName(req.url);
  const wedding = coupleWeddingTitle(bride);
  const title = invitePageTitle(bride, guestName);
  const shareTitle = inviteShareTitle(bride, guestName);
  const description = inviteShareDescription(bride);

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = String(
    req.headers["x-forwarded-host"] || req.headers.host || "thiepcuoigianghanh.vercel.app"
  )
    .split(",")[0]
    .trim();
  const origin = `${proto}://${host}`;
  const raw = String(req.url || "/");
  const qIndex = raw.indexOf("?");
  const search = qIndex >= 0 ? raw.slice(qIndex) : "";
  const url = `${origin}/${search}`;

  html = html.replace(
    /<!-- SHARE_META_START -->[\s\S]*?<!-- SHARE_META_END -->/,
    shareMeta({
      title,
      shareTitle,
      description,
      siteName: "Giang & Hạnh",
      url,
      image: SHARE_IMAGE,
    })
  );

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("Accept-Ranges", "none");
  res.status(200).send(html);
};
