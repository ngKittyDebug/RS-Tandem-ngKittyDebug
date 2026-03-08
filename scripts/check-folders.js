const fs = require("fs");

const ALLOWED_DIRS = ["development-notes", ".github", "scripts"];

function checkFolders() {
  const rootDir = process.cwd();
  let hasError = false;

  console.log("🔍 Проверка структуры папок...\n");

  const items = fs.readdirSync(rootDir, { withFileTypes: true });
  const directories = items
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .filter((name) => name !== ".git");

  console.log(`📂 Найдено папок: ${directories.length}`);
  console.log(`📋 Список: ${directories.join(", ")}\n`);

  for (const dir of directories) {
    if (!ALLOWED_DIRS.includes(dir)) {
      console.error(
        `❌ ОШИБКА: Папка '${dir}' не входит в список разрешенных!`,
      );
      hasError = true;
    }
  }

  console.log("");
  if (hasError) {
    console.error("💥 Проверка не пройдена!");
    process.exit(1);
    й;
  } else {
    console.log("✅ Все папки валидны!");
    process.exit(0);
  }
}

checkFolders();
