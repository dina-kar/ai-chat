import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { google } from '@ai-sdk/google';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'gemini-2.5-pro': chatModel,
        'gemini-2.5-flash': reasoningModel,
        'gemini-2.5-flash-lite-preview-06-17': chatModel,
        'gemini-2.0-flash': chatModel,
        'gemini-2.0-flash-lite': chatModel,
        'gemini-1.5-pro': chatModel,
        'gemini-1.5-flash': chatModel,
        'gemini-1.5-flash-8b': chatModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Gemini 2.5 Series with thinking capabilities
        'gemini-2.5-pro': wrapLanguageModel({
          model: google('gemini-2.5-pro'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-flash': wrapLanguageModel({
          model: google('gemini-2.5-flash'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-flash-lite-preview-06-17': wrapLanguageModel({
          model: google('gemini-2.5-flash-lite-preview-06-17'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        
        // Gemini 2.0 Series
        'gemini-2.0-flash': google('gemini-2.0-flash'),
        'gemini-2.0-flash-lite': google('gemini-2.0-flash-lite'),
        
        // Gemini 1.5 Series
        'gemini-1.5-pro': google('gemini-1.5-pro'),
        'gemini-1.5-flash': google('gemini-1.5-flash'),
        'gemini-1.5-flash-8b': google('gemini-1.5-flash-8b'),
        
        // Utility models
        'title-model': google('gemini-1.5-flash'),
        'artifact-model': google('gemini-1.5-flash'),
      },
    });
