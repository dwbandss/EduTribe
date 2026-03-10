import { askGemini } from './gemini';

// Document interface for RAG
export interface Document {
  id: string;
  text: string;
  metadata: {
    type: 'school' | 'scheme';
    title: string;
    state: string;
    category?: string;
    class?: string;
  };
  embedding?: number[];
}

// Simple cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate embedding using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const prompt = `Generate a numerical embedding vector for the following text. 
    Return only a JSON array of numbers (e.g., [0.1, -0.2, 0.3, ...]) representing the semantic meaning.
    Text: "${text}"`;
    
    const response = await askGemini(prompt, { maxTokens: 1000 });
    
    // Extract JSON array from response
    const jsonMatch = response.match(/\[.*?\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract embedding array from response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback: generate simple hash-based embedding
    return generateSimpleEmbedding(text);
  }
}

// Fallback simple embedding based on text hash
function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(384).fill(0); // Standard embedding size
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, index) => {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const embeddingIndex = (index * word.length + i) % embedding.length;
      embedding[embeddingIndex] += charCode / 1000;
    }
  });
  
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => norm > 0 ? val / norm : 0);
}

// In-memory document store (in production, use proper vector database)
class VectorStore {
  private documents: Document[] = [];
  
  async addDocument(doc: Document): Promise<void> {
    if (!doc.embedding) {
      doc.embedding = await generateEmbedding(doc.text);
    }
    this.documents.push(doc);
  }
  
  async addDocuments(docs: Document[]): Promise<void> {
    for (const doc of docs) {
      await this.addDocument(doc);
    }
  }
  
  async search(query: string, topK: number = 5): Promise<Document[]> {
    const queryEmbedding = await generateEmbedding(query);
    
    const scoredDocs = this.documents
      .map(doc => ({
        ...doc,
        score: doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0
      }))
      .filter(doc => doc.score > 0.1) // Filter out low similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    
    return scoredDocs;
  }
  
  getDocumentCount(): number {
    return this.documents.length;
  }
}

// Global vector store instance
export const vectorStore = new VectorStore();

// Initialize with sample data
export async function initializeVectorStore(): Promise<void> {
  try {
    // Import models
    const { School } = await import('../../models/refactored/SchoolInfo');
    const { Scheme } = await import('../../models/refactored/Scheme');
    
    // Get sample schools and schemes
    const schools = await School.find({}).limit(10);
    const schemes = await Scheme.find({}).limit(10);
    
    // Convert to document format
    const documents: Document[] = [
      ...schools.map((school: any) => ({
        id: `school-${school._id}`,
        text: `${school.name} in ${school.district}, ${school.state}. ${school.admissionProcess} ${school.eligibilityCriteria} Required documents: ${school.requiredDocuments.join(', ')}`,
        metadata: {
          type: 'school' as const,
          title: school.name,
          state: school.state,
          category: school.type
        }
      })),
      ...schemes.map((scheme: any) => ({
        id: `scheme-${scheme._id}`,
        text: `${scheme.name} - ${scheme.description}. Eligibility: ${scheme.eligibility}. Benefits: ${scheme.benefits}. Application process: ${scheme.applicationProcess}. Required documents: ${scheme.requiredDocuments.join(', ')}`,
        metadata: {
          type: 'scheme' as const,
          title: scheme.name,
          state: scheme.state,
          category: scheme.category,
          class: scheme.class
        }
      }))
    ];
    
    await vectorStore.addDocuments(documents);
    console.log(`Vector store initialized with ${documents.length} documents`);
    
  } catch (error) {
    console.error('Error initializing vector store:', error);
  }
}
