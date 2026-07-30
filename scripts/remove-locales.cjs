const { readdirSync, existsSync, rmSync } = require('fs');
const { join } = require('path');

exports.default = async function (context) {
  const appOutDir = context.appOutDir;
  const productFilename = context.packager.appInfo.productFilename;

  const localesDir = join(
    appOutDir,
    `${productFilename}.app`,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Versions',
    'A',
    'Resources'
  );

  if (!existsSync(localesDir)) {
    return;
  }

  const keep = new Set(['en.lproj', 'en_GB.lproj']);

  for (const entry of readdirSync(localesDir)) {
    if (entry.endsWith('.lproj') && !keep.has(entry)) {
      const full = join(localesDir, entry);
      try {
        rmSync(full, { recursive: true, force: true });
      } catch {
        // skip if we can't remove
      }
    }
  }
};
