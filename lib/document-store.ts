// Simple in-memory document store for RAG
class DocumentStore {
  private documents: Map<string, {
    id: string;
    text: string;
    type: 'school' | 'scheme';
    title: string;
    link?: string;
  }> = new Map();

  addDocument(doc: {
    id: string;
    text: string;
    type: 'school' | 'scheme';
    title: string;
    link?: string;
  }) {
    this.documents.set(doc.id, {
      id: doc.id,
      text: doc.text,
      type: doc.type,
      title: doc.title,
      link: doc.link
    });
  }

  getDocument(id: string) {
    return this.documents.get(id);
  }

  getAllDocuments() {
    return Array.from(this.documents.values());
  }

  searchDocuments(query: string, limit: number = 5) {
    const queryLower = query.toLowerCase();
    const results = Array.from(this.documents.values())
      .filter(doc => 
        doc.text.toLowerCase().includes(queryLower) ||
        doc.title.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
    
    return results;
  }

  clear() {
    this.documents.clear();
  }
}

export const documentStore = new DocumentStore();
