import { readFile } from 'fs/promises';
import path from 'path';

import type { DocumentTextExtractor } from './types';

const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.txt', '.md', '.docx', '.rtf']);

export function isDocumentFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return DOCUMENT_EXTENSIONS.has(ext);
}

export async function extractText(filePath: string, extension: string): Promise<string | null> {
  const ext = extension.toLowerCase();

  try {
    if (ext === '.txt' || ext === '.md') {
      const content = await readFile(filePath, 'utf-8');
      return content;
    }

    if (ext === '.pdf') {
      return extractPdfText(filePath);
    }

    if (ext === '.docx') {
      return extractDocxText(filePath);
    }

    return null;
  } catch {
    return null;
  }
}

async function extractPdfText(filePath: string): Promise<string | null> {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = await readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || null;
  } catch {
    return null;
  }
}

async function extractDocxText(filePath: string): Promise<string | null> {
  try {
    const mammoth = require('mammoth');
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || null;
  } catch {
    return null;
  }
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && t.length < 100);
}

function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const total = tokens.length;
  for (const [token, count] of tf) {
    tf.set(token, count / total);
  }
  return tf;
}

function computeIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = documents.length;

  for (const doc of documents) {
    const seen = new Set(doc);
    for (const token of seen) {
      idf.set(token, (idf.get(token) ?? 0) + 1);
    }
  }

  for (const [token, count] of idf) {
    idf.set(token, Math.log((N + 1) / (count + 1)) + 1);
  }

  return idf;
}

function computeTFIDV(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = computeTF(tokens);
  const tfidf = new Map<string, number>();
  for (const [token, tfValue] of tf) {
    tfidf.set(token, tfValue * (idf.get(token) ?? 1));
  }
  return tfidf;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [token, value] of vecA) {
    normA += value * value;
    const bValue = vecB.get(token) ?? 0;
    dotProduct += value * bValue;
  }

  for (const value of vecB.values()) {
    normB += value * value;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  return dotProduct / denom;
}

export function computeDocumentSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length < 5 || tokensB.length < 5) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = new Set([...setA].filter((t) => setB.has(t)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  const documents = [tokensA, tokensB];
  const idf = computeIDF(documents);

  const vecA = computeTFIDV(tokensA, idf);
  const vecB = computeTFIDV(tokensB, idf);

  return cosineSimilarity(vecA, vecB);
}
