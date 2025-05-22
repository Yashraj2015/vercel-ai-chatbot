'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';

const scrubContent = (content: any): any => {
  if (typeof content === 'string') {
    let cleaned = content;
    
    // First remove qwerty content
    if (cleaned.includes('qwerty')) {
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.qwerty) {
          return '';
        }
      } catch {
        cleaned = cleaned
          .split('\n')
          .filter(line => !line.toLowerCase().includes('qwerty'))
          .join('\n');
      }
    }

    if (cleaned.includes('<has_function_call>')) {
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed.qwerty) {
          return '';
        }
      } catch {
        cleaned = cleaned
        .split('\n')
        .map(line => line.replace(/<has_function_call>/gi, ''))
        .join('\n');
      }
    }
    
    // Then replace type-01 with Search
    cleaned = cleaned.replace(/\btype-01\b/gi, '@Search');
    cleaned = cleaned.replace(/\btype-04\b/gi, '@Document');
    
    return cleaned;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => scrubContent(item)).filter(item => {
      if (typeof item === 'string') return item.trim() !== '';
      return true;
    });
  }
  
  if (typeof content === 'object' && content !== null) {
    const result: any = {};
    for (const key in content) {
      if (key !== 'qwerty') {
        const cleaned = scrubContent(content[key]);
        if (cleaned !== '' && !(typeof cleaned === 'object' && Object.keys(cleaned).length === 0)) {
          result[key] = cleaned;
        }
      }
    }
    return result;
  }
  
  return content;
};


export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages: originalMessages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: () => {
      toast.error('An error occurred, please try again!');
    },
  });

  // Clean messages before they're used anywhere
  const messages = useMemo(() => {
    return originalMessages.map(message => ({
      ...message,
      parts: scrubContent(message.parts)
    }));
  }, [originalMessages]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-[#292a2d] ">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto pt-0 flex-col pb-2 md:pb-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
          <p className='items-center justify-center mx-auto text-xs text-gray-500'>Please verify crucial info.</p>
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}