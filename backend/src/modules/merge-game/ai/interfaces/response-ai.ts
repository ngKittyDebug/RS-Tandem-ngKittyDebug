export interface GrokChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: GrokChoice[];
  usage: GrokUsage;
  system_fingerprint?: string;
}

export interface GrokChoice {
  index: number;
  message: GrokMessage;
  logprobs: null;
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: GrokToolCall[];
}

export interface GrokToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface GrokUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Message {
  isCorrect: boolean;
  feedback: string;
}
