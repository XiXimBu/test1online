const fs = require("fs");
const path = require("path");

const SHARE_IMAGE =
  "https://res.cloudinary.com/dai4kn53o/image/upload/f_jpg,q_auto:good,c_fill,w_1200,h_630,g_auto/v1786528268/background2_hyeraf.jpg";

function parseInviteType(rawUrl) {
  const text = String(rawUrl || "");
  const qIndex = text.indexOf("?");
  const search = qIndex >= 0 ? text.slice(qIndex) : "";
  const normalized = search
    .replace(/^[?#&]+/, "")
    .replace(/\/+(?=(?:type|name|l2|wrap|open)=)/gi, "&")
    .replace(/\?/g, "&");
  return (new URLSearchParams(normalized).get("type") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9].*$/, "");
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

function shareMeta({ title, url, image }) {
  const t = escapeAttr(title);
  const u = escapeAttr(url);
  const i = escapeAttr(image);
  return `<!-- SHARE_META_START -->
<title>${t}</title>
<meta name="title" content="${t}"/>
<meta itemprop="name" content="${t}"/>
<meta itemprop="image" content="${i}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${t}"/>
<meta property="og:title" content="${t}"/>
<meta property="og:url" content="${u}"/>
<meta property="og:locale" content="vi_VN"/>
<meta property="og:image" content="${i}"/>
<meta property="og:image:secure_url" content="${i}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${t}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${t}"/>
<meta name="twitter:image" content="${i}"/>
<link rel="canonical" href="${u}"/>
<!-- SHARE_META_END -->`;
}

module.exports = (req, res) => {
  const htmlPath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  const type = parseInviteType(req.url);
  const bride = isBrideInviteType(type);
  const title = bride
    ? "THIỆP CƯỚI ONLINE HOÀNG HẠNH & TRINH GIANG"
    : "THIỆP CƯỚI ONLINE TRINH GIANG & HOÀNG HẠNH";

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = String(
    req.headers["x-forwarded-host"] || req.headers.host || "thiepcuoigianghanh.vercel.app"
  )
    .split(",")[0]
    .trim();
  const origin = `${proto}://${host}`;
  const url = bride && type ? `${origin}/?type=${encodeURIComponent(type)}` : `${origin}/`;

  html = html.replace(
    /<!-- SHARE_META_START -->[\s\S]*?<!-- SHARE_META_END -->/,
    shareMeta({ title, url, image: SHARE_IMAGE })
  );

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.status(200).send(html);
};
