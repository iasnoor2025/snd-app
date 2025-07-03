import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateImports(filePath) {
    try {
        const content = await readFile(filePath, 'utf8');

        // Replace old import paths with new ones
        let updatedContent = content
            // Fix incorrect Core imports
            .replace(/import\s*{\s*AppLayout\s*}\s*from\s*['"]@\/Core\/layouts['"]/g, 'import AppLayout from \'@/Core/layouts/AppLayout\'')
            .replace(/import\s*{\s*AuthLayout\s*}\s*from\s*['"]@\/Core\/layouts['"]/g, 'import AuthLayout from \'@/Core/layouts/auth-layout\'')
            .replace(/import\s*{\s*AuthenticatedLayout\s*}\s*from\s*['"]@\/Core\/layouts['"]/g, 'import AuthenticatedLayout from \'@/Core/layouts/AuthenticatedLayout\'')
            .replace(/import\s*{\s*GuestLayout\s*}\s*from\s*['"]@\/Core\/layouts['"]/g, 'import GuestLayout from \'@/Core/layouts/GuestLayout\'')
            .replace(/import\s*{\s*AdminLayout\s*}\s*from\s*['"]@\/Core\/layouts['"]/g, 'import AdminLayout from \'@/Core/layouts/AppLayout\'')
            .replace(/import\s*AdminLayout\s*from\s*['"]@\/Core\/layouts\/AppLayout['"]/g, 'import AppLayout from \'@/Core/layouts/AppLayout\'')
            // Replace component imports
            .replace(/@\/Modules\/Core\/resources\/js\/components\//g, '@/Core/components/')
            // Replace layout imports
            .replace(/@\/Modules\/Core\/resources\/js\/layouts\//g, '@/Core/layouts/')
            // Replace type imports
            .replace(/@\/Modules\/Core\/resources\/js\/types/g, '@/Core/types')
            // Replace hook imports
            .replace(/@\/Modules\/Core\/resources\/js\/hooks\//g, '@/Core/hooks/')
            // Replace utils imports
            .replace(/@\/Modules\/Core\/resources\/js\/utils\//g, '@/Core/utils/')
            // Replace root imports
            .replace(/@\/Modules\/Core\/resources\/js\//g, '@/Core/')
            // Replace direct module imports
            .replace(/@\/Modules\/Core\/resources\/js/g, '@/Core')
            // Fix case sensitivity issues
            .replace(/Components\//g, 'components/')
            .replace(/Resources\//g, 'resources/')
            .replace(/Layouts\//g, 'layouts/')
            .replace(/Pages\//g, 'pages/')
            // Fix AdminLayout usage
            .replace(/AdminLayout(\s+)/g, 'AppLayout$1');

        await writeFile(filePath, updatedContent, 'utf8');
        console.log(`Updated imports in ${filePath}`);
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
}

async function walkDir(dir) {
    const files = await readdir(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
            await walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            await updateImports(filePath);
        }
    }
}

// Update files in resources/js and Modules directories
(async () => {
    try {
        await walkDir(join(__dirname, 'resources/js'));
        await walkDir(join(__dirname, 'Modules'));
        console.log('Import paths updated successfully!');
    } catch (error) {
        console.error('Error updating import paths:', error);
    }
})();
