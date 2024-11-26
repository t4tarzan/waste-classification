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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';
import { CalculatorLayout } from '../CalculatorLayout';
import { businessWasteEducation } from '../toolsData';

interface WasteCategory {
  category: string;
  amount: number;
  unit: 'kg' | 'liters';
  cost: number;
  recyclable: boolean;
}

interface WasteAuditInputs {
  businessName: string;
  department: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  categories: WasteCategory[];
}

interface WasteAuditResults {
  totalWaste: number;
  recyclableWaste: number;
  totalCost: number;
  potentialSavings: number;
  recommendations: string[];
}

const defaultCategories: WasteCategory[] = [
  { category: 'Paper/Cardboard', amount: 0, unit: 'kg', cost: 0, recyclable: true },
  { category: 'Plastic', amount: 0, unit: 'kg', cost: 0, recyclable: true },
  { category: 'Metal', amount: 0, unit: 'kg', cost: 0, recyclable: true },
  { category: 'Glass', amount: 0, unit: 'kg', cost: 0, recyclable: true },
  { category: 'Organic Waste', amount: 0, unit: 'kg', cost: 0, recyclable: true },
  { category: 'General Waste', amount: 0, unit: 'kg', cost: 0, recyclable: false },
];

const calculateResults = (inputs: WasteAuditInputs): WasteAuditResults => {
  const multiplier = inputs.timeframe === 'daily' ? 30 : inputs.timeframe === 'weekly' ? 4 : 1;
  
  const totalWaste = inputs.categories.reduce((sum, cat) => sum + cat.amount, 0) * multiplier;
  const recyclableWaste = inputs.categories
    .filter(cat => cat.recyclable)
    .reduce((sum, cat) => sum + cat.amount, 0) * multiplier;
  const totalCost = inputs.categories.reduce((sum, cat) => sum + cat.cost, 0) * multiplier;
  
  // Assuming 30% cost reduction through better waste management
  const potentialSavings = totalCost * 0.3;

  const recommendations: string[] = [];
  const recyclablePercentage = (recyclableWaste / totalWaste) * 100;

  if (recyclablePercentage < 50) {
    recommendations.push('Implement a comprehensive recycling program to increase recyclable waste separation.');
  }
  if (totalWaste > 1000) {
    recommendations.push('Consider waste reduction strategies such as digital documentation and reusable packaging.');
  }
  
  const organicWaste = inputs.categories.find(cat => cat.category === 'Organic Waste')?.amount ?? 0;
  if (organicWaste > totalWaste * 0.3) {
    recommendations.push('Implement composting for organic waste to reduce disposal costs.');
  }

  return {
    totalWaste,
    recyclableWaste,
    totalCost,
    potentialSavings,
    recommendations,
  };
};

export const BusinessWasteCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<WasteAuditInputs>({
    businessName: '',
    department: '',
    timeframe: 'monthly',
    categories: [...defaultCategories],
  });

  const [results, setResults] = useState<WasteAuditResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleTimeframeChange = (event: SelectChangeEvent<'daily' | 'weekly' | 'monthly'>) => {
    setInputs(prev => ({
      ...prev,
      timeframe: event.target.value as 'daily' | 'weekly' | 'monthly'
    }));
  };

  const handleCategoryChange = (index: number, field: keyof WasteCategory, value: number | string) => {
    setInputs(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: field === 'recyclable' ? Boolean(value) : value } : cat
      ),
    }));
  };

  const handleCalculate = () => {
    if (!inputs.businessName) {
      setError('Please enter your business name');
      return;
    }
    setResults(calculateResults(inputs));
  };

  const handleReset = () => {
    setInputs({
      businessName: '',
      department: '',
      timeframe: 'monthly',
      categories: [...defaultCategories],
    });
    setResults(null);
    setError('');
  };

  return (
    <CalculatorLayout
      title="Business Waste Audit Calculator"
      description="Track and analyze your business waste generation patterns to identify cost-saving opportunities and improve sustainability."
      educationalContent={businessWasteEducation}
    >
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={inputs.businessName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department (Optional)"
                  name="department"
                  value={inputs.department}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="timeframe-label">Timeframe</InputLabel>
                  <Select
                    labelId="timeframe-label"
                    id="timeframe"
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
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Waste Categories
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount (kg)</TableCell>
                    <TableCell>Cost ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inputs.categories.map((category, index) => (
                    <TableRow key={category.category}>
                      <TableCell>{category.category}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={category.amount}
                          onChange={(e) => handleCategoryChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={category.cost}
                          onChange={(e) => handleCategoryChange(index, 'cost', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.1 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
          </Paper>
        </Grid>

        {/* Results Section */}
        {results && (
          <Paper elevation={3} sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Waste Audit Results
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Total Waste Generation:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {results.totalWaste.toFixed(2)} kg per {inputs.timeframe} period
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Recyclable Waste:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {results.recyclableWaste.toFixed(2)} kg ({((results.recyclableWaste / results.totalWaste) * 100).toFixed(1)}% of total waste)
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Total Cost:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ${results.totalCost.toFixed(2)} per {inputs.timeframe} period
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Potential Cost Savings:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ${results.potentialSavings.toFixed(2)} per {inputs.timeframe} period
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Recommendations:
              </Typography>
              <List>
                {results.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <RecyclingOutlinedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        )}
      </Grid>
    </CalculatorLayout>
  );
};
