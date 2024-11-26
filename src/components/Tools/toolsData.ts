import { Calculator, CalculatorCategory, EducationalContent } from './types';

export const categories: CalculatorCategory[] = [
  {
    id: 'waste-audit',
    title: 'Waste Audit Tools',
    description: 'Tools for analyzing and tracking waste generation',
    icon: 'AssessmentOutlined',
  },
  {
    id: 'recycling',
    title: 'Recycling Impact',
    description: 'Calculate the environmental benefits of recycling',
    icon: 'RecyclingOutlined',
  },
  {
    id: 'composting',
    title: 'Composting Tools',
    description: 'Tools for optimizing composting processes',
    icon: 'YardOutlined',
  },
  {
    id: 'cost-savings',
    title: 'Cost & Savings',
    description: 'Analyze financial aspects of waste management',
    icon: 'SavingsOutlined',
  },
  {
    id: 'environmental-impact',
    title: 'Environmental Impact',
    description: 'Assess environmental effects of waste practices',
    icon: 'EcoOutlined',
  },
];

export const calculators: Calculator[] = [
  // Waste Audit Tools
  {
    id: 'household-waste',
    title: 'Household Waste Calculator',
    description: 'Calculate and track your household waste generation',
    icon: 'HomeOutlined',
    path: '/tools/calculators/household-waste',
    category: categories[0],
  },
  {
    id: 'business-waste',
    title: 'Business Waste Calculator',
    description: 'Track and analyze business waste output and costs',
    icon: 'BusinessOutlined',
    path: '/tools/calculators/business-waste',
    category: categories[0],
  },
  {
    id: 'event-waste',
    title: 'Event Waste Estimator',
    description: 'Estimate waste generation for events and gatherings',
    path: '/tools/event-waste',
    category: categories[0],
    icon: 'EventOutlined',
  },

  // Recycling Impact Calculators
  {
    id: 'recycling-impact',
    title: 'Recycling Impact Calculator',
    description: 'Measure the environmental benefits of your recycling efforts',
    icon: 'RecyclingOutlined',
    path: '/tools/calculators/recycling-impact',
    category: categories[1],
  },
  {
    id: 'material-recovery',
    title: 'Material Recovery Value',
    description: 'Calculate the value of recyclable materials',
    path: '/tools/material-recovery',
    category: categories[1],
    icon: 'MonetizationOnOutlined',
  },

  // Composting Calculators
  {
    id: 'composting',
    title: 'Composting Calculator',
    description: 'Optimize your composting process and track environmental benefits',
    icon: 'YardOutlined',
    path: '/tools/calculators/composting',
    category: categories[2],
  },
  {
    id: 'compost-bin-size',
    title: 'Compost Bin Size Calculator',
    description: 'Determine the right compost bin size for your needs',
    path: '/tools/compost-bin-size',
    category: categories[2],
    icon: 'SquareFootOutlined',
  },

  // Cost & Savings Calculators
  {
    id: 'waste-cost',
    title: 'Waste Management Cost Calculator',
    description: 'Calculate waste management costs and potential savings',
    path: '/tools/waste-cost',
    category: categories[3],
    icon: 'CalculateOutlined',
  },
  {
    id: 'recycling-roi',
    title: 'Recycling ROI Calculator',
    description: 'Calculate return on investment for recycling programs',
    path: '/tools/recycling-roi',
    category: categories[3],
    icon: 'TrendingUpOutlined',
  },

  // Environmental Impact Calculators
  {
    id: 'carbon-footprint',
    title: 'Waste Carbon Footprint',
    description: 'Calculate the carbon footprint of your waste',
    path: '/tools/carbon-footprint',
    category: categories[4],
    icon: 'Co2Outlined',
  },
  {
    id: 'landfill-diversion',
    title: 'Landfill Diversion Calculator',
    description: 'Calculate your landfill diversion rate and impact',
    path: '/tools/landfill-diversion',
    category: categories[4],
    icon: 'DeleteOutlined',
  },
  {
    id: 'water-savings',
    title: 'Water Savings Calculator',
    description: 'Calculate water savings from waste reduction practices',
    path: '/tools/water-savings',
    category: categories[4],
    icon: 'WaterDropOutlined',
  },
];

export const householdWasteEducation: EducationalContent = {
  introduction: `The Household Waste Calculator helps you understand and track your household's waste generation patterns. By inputting your waste data, you can identify areas for improvement and receive personalized recommendations for waste reduction.`,
  howToUse: [
    'Enter the number of residents in your household',
    'Select whether you want to calculate weekly or monthly waste',
    'Input your waste quantities by category',
    'Review your results and recommendations',
    'Keep a waste diary for accurate tracking',
    'Separate waste by category',
    'Weigh or estimate quantities regularly',
    'Look for patterns in your waste generation',
  ],
  useCases: [
    'Family waste reduction planning',
    'Monthly waste tracking',
    'Recycling goal setting',
    'Environmental impact assessment',
    'Household budget optimization'
  ],
  examples: [
    {
      title: 'Family of Four Monthly Audit',
      description: 'A typical family tracking their monthly household waste',
      calculation: 'Monthly waste: 120kg, Recyclables: 45kg, Potential reduction: 25%'
    },
    {
      title: 'Single Apartment Weekly Tracking',
      description: 'Individual monitoring weekly waste generation',
      calculation: 'Weekly waste: 8kg, Recyclables: 4kg, Compostables: 2kg'
    }
  ],
  faqs: [
    {
      question: 'How accurate should my measurements be?',
      answer: 'Consistent estimates are more valuable than precise but irregular measurements. Use the same measurement method each time.'
    },
    {
      question: 'What is considered recyclable waste?',
      answer: 'Recyclable waste typically includes paper, cardboard, certain plastics (check the number), glass, and metals. Check your local recycling guidelines.'
    },
    {
      question: 'How can I reduce my household waste?',
      answer: 'Start by avoiding single-use items, buying in bulk, composting organic waste, and properly sorting recyclables.'
    }
  ],
  references: [
    {
      title: 'EPA Household Recycling Guide',
      url: 'https://www.epa.gov/recycle/recycling-basics'
    },
    {
      title: 'Household Waste Reduction Tips',
      url: 'https://www.epa.gov/recycle/reducing-waste-what-you-can-do'
    }
  ]
};

export const businessWasteEducation: EducationalContent = {
  introduction: `The Business Waste Audit Calculator helps organizations track and analyze their waste generation patterns. By inputting detailed waste data by category, businesses can identify opportunities for cost savings and improved sustainability practices.`,
  howToUse: [
    'Enter your business name and department (optional)',
    'Select your preferred timeframe (daily, weekly, or monthly)',
    'Input waste quantities by category',
    'Review your waste profile and recommendations',
    'Conduct regular waste audits',
    'Train staff on proper waste sorting',
    'Set waste reduction targets',
    'Document waste management procedures'
  ],
  useCases: [
    'Annual environmental reporting',
    'Cost reduction initiatives',
    'Sustainability compliance',
    'Waste management optimization',
    'ESG reporting requirements'
  ],
  examples: [
    {
      title: 'Office Building Waste Audit',
      description: 'A 50-person office building conducting monthly waste audit',
      calculation: 'Monthly paper waste: 100kg, Recyclable: 80kg, Cost savings potential: $200'
    },
    {
      title: 'Restaurant Waste Analysis',
      description: 'A medium-sized restaurant tracking daily food waste',
      calculation: 'Daily organic waste: 20kg, Compostable: 15kg, Monthly cost reduction: $300'
    }
  ],
  faqs: [
    {
      question: 'How often should we conduct waste audits?',
      answer: 'It\'s recommended to conduct comprehensive waste audits monthly, with daily or weekly tracking of key metrics.'
    },
    {
      question: 'What are the benefits of tracking waste costs?',
      answer: 'Tracking waste costs helps identify potential savings, optimize waste management contracts, and justify investments in waste reduction initiatives.'
    },
    {
      question: 'How can we improve data accuracy?',
      answer: 'Use dedicated bins for each waste category, train staff on proper sorting, and maintain consistent measurement procedures.'
    }
  ],
  references: [
    {
      title: 'EPA Waste Audit Guide',
      url: 'https://www.epa.gov/transforming-waste-tool'
    },
    {
      title: 'Business Waste Reduction Guidelines',
      url: 'https://www.epa.gov/smm/managing-and-reducing-wastes-guide-commercial-buildings'
    }
  ]
};
