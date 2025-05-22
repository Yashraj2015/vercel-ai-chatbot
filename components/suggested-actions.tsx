'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
    },
    {
      title: 'Write code to',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code to demonstrate djikstra's algorithm`,
    },
    {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
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
            <span className="font-medium truncate">{suggestedAction.title}</span>
  
          </Button>
        </motion.div>
      ))}

    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
