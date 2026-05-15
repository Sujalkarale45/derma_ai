/**
 * Prints GOOGLE_SERVICE_ACCOUNT_JSON as one line for Vercel env paste.
 * Usage: node scripts/print-google-env.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fromEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
const jsonPath = fromEnv
  ? path.resolve(root, fromEnv)
  : path.join(root, 'secrets', 'google-service-account.json');

if (!fs.existsSync(jsonPath)) {
  console.error('File not found:', jsonPath);
  process.exit(1);
}

const oneLine = JSON.stringify(JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
console.log('\nPaste this as GOOGLE_SERVICE_ACCOUNT_JSON in Vercel:\n');
console.log(oneLine);
console.log('\n');
