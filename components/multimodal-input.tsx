'use client';

import type { Attachment, UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { Mic, Earth, Box, Paintbrush, Languages, AudioWaveform  } from 'lucide-react';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import Cookies from 'js-cookie';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          setInput(transcript);
          adjustHeight();
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast.error('Speech recognition error: ' + event.error);
        };

        recognitionRef.current = recognition;
      } else {
        toast.error('Speech recognition not supported in your browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInput]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Error starting microphone');
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const highlightMentions = (text: string) => {
    return text
      .replace(/(@Web Search)/g, '<span class="text-blue-400">$1</span>')
      .replace(/(@Document)/g, '<span class="text-blue-400">$1</span>')
      .replace(/(@Create Image)/g, '<span class="text-blue-400">$1</span>')
      .replace(/\n/g, '<br/>')
      .replace(/ {2}/g, '&nbsp;&nbsp;');
  };
  

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);
  
    const modelFromCookie = Cookies.get('chat-model');
    const modelSupportsAttachments = modelFromCookie !== 'chat-model1';
  
    handleSubmit(undefined, {
      ...(modelSupportsAttachments && attachments.length > 0
        ? { experimental_attachments: attachments }
        : {}),
    });
  
    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
  
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );


  const hasWebSearch = input.includes('@Web Search');

  const hasDocument = input.includes('@Document');

  const hasImage = input.includes('@Create Image');

  const hasLangauge = input.includes('@Set Language to');
  
  const toggleMention = (tag: string) => {
    const mention = `@${tag}`;
    const regex = new RegExp(`\\s?${mention}`, 'g');
  
    if (input.includes(mention)) {
      // Remove all instances of the mention (with optional preceding space)
      setInput((prev) => prev.replace(regex, '').trim());
    } else {
      // Prepend the mention at the start, separated by a space if needed
      setInput((prev) => `${mention} ${prev}`.trim());
    }
  
    textareaRef.current?.focus();
  };

  const handleRemove = (urlToRemove: string) => {
    setAttachments(prev => prev.filter(att => att.url !== urlToRemove));
  };


  const modelFromCookie = Cookies.get('chat-model');

  const modelsWithAttachmentSupport = ['chat-model1', 'chat-model-reasoning', 'chat-model-reasoning1'];

  const modelsWithottools = ['chat-model-reasoning1'];
  
  // Determine if the model supports attachments
  const modelSupportsAttachments = !modelsWithAttachmentSupport.includes(modelFromCookie);
  const modelsWithottoolsdisable = !modelsWithottools.includes(modelFromCookie);

  return (
    <div className="relative w-full flex flex-col gap-4 mb-4 md:px-0 px-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} onRemove={handleRemove}/>
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Ask Srushti"
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[120px] max-h-[calc(75dvh)] shadow-xl overflow-hidden resize-none rounded-3xl p-4 !text-base font-medium bg-[#404045] pb-[55px] dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        {modelSupportsAttachments && (
          <AttachmentsButton fileInputRef={fileInputRef} status={status} />
        )}
        
        {/* <div className=''> */}
          {modelsWithottoolsdisable && (
          <Button
            type="button"
            data-testid="web-search-button"
            className={cx(
              "rounded-full p-2 h-fit px-2 md:px-3 ml-[0.40rem]",
              {
                "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-400/100": hasWebSearch,
                "dark:bg-zinc-500/50 hover:bg-zinc-500/90": !hasWebSearch,
              }
            )}
            onClick={() => toggleMention('Web Search')}
            variant="ghost"
          >
            <Earth/>
            <span className="hidden sm:block text-xs ">Web Search</span>
          </Button>
          )}
          
          {modelsWithottoolsdisable && (
          <Button
            type="button"
            data-testid="document-button"
            className={cx(
              "rounded-full p-2 h-fit px-2 md:px-3 ml-[0.40rem]",
              {
                "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-400/100": hasDocument,
                "dark:bg-zinc-500/50 hover:bg-zinc-500/90": !hasDocument,
              }
            )}
            onClick={() => toggleMention('Document')}
            variant="ghost"
          >
            <Box/>
            <span className="hidden sm:block text-xs">Document</span>
          </Button>
          )}

          {/* <Button
            type="button"
            data-testid="create-image-button"
            className={cx(
              "rounded-full p-2 h-fit px-2 md:px-3 ml-[0.40rem]",
              {
                "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-400/100": hasImage,
                "dark:bg-zinc-500/50 hover:bg-zinc-500/90": !hasImage,
              }
            )}
            onClick={() => toggleMention('Create Image')}
            variant="ghost"
          >
            <Paintbrush/>
            <span className="hidden sm:block text-xs">Create Image</span>
          </Button> */}

          <Button
            type="button"
            data-testid="language-button"
            className={cx(
              "rounded-full p-2 h-fit px-2 md:px-3 ml-[0.40rem]",
              {
                "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-400/100": hasLangauge,
                "dark:bg-zinc-500/50 hover:bg-zinc-500/90": !hasLangauge,
              }
            )}
            onClick={() => toggleMention('Set Language to')}
            variant="ghost"
          >
            <Languages/>
            <span className="hidden sm:block text-xs">Language</span>
          </Button>

        {/* </div> */}

      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end gap-2">
        {input.length > 0 ? (
          <>
            <Button
              data-testid="mic-button"
              className={`rounded-full p-2 h-fit ${isRecording ? 'bg-red-500' : 'bg-zinc-500/50 hover:dark:bg-zinc-500/90'}`}
              onClick={(event) => {
                event.preventDefault();
                toggleRecording();
              }}
              variant={isRecording ? 'destructive' : 'ghost'}
            >
              <Mic size={14} />
            </Button>
            
            {status === 'submitted' ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                uploadQueue={uploadQueue}
              />
            )}
          </>
        ) : (
          <>
          <Button
            data-testid="mic-button"
            className={`rounded-full md:mr-0 mr-4 p-2 h-fit dark:bg-zinc-500/50 hover:dark:bg-zinc-500/90 ${isRecording ? 'bg-red-500' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              toggleRecording();
            }}
            variant={isRecording ? 'destructive' : 'ghost'}
          >
            <Mic size={14} />
          </Button>
          {/* <Button
            data-testid="mic-button"
            className={`rounded-full md:mr-0 mr-4 p-2 h-fit hover:text-black text-black dark:bg-white hover:dark:bg-zinc-100/90 ${isRecording ? 'bg-red-500' : ''}`}
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission if inside a form
              window.location.href = "http://localhost:3001";
            }}
            variant={isRecording ? 'destructive' : 'ghost'}
          >
            <AudioWaveform  size={14} />
          </Button> */}
          {status === 'submitted' ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : ('')}
          </>
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-full p-2 h-fit dark:bg-zinc-500/50 hover:dark:bg-zinc-500/90 "
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={18} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-2 h-fit mr-4 md:mr-0 dark:bg-white"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-2 h-fit md:mr-0 mr-4 border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});