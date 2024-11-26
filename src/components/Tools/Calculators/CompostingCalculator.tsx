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
  Slider,
} from '@mui/material';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import { CalculatorLayout } from '../CalculatorLayout';

interface CompostInput {
  foodWaste: number;
  yardWaste: number;
  binSize: number;
  moistureLevel: number;
  hasAeration: boolean;
}

interface CompostResults {
  totalCompost: number;
  timeToCompost: number;
  co2Reduction: number;
  soilEnrichment: number;
  recommendations: string[];
}

const COMPOST_FACTORS = {
  foodWaste: {
    compostYield: 0.5, // 50% of original mass
    co2Reduction: 0.5, // kg CO2 per kg waste
    nutrientValue: 0.8, // Relative nutrient value
  },
  yardWaste: {
    compostYield: 0.3, // 30% of original mass
    co2Reduction: 0.3, // kg CO2 per kg waste
    nutrientValue: 0.6, // Relative nutrient value
  },
};

export const CompostingCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CompostInput>({
    foodWaste: 0,
    yardWaste: 0,
    binSize: 100,
    moistureLevel: 50,
    hasAeration: true,
  });

  const [results, setResults] = useState<CompostResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (name: keyof CompostInput, value: number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateResults = (inputs: CompostInput): CompostResults => {
    // Calculate total input waste
    const totalWaste = inputs.foodWaste + inputs.yardWaste;

    // Calculate compost yield
    const foodCompost = inputs.foodWaste * COMPOST_FACTORS.foodWaste.compostYield;
    const yardCompost = inputs.yardWaste * COMPOST_FACTORS.yardWaste.compostYield;
    const totalCompost = foodCompost + yardCompost;

    // Calculate CO2 reduction
    const co2Reduction = 
      inputs.foodWaste * COMPOST_FACTORS.foodWaste.co2Reduction +
      inputs.yardWaste * COMPOST_FACTORS.yardWaste.co2Reduction;

    // Calculate soil enrichment factor (0-100)
    const soilEnrichment = 
      ((foodCompost * COMPOST_FACTORS.foodWaste.nutrientValue +
        yardCompost * COMPOST_FACTORS.yardWaste.nutrientValue) /
        totalCompost) * 100;

    // Estimate time to compost (in weeks)
    let timeToCompost = 12; // Base time
    if (inputs.moistureLevel >= 40 && inputs.moistureLevel <= 60) timeToCompost -= 2;
    if (inputs.hasAeration) timeToCompost -= 2;
    if (totalWaste > inputs.binSize) timeToCompost += 4;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (inputs.moistureLevel < 40) {
      recommendations.push('Add more water to achieve optimal moisture content (40-60%).');
    } else if (inputs.moistureLevel > 60) {
      recommendations.push('Reduce moisture content by adding dry, carbon-rich materials.');
    }

    if (!inputs.hasAeration) {
      recommendations.push('Consider adding aeration holes or turning the compost regularly to speed up decomposition.');
    }

    if (totalWaste > inputs.binSize) {
      recommendations.push('Consider getting a larger compost bin or starting a second bin.');
    }

    const ratio = inputs.foodWaste / (inputs.yardWaste || 1);
    if (ratio > 2) {
      recommendations.push('Add more brown materials (yard waste) to balance the carbon-to-nitrogen ratio.');
    } else if (ratio < 0.5) {
      recommendations.push('Add more green materials (food waste) to improve decomposition rate.');
    }

    return {
      totalCompost,
      timeToCompost,
      co2Reduction,
      soilEnrichment,
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
      title="Composting Calculator"
      description="Calculate composting metrics and track environmental benefits"
      educationalContent={{
        introduction: "Composting is a natural process that converts organic waste into nutrient-rich soil amendment.",
        howToUse: [
          "Enter the amount of food waste and yard waste you generate",
          "Review the calculated metrics including compost yield and environmental benefits",
          "Follow the recommendations to optimize your composting process"
        ],
        useCases: [
          "Home composting",
          "Community gardens",
          "Agricultural operations",
          "Municipal waste management"
        ],
        examples: [
          {
            title: "Home Composting",
            description: "A household composting kitchen scraps and yard waste",
            calculation: "50 lbs food waste + 50 lbs yard waste = 45 lbs compost in 3-6 months"
          },
          {
            title: "Community Garden",
            description: "A community garden processing local organic waste",
            calculation: "500 lbs mixed organic waste = 400 lbs compost in 4-8 months"
          },
          {
            title: "Agricultural Operation",
            description: "A farm converting agricultural waste into fertilizer",
            calculation: "2000 lbs crop residue = 1600 lbs nutrient-rich compost in 6-12 months"
          }
        ],
        faqs: [
          {
            question: "How long does composting take?",
            answer: "Composting typically takes 2-12 months depending on materials and conditions."
          },
          {
            question: "What can I compost?",
            answer: "You can compost food scraps, yard waste, paper products, and other organic materials."
          },
          {
            question: "What are the benefits of composting?",
            answer: "Composting reduces waste, creates nutrient-rich soil, and helps fight climate change."
          }
        ],
        references: [
          {
            title: "EPA Composting At Home Guide",
            url: "https://www.epa.gov/recycle/composting-home"
          },
          {
            title: "Composting Council Best Practices",
            url: "https://www.compostingcouncil.org/page/CompostingProcess"
          },
          {
            title: "Environmental Benefits of Composting Research",
            url: "https://www.sciencedirect.com/science/article/abs/pii/S0956053X20301987"
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Food Waste (kg/month)"
                  type="number"
                  value={inputs.foodWaste}
                  onChange={(e) => handleInputChange('foodWaste', Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0, step: 0.1 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Yard Waste (kg/month)"
                  type="number"
                  value={inputs.yardWaste}
                  onChange={(e) => handleInputChange('yardWaste', Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0, step: 0.1 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bin Size (liters)"
                  type="number"
                  value={inputs.binSize}
                  onChange={(e) => handleInputChange('binSize', Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0, step: 10 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Moisture Level (%)</Typography>
                <Slider
                  value={inputs.moistureLevel}
                  onChange={(_, value) => handleInputChange('moistureLevel', value as number)}
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Aeration System</InputLabel>
                  <Select
                    value={inputs.hasAeration ? 'yes' : 'no'}
                    label="Aeration System"
                    onChange={(e) => handleInputChange('hasAeration', e.target.value === 'yes')}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  fullWidth
                >
                  Calculate Composting Impact
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {results && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Composting Results
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Expected Compost Yield:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.totalCompost.toFixed(2)} kg of nutrient-rich compost
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Estimated Time to Mature Compost:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.timeToCompost} weeks
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  CO₂ Emissions Reduced:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.co2Reduction.toFixed(2)} kg
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Soil Enrichment Factor:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {results.soilEnrichment.toFixed(1)}% nutrient value
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Recommendations:
                </Typography>
                <List>
                  {results.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <YardOutlinedIcon color="primary" />
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
