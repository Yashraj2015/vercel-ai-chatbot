import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { isTestEnvironment } from '../constants';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { createOpenRouter, openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { togetherai } from '@ai-sdk/togetherai';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const openrouter1 = createOpenRouter({
  apiKey: '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',
});


export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
      
    })
  : customProvider({
      languageModels: {

        'chat-model4': groq('llama-3.3-70b-versatile'),

        // 'chat-model': xai('grok-2-1212'),

        // 'chat-model3': google('gemini-2.5-pro-exp-03-25'),

        'chat-model1': togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),

        



        'chat-model': groq('meta-llama/llama-4-maverick-17b-128e-instruct'),


        
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        'chat-model-reasoning1': wrapLanguageModel({
          model: togetherai('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        'chat-model-reasoning2': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),



        'title-model': groq('llama3-8b-8192'),



        'artifact-model': groq('meta-llama/llama-4-maverick-17b-128e-instruct'),

        'artifact-model2': xai('grok-2-1212'),
      },
      imageModels: {
        
      },
    });