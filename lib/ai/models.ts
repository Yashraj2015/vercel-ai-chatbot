export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model1',
    name: 'Srushti',
    description: 'Optimized for complex task execution',
  },
  {
    id: 'chat-model',
    name: 'Srushti 2 mini',
    description: 'Multimodal cost-efficient processing',
  },
  {
    id: 'chat-model-reasoning1',
    name: 'Srushti s1 preview',
    description: 'Early-access reasoning prototype of s1',
  },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Srushti s1 mini',
  //   description: 'Enhanced reasoning with optimal cost efficiency',
  // },
  // {
  //   id: 'chat-model-reasoning1',
  //   name: 'Srushti s2',
  //   description: 'Uses advanced reasoning',
  // },
];
