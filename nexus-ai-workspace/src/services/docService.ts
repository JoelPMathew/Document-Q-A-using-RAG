import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

interface DocChunk {
  content: string;
  source: string;
  score?: number;
}

export async function getDocumentChunks(docsDir: string): Promise<DocChunk[]> {
  const files = await glob('**/*.{txt,md,pdf}', { cwd: docsDir });
  const chunks: DocChunk[] = [];

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const ext = path.extname(file).toLowerCase();
    let text = '';

    try {
      if (ext === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        text = data.text;
      } else {
        text = await fs.readFile(filePath, 'utf-8');
      }

      // Simple chunking by paragraphs or double newlines
      const fileChunks = text.split(/\n\s*\n/).filter(c => c.trim().length > 20);
      for (const content of fileChunks) {
        chunks.push({
          content: content.trim(),
          source: file
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return chunks;
}

export function findRelevantChunks(query: string, chunks: DocChunk[], limit = 5): DocChunk[] {
  const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        score += 1;
      }
    }
    
    return { ...chunk, score };
  });

  return scoredChunks
    .filter(c => (c.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}
