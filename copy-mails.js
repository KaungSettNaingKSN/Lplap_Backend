const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "mails");
const dest = path.join(__dirname, "dist", "mails");

if (!fs.existsSync(src)) {
  console.error("❌ Source folder 'mails/' not found at project root.");
  process.exit(1);
}

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
  console.log("📁 Created dist/mails/");
}

const files = fs.readdirSync(src).filter((f) => f.endsWith(".ejs"));

if (files.length === 0) {
  console.warn("⚠️  No .ejs files found in mails/");
} else {
  files.forEach((file) => {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
    console.log(`✅ Copied: ${file}`);
  });
  console.log(`\n🎉 Done! ${files.length} template(s) copied to dist/mails/`);
}