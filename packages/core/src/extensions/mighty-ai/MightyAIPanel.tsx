import React, { useEffect, useState } from 'react';
import type { PluginAPI } from '../../plugins/types';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '../..//components/ai-elements/prompt-input';
import { Bot, Sparkles, User } from 'lucide-react';
import { chatWithMightyAI, MightyAIChatMessage } from '../../services/mighty-ai';
import { getOpenAIKey } from '../../env';

type PromptSubmitPayload = {
  text: string;
};

export function MightyAIPanel({ api }: { api: PluginAPI }) {
  const [messages, setMessages] = useState<MightyAIChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I am Mighty AI. Ask me to create prompts, skills, agents, or workflow ideas and I will help.',
    },
  ]);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'error'>('ready');
  const [canUseAI, setCanUseAI] = useState(false);

  useEffect(() => {
    getOpenAIKey().then((key) => setCanUseAI(Boolean(key)));
  }, []);

  const handleSubmit = async ({ text }: PromptSubmitPayload) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Set OPENAI_API_KEY to enable live responses in Mighty AI.',
        },
      ]);
      api.ui.showToast({
        title: 'Missing AI key',
        description: 'Set OPENAI_API_KEY to enable Mighty AI.',
        duration: 2200,
      });
      return;
    }

    const nextMessages: MightyAIChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setStatus('submitted');
    try {
      const response = await chatWithMightyAI(nextMessages);
      setMessages([...nextMessages, { role: 'assistant', content: response }]);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      api.ui.showToast({
        title: 'Mighty AI failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 2200,
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-3">
      <div className="mb-3 text-gray-500 text-xs">AI SDK powered assistant inspired by Vercel Chatbot.</div>

      <div className="h-[430px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.role === 'user' ? 'bg-blue-600 text-white' : 'border border-white/10 bg-white/5 text-gray-200'
              }`}>
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-[#121521] p-2">
        <PromptInput onSubmit={(payload: PromptSubmitPayload) => void handleSubmit(payload)}>
          <PromptInputBody className="">
            <PromptInputTextarea placeholder="Ask Mighty AI anything..." />
          </PromptInputBody>
          <PromptInputFooter className="">
            <PromptInputTools className="">
              <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {canUseAI ? 'mighty-ai ready' : 'set OPENAI_API_KEY'}
              </span>
            </PromptInputTools>
            <PromptInputSubmit
              className=""
              onClick={() => {}}
              onStop={() => {}}
              children={<></>}
              status={status === 'submitted' ? 'submitted' : status === 'error' ? 'error' : 'ready'}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
