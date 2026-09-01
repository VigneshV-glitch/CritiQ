/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AIProviderType, AIStrategy, AIConnection, ProviderConnectionStatus } from '../ai/types/provider';
import { AIModelDefinition, MODEL_CATALOG, getDefaultModelForProvider } from '../ai/types/model';
import { AIGateway } from '../ai/gateway/AIGateway';
import { AnalyzeDesignRequest, AIChatRequest } from '../ai/types/request';
import { AIChatResponse, NormalizedAIResponse } from '../ai/types/response';

interface AIProviderContextValue {
  selectedProvider: AIProviderType | 'auto';
  selectedModel: string;
  selectedStrategy: AIStrategy;
  connections: Record<AIProviderType, AIConnection>;
  availableModels: AIModelDefinition[];
  isHubOpen: boolean;
  isTestingConnection: boolean;
  activeProviderConnection: AIConnection;
  setSelectedProvider: (provider: AIProviderType | 'auto') => void;
  setSelectedModel: (model: string) => void;
  setSelectedStrategy: (strategy: AIStrategy) => void;
  setIsHubOpen: (open: boolean) => void;
  testConnection: (provider: AIProviderType) => Promise<{ isValid: boolean; message: string; latencyMs: number }>;
  analyzeDesignWithGateway: (request: Omit<AnalyzeDesignRequest, 'providerPreference' | 'modelPreference' | 'aiStrategy'>) => Promise<NormalizedAIResponse>;
  chatWithGateway: (request: Omit<AIChatRequest, 'providerPreference' | 'modelPreference'>) => Promise<AIChatResponse>;
}

const DEFAULT_CONNECTIONS: Record<AIProviderType, AIConnection> = {
  gemini: {
    id: 'conn_gemini',
    provider: 'gemini',
    displayName: 'Google Gemini',
    status: 'connected',
    authType: 'server_env',
    selectedModel: 'gemini-3.6-flash',
    availableModels: ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro'],
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1200,
    },
    isConfigured: true,
  },
  claude: {
    id: 'conn_claude',
    provider: 'claude',
    displayName: 'Anthropic Claude',
    status: 'connected',
    authType: 'server_env',
    selectedModel: 'claude-3-7-sonnet-20250219',
    availableModels: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1900,
    },
    isConfigured: true,
  },
  openai: {
    id: 'conn_openai',
    provider: 'openai',
    displayName: 'OpenAI',
    status: 'connected',
    authType: 'server_env',
    selectedModel: 'gpt-4o',
    availableModels: ['gpt-4o', 'gpt-4o-mini'],
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 4096,
      typicalLatencyMs: 1600,
    },
    isConfigured: true,
  },
  openrouter: {
    id: 'conn_openrouter',
    provider: 'openrouter',
    displayName: 'OpenRouter',
    status: 'connected',
    authType: 'server_env',
    selectedModel: 'openrouter/auto',
    availableModels: ['openrouter/auto'],
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1800,
    },
    isConfigured: true,
  },
  custom: {
    id: 'conn_custom',
    provider: 'custom',
    displayName: 'Custom Provider',
    status: 'not_connected',
    authType: 'user_configured',
    selectedModel: '',
    availableModels: [],
    capabilities: {
      vision: false,
      structuredOutput: false,
      toolCalling: false,
      longContext: false,
      streaming: false,
      maxTokens: 4096,
      typicalLatencyMs: 2000,
    },
    isConfigured: false,
  },
};

const AIProviderContext = createContext<AIProviderContextValue | null>(null);

export const AIProviderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProvider, setSelectedProviderState] = useState<AIProviderType | 'auto'>('auto');
  const [selectedModel, setSelectedModelState] = useState<string>('gemini-3.6-flash');
  const [selectedStrategy, setSelectedStrategy] = useState<AIStrategy>('BALANCED');
  const [connections, setConnections] = useState<Record<AIProviderType, AIConnection>>(DEFAULT_CONNECTIONS);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const gateway = AIGateway.getInstance();

  const setSelectedProvider = useCallback((provider: AIProviderType | 'auto') => {
    setSelectedProviderState(provider);
    if (provider !== 'auto') {
      const defaultModel = getDefaultModelForProvider(provider);
      setSelectedModelState(defaultModel);
    }
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
  }, []);

  const testConnection = useCallback(async (provider: AIProviderType) => {
    setIsTestingConnection(true);
    try {
      const result = await gateway.testProviderConnection(provider);
      setConnections((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          status: result.isValid ? 'connected' : 'error',
          lastTestedAt: new Date().toISOString(),
          latencyMs: result.latencyMs,
          errorMessage: result.isValid ? undefined : result.message,
        },
      }));
      return result;
    } finally {
      setIsTestingConnection(false);
    }
  }, [gateway]);

  const analyzeDesignWithGateway = useCallback(
    async (request: Omit<AnalyzeDesignRequest, 'providerPreference' | 'modelPreference' | 'aiStrategy'>) => {
      const providerPref = selectedProvider === 'auto' ? undefined : selectedProvider;
      return gateway.analyzeDesign({
        ...request,
        providerPreference: providerPref,
        modelPreference: selectedModel,
        aiStrategy: selectedStrategy,
      });
    },
    [gateway, selectedProvider, selectedModel, selectedStrategy]
  );

  const chatWithGateway = useCallback(
    async (request: Omit<AIChatRequest, 'providerPreference' | 'modelPreference'>) => {
      const providerPref = selectedProvider === 'auto' ? 'gemini' : selectedProvider;
      return gateway.chat({
        ...request,
        providerPreference: providerPref,
        modelPreference: selectedModel,
      });
    },
    [gateway, selectedProvider, selectedModel]
  );

  const activeProviderKey: AIProviderType = selectedProvider === 'auto' ? 'gemini' : selectedProvider;
  const activeProviderConnection = connections[activeProviderKey] || connections.gemini;

  return (
    <AIProviderContext.Provider
      value={{
        selectedProvider,
        selectedModel,
        selectedStrategy,
        connections,
        availableModels: MODEL_CATALOG,
        isHubOpen,
        isTestingConnection,
        activeProviderConnection,
        setSelectedProvider,
        setSelectedModel,
        setSelectedStrategy,
        setIsHubOpen,
        testConnection,
        analyzeDesignWithGateway,
        chatWithGateway,
      }}
    >
      {children}
    </AIProviderContext.Provider>
  );
};

export function useAIGateway() {
  const ctx = useContext(AIProviderContext);
  if (!ctx) {
    throw new Error('useAIGateway must be used within an AIProviderContextProvider');
  }
  return ctx;
}
