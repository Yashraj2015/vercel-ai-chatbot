'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';
import { CloudSun, Code, BookOpen } from 'lucide-react';


interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      icon: CloudSun,
      title: 'Weather',
      label: 'in San Francisco?',
      action: 'What is the weather in Banglore?',
    },
    {
      icon: BookOpen,
      title: 'Essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley of India`,
    },
    {
      icon: Code,
      title: 'Code',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code for Tic Tac Toe game`,
    },
    
    
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid  md:grid-cols-4 md:px-0 px-10 grid-cols-2 gap-2 mt-8 w-full bg-transparent "
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index === 2 ? 'hidden md:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-2xl md:mx-20 px-3 py-3.5 text-sm flex-1 bg-zinc-600/20 gap-1 sm:flex-col  w-full h-auto justify-start items-start hover:bg-zinc-700/20"
          >
            <div className='flex flex-row gap-2'>
              <suggestedAction.icon className="w-12 h-12 text-zinc-400 mt-[0.10rem]" />
              <span className="font-medium truncate">{suggestedAction.title}</span>
            </div>
  
          </Button>
        </motion.div>
      ))}

    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
