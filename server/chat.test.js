import { jest } from '@jest/globals';
import fs from 'fs';

// Mock all modules at the top level
jest.unstable_mockModule('langchain/document_loaders/fs/pdf', () => ({
    PDFLoader: class {
        constructor(filePath) {
            this.filePath = filePath;
        }
        async load() {
            if (this.filePath === './invalid.pdf') {
                throw new Error('Invalid PDF format');
            }
            if (this.filePath === './empty.pdf') {
                return [];
            }
            return [{ pageContent: 'Mocked PDF content' }];
        }
    }
}));

jest.unstable_mockModule('langchain/text_splitter', () => ({
    RecursiveCharacterTextSplitter: class {
        async splitDocuments(docs) {
            if (docs.length === 0) {
                throw new Error('No documents to split');
            }
            return [{ pageContent: 'Split chunk' }];
        }
    }
}));

jest.unstable_mockModule('langchain/embeddings/openai', () => ({
    OpenAIEmbeddings: class {
        constructor() {
            this.openAIApiKey = 'mock-key';
        }
    }
}));

jest.unstable_mockModule('langchain/vectorstores/memory', () => ({
    MemoryVectorStore: {
        fromDocuments: async () => ({
            asRetriever: () => ({
                similaritySearch: async () => [{ pageContent: 'Relevant document' }]
            }),
        }),
    }
}));

jest.unstable_mockModule('langchain/chat_models/openai', () => ({
    ChatOpenAI: class {
        constructor(config) {
            this.modelName = config.modelName;
            this.openAIApiKey = config.openAIApiKey;
        }
    }
}));

jest.unstable_mockModule('langchain/prompts', () => ({
    PromptTemplate: {
        fromTemplate: (template) => ({
            template: template,
            format: () => 'Formatted prompt'
        }),
    }
}));

jest.unstable_mockModule('langchain/chains', () => ({
    RetrievalQAChain: {
        fromLLM: (llm, retriever, options) => ({
            call: async ({ query }) => {
                if (query === 'error query') {
                    throw new Error('Mocked chain error');
                }
                return { 
                    text: 'Mocked Answer',
                    sourceDocuments: ['doc1', 'doc2']
                };
            },
        }),
    }
}));

// Mock fs module
jest.unstable_mockModule('fs', () => ({
    existsSync: jest.fn().mockImplementation((path) => {
        if (path === './nonexistent.pdf') return false;
        if (path === './invalid.pdf') return true;
        return true;
    })
}));

const { default: chat } = await import('./chat.js');

describe('chat()', () => {
    // Test basic functionality
    test('returns mocked answer for valid query', async () => {
        const result = await chat('./fake.pdf', 'What is this?');
        expect(result.text).toBe('Mocked Answer');
    });

    // Test input validation
    test('returns error on empty query', async () => {
        const result = await chat('./fake.pdf', '');
        expect(result.text).toBe('Please enter a valid question.');
    });

    test('returns error on whitespace-only query', async () => {
        const result = await chat('./fake.pdf', '   ');
        expect(result.text).toBe('Please enter a valid question.');
    });

    // Test error handling
    test('handles non-existent file path', async () => {
        await expect(chat('./nonexistent.pdf', 'What is this?'))
            .rejects.toThrow('File not found');
    });

    test('handles invalid PDF format', async () => {
        await expect(chat('./invalid.pdf', 'What is this?'))
            .rejects.toThrow('Invalid PDF format');
    });

    test('handles empty PDF file', async () => {
        await expect(chat('./empty.pdf', 'What is this?'))
            .rejects.toThrow('No documents to split');
    });

    test('handles chain execution error', async () => {
        await expect(chat('./fake.pdf', 'error query'))
            .rejects.toThrow('Mocked chain error');
    });

    // Test large input handling
    test('handles large input query', async () => {
        const largeQuery = 'a'.repeat(10000); // 10,000 characters
        const result = await chat('./fake.pdf', largeQuery);
        expect(result.text).toBe('Mocked Answer');
    });

    // Test special characters in query
    test('handles special characters in query', async () => {
        const specialQuery = 'What is this? \n\t\\\'"`~!@#$%^&*()_+-=[]{}|;:,./<>?';
        const result = await chat('./fake.pdf', specialQuery);
        expect(result.text).toBe('Mocked Answer');
    });

    // Test model configuration
    jest.unstable_mockModule('langchain/chat_models/openai', () => ({
        ChatOpenAI: jest.fn().mockImplementation((config) => ({
            modelName: config.modelName,
            openAIApiKey: config.openAIApiKey
        }))
    }));

    // Test prompt template
    jest.unstable_mockModule('langchain/prompts', () => ({
        PromptTemplate: {
            fromTemplate: jest.fn().mockImplementation((template) => ({
                template: template,
                format: () => 'Formatted prompt'
            })),
        }
    }));
});