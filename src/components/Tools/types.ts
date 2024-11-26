export interface Calculator {
  id: string;
  title: string;
  description: string;
  path: string;
  category: CalculatorCategory;
  icon: string; // Material-UI icon name
}

export interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Material-UI icon name
}

export interface EducationalContent {
  introduction: string;
  howToUse: string[];
  useCases: string[];
  examples: {
    title: string;
    description: string;
    calculation: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  references: {
    title: string;
    url: string;
  }[];
}
