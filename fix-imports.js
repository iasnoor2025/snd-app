import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix Core module imports
  content = content.replace(
    /from ["']@\/Core\/components\/ui\/(.*?)["']/g,
    (match, componentPath) => `from "@/components/ui/${componentPath}"`
  );
  
  // Fix other Core module imports
  content = content.replace(
    /from ["']@\/Core\/(.*?)["']/g,
    (match, path) => `from "@/${path}"`
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

// Find all TypeScript/React files
const files = await glob('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'vendor/**']
});

// Fix imports in each file
files.forEach(file => {
  console.log(`Processing ${file}...`);
  fixImportsInFile(file);
}); 