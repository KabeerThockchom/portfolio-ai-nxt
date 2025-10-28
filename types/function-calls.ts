// Function call tracking type definitions

export interface FunctionCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  timestamp: number;
  status: 'success' | 'error';
  result?: any;
}
