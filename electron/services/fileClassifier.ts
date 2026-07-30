const EXTENSION_MAP: Record<string, string> = {
  png: 'images',
  jpg: 'images',
  jpeg: 'images',
  gif: 'images',
  webp: 'images',
  svg: 'images',
  ico: 'images',
  bmp: 'images',
  pdf: 'documents',
  doc: 'documents',
  docx: 'documents',
  txt: 'documents',
  md: 'documents',
  rtf: 'documents',
  ppt: 'documents',
  pptx: 'documents',
  xls: 'documents',
  xlsx: 'documents',
  csv: 'documents',
  mp4: 'videos',
  mov: 'videos',
  avi: 'videos',
  mkv: 'videos',
  webm: 'videos',
  flv: 'videos',
  wmv: 'videos',
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  wma: 'audio',
  aac: 'audio',
  zip: 'archives',
  rar: 'archives',
  '7z': 'archives',
  tar: 'archives',
  gz: 'archives',
  bz2: 'archives',
  xz: 'archives',
  exe: 'installers',
  msi: 'installers',
  dmg: 'installers',
  pkg: 'installers',
  deb: 'installers',
  rpm: 'installers',
  appimage: 'installers',
};

export type OrgCategory =
  'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'installers' | 'unknown';

export const CATEGORY_LABELS: Record<OrgCategory, string> = {
  images: 'Images',
  documents: 'Documents',
  videos: 'Videos',
  audio: 'Audio',
  archives: 'Archives',
  installers: 'Installers',
  unknown: 'Other Files',
};

const CATEGORY_FOLDER_NAMES: Record<OrgCategory, string> = {
  images: 'Images',
  documents: 'Documents',
  videos: 'Videos',
  audio: 'Audio',
  archives: 'Archives',
  installers: 'Installers',
  unknown: 'Other',
};

export function classifyFile(extension: string): OrgCategory {
  const ext = extension.toLowerCase().replace(/^\./, '');
  const category = EXTENSION_MAP[ext];
  if (category) return category as OrgCategory;
  return 'unknown';
}

export function getCategoryLabel(category: OrgCategory): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryFolderName(category: OrgCategory): string {
  return CATEGORY_FOLDER_NAMES[category];
}
