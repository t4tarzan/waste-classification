import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import { CalculatorLayout } from '../CalculatorLayout';

interface RecyclableItem {
  material: string;
  amount: number;
}

interface RecyclingInputs {
  timeframe: 'daily' | 'weekly' | 'monthly';
  items: RecyclableItem[];
}

interface RecyclingResults {
  totalRecycled: number;
  co2Savings: number;
  treesEquivalent: number;
  waterSaved: number;
  energySaved: number;
  recommendations: string[];
}

// Environmental impact factors (example values)
const IMPACT_FACTORS = {
  paper: {
    co2PerKg: 2.5,
    waterPerKg: 50,
    energyPerKg: 4.5,
  },
  plastic: {
    co2PerKg: 2.0,
    waterPerKg: 30,
    energyPerKg: 6.0,
  },
  glass: {
    co2PerKg: 0.8,
    waterPerKg: 20,
    energyPerKg: 3.0,
  },
  metal: {
    co2PerKg: 4.0,
    waterPerKg: 40,
    energyPerKg: 8.0,
  },
};

export const RecyclingImpactCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<RecyclingInputs>({
    timeframe: 'monthly',
    items: [
      { material: 'paper', amount: 0 },
      { material: 'plastic', amount: 0 },
      { material: 'glass', amount: 0 },
      { material: 'metal', amount: 0 },
    ],
  });

  const [results, setResults] = useState<RecyclingResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleTimeframeChange = (event: SelectChangeEvent<'daily' | 'weekly' | 'monthly'>) => {
    setInputs(prev => ({
      ...prev,
      timeframe: event.target.value as 'daily' | 'weekly' | 'monthly',
    }));
  };

  const handleAmountChange = (index: number, value: number) => {
    setInputs(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, amount: value } : item
      ),
    }));
  };

  const calculateResults = (inputs: RecyclingInputs): RecyclingResults => {
    const multiplier = inputs.timeframe === 'daily' ? 30 : inputs.timeframe === 'weekly' ? 4 : 1;
    
    let totalRecycled = 0;
    let totalCo2Savings = 0;
    let totalWaterSaved = 0;
    let totalEnergySaved = 0;

    inputs.items.forEach(item => {
      const amount = item.amount * multiplier;
      totalRecycled += amount;
      
      const factors = IMPACT_FACTORS[item.material as keyof typeof IMPACT_FACTORS];
      totalCo2Savings += amount * factors.co2PerKg;
      totalWaterSaved += amount * factors.waterPerKg;
      totalEnergySaved += amount * factors.energyPerKg;
    });

    // 1 tree absorbs about 22kg of CO2 per year
    const treesEquivalent = totalCo2Savings / (22 / 12); // Monthly equivalent

    const recommendations: string[] = [];
    if (totalRecycled < 50) {
      recommendations.push('Consider implementing a comprehensive recycling program to increase recycling rates.');
    }
    if (inputs.items[0].amount > inputs.items.slice(1).reduce((sum, item) => sum + item.amount, 0)) {
      recommendations.push('Look into reducing paper usage by digitizing documents where possible.');
    }
    if (inputs.items[1].amount > 20) {
      recommendations.push('Consider alternatives to single-use plastics to reduce plastic waste.');
    }

    return {
      totalRecycled,
      co2Savings: totalCo2Savings,
      treesEquivalent,
      waterSaved: totalWaterSaved,
      energySaved: totalEnergySaved,
      recommendations,
    };
  };

  const handleCalculate = () => {
    try {
      const results = calculateResults(inputs);
      setResults(results);
      setError('');
    } catch (err) {
      setError('Error calculating results. Please check your inputs.');
    }
  };

  return (
    <CalculatorLayout 
      title="Recycling Impact Calculator"
      description="Calculate the environmental benefits of your recycling efforts"
      educationalContent={{
        introduction: "Recycling helps reduce waste, conserve resources, and minimize environmental impact.",
        howToUse: [
          "Enter the amounts of different materials you recycle",
          "View the calculated environmental benefits",
          "Follow the recommendations to improve your recycling impact"
        ],
        useCases: [
          "Household recycling programs",
          "Business recycling initiatives",
          "Community recycling centers",
          "School recycling programs"
        ],
        examples: [
          {
            title: "Household Recycling",
            description: "A family recycling paper, plastic, and metal waste",
            calculation: "100 lbs mixed recyclables = 200 lbs CO2 saved + 1000 gallons water conserved"
          },
          {
            title: "Office Recycling",
            description: "An office implementing paper and electronics recycling",
            calculation: "500 lbs paper + 200 lbs electronics = 800 lbs CO2 saved"
          },
          {
            title: "Community Center",
            description: "A community center's monthly recycling collection",
            calculation: "2000 lbs mixed recyclables = 4000 lbs CO2 saved + 5000 gallons water conserved"
          }
        ],
        faqs: [
          {
            question: "What materials can be recycled?",
            answer: "Common recyclables include paper, cardboard, glass, metals, and many types of plastic."
          },
          {
            question: "How does recycling help the environment?",
            answer: "Recycling reduces landfill waste, saves energy, conserves resources, and reduces greenhouse gas emissions."
          },
          {
            question: "What happens to recycled materials?",
            answer: "Recycled materials are processed and transformed into new products, reducing the need for raw materials."
          }
        ],
        references: [
          {
            title: "EPA Recycling Basics",
            url: "https://www.epa.gov/recycle/recycling-basics"
          },
          {
            title: "Environmental Benefits of Recycling",
            url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling"
          },
          {
            title: "How to Recycle Guide",
            url: "https://earth911.com/recycling-guide/"
          }
        ]
      }}
    >
      <Grid container spacing={3}>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={inputs.timeframe}
                    label="Timeframe"
                    onChange={handleTimeframeChange}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {inputs.items.map((item, index) => (
                <Grid item xs={12} md={6} key={item.material}>
                  <TextField
                    fullWidth
                    label={`${item.material.charAt(0).toUpperCase() + item.material.slice(1)} (kg)`}
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleAmountChange(index, Number(e.target.value))}
                    InputProps={{
                      inputProps: { min: 0, step: 0.1 }
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  fullWidth
                >
                  Calculate Impact
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {results && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Environmental Impact Results
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Total Materials Recycled:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.totalRecycled.toFixed(2)} kg per {inputs.timeframe} period
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  CO₂ Emissions Saved:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.co2Savings.toFixed(2)} kg ({results.treesEquivalent.toFixed(1)} trees monthly equivalent)
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Water Saved:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.waterSaved.toFixed(2)} liters
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Energy Saved:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.energySaved.toFixed(2)} kWh
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Recommendations:
                </Typography>
                <List>
                  {results.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <NatureOutlinedIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </CalculatorLayout>
  );
};
