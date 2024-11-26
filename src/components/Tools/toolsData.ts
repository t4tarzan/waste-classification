import { Calculator, CalculatorCategory } from './types';

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
  // Waste Footprint Calculators
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

export const householdWasteEducation = {
  introduction: `The Household Waste Calculator helps you understand and track your household's waste generation patterns. By inputting your waste data, you can identify areas for improvement and receive personalized recommendations for waste reduction.`,
  howToUse: [
    'Enter the number of residents in your household',
    'Select whether you want to calculate weekly or monthly waste',
    'Input your household waste amounts in kilograms for each category',
    'Click "Calculate" to see your results and recommendations',
    'Use the "Reset" button to start over with new calculations'
  ],
  useCases: [
    'Track your household waste generation over time',
    'Compare your waste output to national averages',
    'Identify opportunities for waste reduction',
    'Plan waste reduction goals for your household',
    'Educate family members about waste patterns'
  ],
  examples: [
    {
      title: 'Family of Four',
      description: 'A family of four tracking their weekly waste generation and identifying areas for improvement.',
      calculation: 'Weekly waste: General waste = 10kg, Recyclables = 5kg, Food waste = 3kg\nTotal = 18kg/week (4.5kg per person)\nRecommendation: Increase recycling rate by properly sorting waste.'
    },
    {
      title: 'Single Resident',
      description: 'A single person living in an apartment tracking their monthly waste reduction progress.',
      calculation: 'Monthly waste: General waste = 15kg, Recyclables = 8kg, Food waste = 7kg\nTotal = 30kg/month\nAfter implementing meal planning: Food waste reduced to 3kg/month.'
    }
  ],
  faqs: [
    {
      question: 'How accurate are the calculations?',
      answer: 'The calculator uses EPA average data as a baseline and provides estimates based on your input. For most accurate results, weigh your waste before disposal.'
    },
    {
      question: 'What is considered general waste?',
      answer: 'General waste includes non-recyclable items that go to landfill, such as certain plastics, contaminated materials, and other non-biodegradable items.'
    },
    {
      question: 'How can I measure my waste?',
      answer: 'You can use a bathroom scale to weigh your waste bags, or check the capacity of your waste bins and estimate based on how full they are.'
    }
  ],
  references: [
    {
      title: 'EPA Waste Statistics',
      url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling'
    },
    {
      title: 'Waste Reduction Guidelines',
      url: 'https://www.epa.gov/recycle'
    }
  ]
};

export const businessWasteEducation = {
  introduction: `The Business Waste Audit Calculator helps organizations track and analyze their waste generation patterns. By inputting detailed waste data by category, businesses can identify opportunities for cost savings and improved sustainability practices.`,
  howToUse: [
    'Enter your business name and department (optional)',
    'Select your preferred timeframe (daily, weekly, or monthly)',
    'Input waste amounts and costs for each category',
    'Click "Calculate" to see your waste audit results',
    'Review recommendations for waste reduction and cost savings'
  ],
  useCases: [
    'Conduct regular waste audits for your business',
    'Track waste management costs and identify savings opportunities',
    'Monitor recycling rates and set improvement targets',
    'Generate waste reports for sustainability initiatives',
    'Plan waste reduction strategies based on data'
  ],
  examples: [
    {
      title: 'Office Building',
      description: 'A medium-sized office conducting a monthly waste audit',
      calculation: 'Paper waste: 200kg, Recyclables: 150kg, General waste: 100kg\nTotal monthly cost: $800\nIdentified potential savings: $240 through improved recycling'
    },
    {
      title: 'Restaurant',
      description: 'A restaurant tracking daily waste output',
      calculation: 'Food waste: 20kg, Packaging: 15kg, Recyclables: 10kg\nDaily cost: $50\nReduced costs by 35% through composting program'
    }
  ],
  faqs: [
    {
      question: 'How often should we conduct waste audits?',
      answer: 'For best results, conduct monthly audits initially, then quarterly once you have established baseline data and improvement programs.'
    },
    {
      question: 'What waste categories should we track?',
      answer: 'Track main categories like paper/cardboard, plastics, metal, glass, organic waste, and general waste. Add specific categories based on your business type.'
    },
    {
      question: 'How can we improve accuracy?',
      answer: 'Use dedicated bins for each waste category, weigh waste before disposal, and train staff on proper waste sorting procedures.'
    }
  ],
  references: [
    {
      title: 'EPA Business Waste Guidelines',
      url: 'https://www.epa.gov/smm/managing-and-reducing-wastes-guide-commercial-buildings'
    },
    {
      title: 'Commercial Recycling Best Practices',
      url: 'https://www.epa.gov/transforming-waste-tool/how-communities-have-defined-zero-waste'
    }
  ]
};
