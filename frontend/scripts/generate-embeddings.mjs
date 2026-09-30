import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key from .env
const rootEnv = path.join(__dirname, '..', '..', '.env');
let geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey && fs.existsSync(rootEnv)) {
  const lines = fs.readFileSync(rootEnv, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('GEMINI_API_KEY=')) {
      geminiKey = trimmed.replace('GEMINI_API_KEY=', '').trim();
    }
  }
}

if (!geminiKey) {
  console.error('No GEMINI_API_KEY found');
  process.exit(1);
}

const docPath = path.join(__dirname, '..', 'public', 'chatbot_documentation.txt');
const rawDoc = fs.readFileSync(docPath, 'utf8');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 60,
});
const docChunks = await splitter.createDocuments([rawDoc]);
console.log(`Generated ${docChunks.length} chunks from documentation.`);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: geminiKey,
  model: 'gemini-embedding-001',
});

const texts = docChunks.map(c => c.pageContent);
console.log('Embedding all chunks with gemini-embedding-001...');
const vectors = await embeddings.embedDocuments(texts);

const output = docChunks.map((chunk, i) => ({
  content: chunk.pageContent,
  vector: vectors[i],
  metadata: chunk.metadata || {}
}));

const outPath = path.join(__dirname, '..', 'public', 'chatbot_embeddings.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Successfully saved ${output.length} embedded chunks to ${outPath}`);
