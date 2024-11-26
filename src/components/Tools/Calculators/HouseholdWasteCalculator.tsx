import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { CalculatorLayout } from '../CalculatorLayout';
import { householdWasteEducation } from '../toolsData';

interface WasteInputs {
  residents: number;
  generalWaste: number;
  recyclables: number;
  foodWaste: number;
  frequency: 'weekly' | 'monthly';
}

interface WasteResults {
  totalWaste: number;
  wastePerPerson: number;
  potentialReduction: number;
  recommendations: string[];
}

const calculateResults = (inputs: WasteInputs): WasteResults => {
  const multiplier = inputs.frequency === 'weekly' ? 1 : 1/4;
  const totalWaste = (inputs.generalWaste + inputs.recyclables + inputs.foodWaste) * multiplier;
  const wastePerPerson = totalWaste / inputs.residents;
  
  // Average weekly waste per person (based on EPA data)
  const averageWeeklyWaste = 4.5; // kg
  const potentialReduction = Math.max(0, ((wastePerPerson - averageWeeklyWaste) / wastePerPerson) * 100);
  
  const recommendations: string[] = [];
  if (inputs.generalWaste > inputs.recyclables) {
    recommendations.push('Consider increasing recycling efforts - many items in general waste can be recycled.');
  }
  if (inputs.foodWaste > 2 * inputs.residents) {
    recommendations.push('Your food waste is higher than average. Consider meal planning and composting.');
  }
  if (wastePerPerson > averageWeeklyWaste) {
    recommendations.push('Your household waste is above average. Review our waste reduction tips.');
  }

  return {
    totalWaste,
    wastePerPerson,
    potentialReduction,
    recommendations,
  };
};

export const HouseholdWasteCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<WasteInputs>({
    residents: 1,
    generalWaste: 0,
    recyclables: 0,
    foodWaste: 0,
    frequency: 'weekly',
  });

  const [results, setResults] = useState<WasteResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (numValue < 0) {
      setError('Values cannot be negative');
      return;
    }

    setInputs((prev) => ({
      ...prev,
      [name]: numValue || 0,
    }));
    setError('');
  };

  const handleFrequencyChange = (e: SelectChangeEvent) => {
    setInputs((prev) => ({
      ...prev,
      frequency: e.target.value as 'weekly' | 'monthly',
    }));
  };

  const handleCalculate = () => {
    if (inputs.residents < 1) {
      setError('Number of residents must be at least 1');
      return;
    }
    setResults(calculateResults(inputs));
  };

  const handleReset = () => {
    setInputs({
      residents: 1,
      generalWaste: 0,
      recyclables: 0,
      foodWaste: 0,
      frequency: 'weekly',
    });
    setResults(null);
    setError('');
  };

  return (
    <CalculatorLayout
      title="Household Waste Calculator"
      description="Track and analyze your household's waste generation patterns to identify opportunities for reduction."
      educationalContent={householdWasteEducation}
    >
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Residents"
                name="residents"
                type="number"
                value={inputs.residents}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={inputs.frequency}
                  label="Frequency"
                  onChange={handleFrequencyChange}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="General Waste (kg)"
                name="generalWaste"
                type="number"
                value={inputs.generalWaste}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Recyclables (kg)"
                name="recyclables"
                type="number"
                value={inputs.recyclables}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Food Waste (kg)"
                name="foodWaste"
                type="number"
                value={inputs.foodWaste}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleCalculate}
              disabled={!!error}
            >
              Calculate
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Grid>

        {/* Results Section */}
        {results && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Total Waste</Typography>
                  <Typography variant="h5">
                    {results.totalWaste.toFixed(1)} kg/{inputs.frequency}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Waste per Person</Typography>
                  <Typography variant="h5">
                    {results.wastePerPerson.toFixed(1)} kg/{inputs.frequency}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Potential Reduction</Typography>
                  <Typography variant="h5">
                    {results.potentialReduction.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {results.recommendations.length > 0 && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {results.recommendations.map((recommendation, index) => (
                    <Typography component="li" key={index} sx={{ mb: 1 }}>
                      {recommendation}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        )}
      </Grid>
    </CalculatorLayout>
  );
};
