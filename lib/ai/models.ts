export const DEFAULT_CHAT_MODEL: string = 'gemini-2.5-flash';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  family: 'gemini-2.5' | 'gemini-2.0' | 'gemini-1.5';
  capabilities: {
    multimodal: boolean;
    thinking: boolean;
    codeExecution: boolean;
    functionCalling: boolean;
  };
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Best price-performance model with adaptive thinking',
    family: 'gemini-2.5',
    capabilities: {
      multimodal: true,
      thinking: true,
      codeExecution: true,
      functionCalling: true,
    },
  },
  {
    id: 'gemini-2.5-flash-lite-preview-06-17',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Cost-efficient model with high throughput',
    family: 'gemini-2.5',
    capabilities: {
      multimodal: true,
      thinking: true,
      codeExecution: true,
      functionCalling: true,
    },
  },

  // Gemini 2.0 Series - Next generation features
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen features with superior speed and native tool use',
    family: 'gemini-2.0',
    capabilities: {
      multimodal: true,
      thinking: false,
      codeExecution: true,
      functionCalling: true,
    },
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Optimized for cost efficiency and low latency',
    family: 'gemini-2.0',
    capabilities: {
      multimodal: true,
      thinking: false,
      codeExecution: false,
      functionCalling: true,
    },
  },

  // Gemini 1.5 Series - Proven and reliable
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Complex reasoning tasks requiring more intelligence',
    family: 'gemini-1.5',
    capabilities: {
      multimodal: true,
      thinking: false,
      codeExecution: true,
      functionCalling: true,
    },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and versatile performance across diverse tasks',
    family: 'gemini-1.5',
    capabilities: {
      multimodal: true,
      thinking: false,
      codeExecution: true,
      functionCalling: true,
    },
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    description: 'Small model for high volume and lower intelligence tasks',
    family: 'gemini-1.5',
    capabilities: {
      multimodal: true,
      thinking: false,
      codeExecution: true,
      functionCalling: true,
    },
  },
];
