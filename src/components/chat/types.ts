export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface QuickAction {
  id: string;
  label: string;
  query: string;
}

export interface ChatContext {
  currentStep: number;
  industry: string;
  selectedPlan: string;
  quantityRange: string;
  objectSizeRange: string;
  locationMode: string;
  deliverables: string[];
}
