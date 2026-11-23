import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class Bf16 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'bf16.ai',
    name: 'bf16',
    icon: 'file:bf16.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["model"]}}',
    description:
      'Run 1M-context uncensored open-weight LLMs via bf16.ai with strict Zero Data Retention',
    defaults: {
      name: 'bf16.ai',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'bf16Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Chat Completion',
            value: 'chatCompletion',
            action: 'Create a chat completion',
          },
          {
            name: 'List Models',
            value: 'listModels',
            action: 'List active models and live pricing',
          },
        ],
        default: 'chatCompletion',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        displayOptions: {
          show: { operation: ['chatCompletion'] },
        },
        options: [
          {
            name: 'DeepSeek V4.1 Flash Fast (1M)',
            value: 'deepseek/deepseek-v4.1-flash-uncensored-fast',
          },
          {
            name: 'DeepSeek V4.1 Flash (1M)',
            value: 'deepseek/deepseek-v4.1-flash-uncensored',
          },
          {
            name: 'DeepSeek V4.1 Flash 1017 EXL3 (524K)',
            value: 'bf16/deepseek-v4.1-flash-1017-exl3-2.5bpw',
          },
          {
            name: 'GLM-5.3 Flash (1M, Vision)',
            value: 'zai-org/glm-5.3-flash-uncensored',
          },
          {
            name: 'GLM-5.3 (1M)',
            value: 'zai-org/glm-5.3-uncensored',
          },
          {
            name: 'Kimi K3.1 Pro (1M, Vision)',
            value: 'moonshotai/kimi-k3.1-pro-uncensored',
          },
          {
            name: 'bf16/auto:coding (Smart Router)',
            value: 'bf16/auto:coding',
          },
        ],
        default: 'deepseek/deepseek-v4.1-flash-uncensored-fast',
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: { rows: 3 },
        displayOptions: {
          show: { operation: ['chatCompletion'] },
        },
        default: '',
      },
      {
        displayName: 'User Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: { rows: 5 },
        required: true,
        displayOptions: {
          show: { operation: ['chatCompletion'] },
        },
        default: '',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: { operation: ['chatCompletion'] },
        },
        options: [
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
            default: 0.2,
          },
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 4096,
          },
          {
            displayName: 'JSON Output Mode',
            name: 'jsonMode',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('bf16Api');
    const baseUrl = String(credentials.baseUrl || 'https://api.bf16.ai/v1').replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;

      if (operation === 'listModels') {
        const res = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'bf16Api',
          { method: 'GET', url: `${baseUrl}/models`, json: true }
        );
        returnData.push({ json: res });
        continue;
      }

      const model = this.getNodeParameter('model', i) as string;
      const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
      const prompt = this.getNodeParameter('prompt', i) as string;
      const options = this.getNodeParameter('options', i) as {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
      };

      const messages: Array<{ role: string; content: string }> = [];
      if (systemPrompt.trim()) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const body: Record<string, unknown> = {
        model,
        messages,
      };
      if (options.temperature !== undefined) body.temperature = options.temperature;
      if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
      if (options.jsonMode) body.response_format = { type: 'json_object' };

      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        'bf16Api',
        {
          method: 'POST',
          url: `${baseUrl}/chat/completions`,
          body,
          json: true,
        }
      );

      const content = response?.choices?.[0]?.message?.content ?? '';
      returnData.push({
        json: {
          content,
          model: response?.model ?? model,
          usage: response?.usage ?? null,
          raw: response,
        },
      });
    }

    return [returnData];
  }
}
