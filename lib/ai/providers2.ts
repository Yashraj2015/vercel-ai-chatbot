import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { isTestEnvironment } from '../constants';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

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

        'chat-model': groq('llama-3.3-70b-versatile'),

        'chat-model2': xai('grok-2-vision-1212'),

        'chat-model3': groq('meta-llama/llama-4-scout-17b-16e-instruct'),

        'chat-model4': google('gemini-2.5-pro-exp-03-25',{ useSearchGrounding: true }),


        
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        'chat-model-reasoning2': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),



        'title-model': groq('llama3-8b-8192'),



        'artifact-model': groq('llama-3.3-70b-versatile'),

        'artifact-model2': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });