import { notion2typst, getExtensionFromContentType } from '@nast/notion2typst';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PAGE_ID = process.env.PAGE_ID || '';

if (!NOTION_TOKEN) {
  console.error('Error: NOTION_TOKEN environment variable is required (put it in the .env.local file)');
  process.exit(1);
}

// Create output directory
const outputDir = join(__dirname, '../output');
mkdirSync(outputDir, { recursive: true });
const typstPath = join(outputDir, `page-${PAGE_ID}.typ`);

console.log('=== Notion to Typst Conversion ===\n');
console.log(`Page ID: ${PAGE_ID}`);

// Call the main wrapper function
const result = await notion2typst({notionToken: NOTION_TOKEN!, pageId: PAGE_ID!, fetchImages: true});

// Save Typst code
writeFileSync(typstPath, result.typstCode, 'utf-8');
console.log(`\nTypst code saved to: ${typstPath}`);
console.log(`   Lines: ${result.typstCode.split('\n').length}`);

// Save images
for (let i = 0; i < result.images.length; i++) {
  const image = result.images[i];
  
  // Determine file extension from content type
  const extension = getExtensionFromContentType(image.contentType);
  const filename = `image-${i + 1}${extension}`;
  const imagePath = join(outputDir, filename);
  
  // Write the image data to file
  writeFileSync(imagePath, Buffer.from(image.data));
  console.log(`   ✓ ${filename} (${image.contentType})`);
}

console.log('\nConversion completed successfully!');