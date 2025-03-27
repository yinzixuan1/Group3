import { jest } from '@jest/globals';

jest.unstable_mockModule('langchain/document_loaders/fs/pdf', () => ({
    PDFLoader: class {
        async load() {
            return [{ pageContent: 'Mocked PDF content' }];
        }
    }
}));

jest.unstable_mockModule('langchain/text_splitter', () => ({
    RecursiveCharacterTextSplitter: class {
        async splitDocuments() {
            return [{ pageContent: 'Split chunk' }];
        }
    }
}));

jest.unstable_mockModule('langchain/embeddings/openai', () => ({
    OpenAIEmbeddings: class {}
}));

jest.unstable_mockModule('langchain/vectorstores/memory', () => ({
    MemoryVectorStore: {
        fromDocuments: async () => ({
            asRetriever: () => ({}),
        }),
    }
}));

jest.unstable_mockModule('langchain/chat_models/openai', () => ({
    ChatOpenAI: class {}
}));

jest.unstable_mockModule('langchain/prompts', () => ({
    PromptTemplate: {
        fromTemplate: () => ({}),
    }
}));

jest.unstable_mockModule('langchain/chains', () => ({
    RetrievalQAChain: {
        fromLLM: () => ({
            call: async () => ({ text: 'Mocked Answer' }),
        }),
    }
}));

const { default: chat } = await import('./chat.js');

describe('chat()', () => {
    test('returns mocked answer', async () => {
        const result = await chat('./fake.pdf', 'What is this?');
        expect(result.text).toBe('Mocked Answer');
    });

    test('returns error on empty query', async () => {
        const result = await chat('./fake.pdf', '');
        expect(result.text).toBe('Please enter a valid question.');
    });
});
