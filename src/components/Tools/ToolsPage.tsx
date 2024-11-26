import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Collapse,
  useTheme,
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { Link, useLocation, Routes, Route } from 'react-router-dom';
import { categories, calculators } from './toolsData';
import { HouseholdWasteCalculator } from './Calculators/HouseholdWasteCalculator';
import { BusinessWasteCalculator } from './Calculators/BusinessWasteCalculator';
import { RecyclingImpactCalculator } from './Calculators/RecyclingImpactCalculator';
import { CompostingCalculator } from './Calculators/CompostingCalculator';
import { ToolsOverview } from './ToolsOverview';
import { CalculatorPage } from './CalculatorPage';

// Dynamic icon component
const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.CalculateOutlined />;
};

export const ToolsPage = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Check if we're on a calculator route
  const isCalculatorRoute = location.pathname.includes('/calculators/');
  const isKnowledgeBase = location.pathname === '/tools/waste-management';

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'waste-knowledge') {
      // Don't expand, as it's a direct link
      return;
    }
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Waste Management Tools
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {!isCalculatorRoute && !isKnowledgeBase ? (
              <>
                {categories.map((category) => (
                  <Grid item xs={12} key={category.id}>
                    {category.id === 'waste-knowledge' ? (
                      <Link to="/tools/waste-management" style={{ textDecoration: 'none' }}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <DynamicIcon iconName={category.icon} />
                            </Grid>
                            <Grid item>
                              <Typography variant="h6">{category.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {category.description}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Link>
                    ) : (
                      <>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor: selectedCategory === category.id ? 'action.selected' : 'background.paper',
                          }}
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <DynamicIcon iconName={category.icon} />
                            </Grid>
                            <Grid item>
                              <Typography variant="h6">{category.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {category.description}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                        {selectedCategory === category.id && (
                          <Grid container spacing={2} sx={{ mt: 2 }}>
                            {calculators
                              .filter((calc) => calc.category?.id === category.id)
                              .map((calculator) => (
                                <Grid item xs={12} sm={6} md={4} key={calculator.id}>
                                  <Link
                                    to={calculator.path}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Paper
                                      sx={{
                                        p: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                          transform: 'scale(1.02)',
                                        },
                                      }}
                                    >
                                      <DynamicIcon iconName={calculator.icon} />
                                      <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                                        {calculator.title}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" align="center">
                                        {calculator.description}
                                      </Typography>
                                    </Paper>
                                  </Link>
                                </Grid>
                              ))}
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                ))}
              </>
            ) : null}
          </Grid>
        </Grid>
      </Grid>

      <Routes>
        <Route path="/" element={<ToolsOverview categories={categories} calculators={calculators} />} />
        <Route path="/calculators/household-waste" element={<HouseholdWasteCalculator />} />
        <Route path="/calculators/business-waste" element={<BusinessWasteCalculator />} />
        <Route path="/calculators/recycling-impact" element={<RecyclingImpactCalculator />} />
        <Route path="/calculators/composting" element={<CompostingCalculator />} />
        <Route path="/calculators/:calculatorId" element={<CalculatorPage calculators={calculators} />} />
      </Routes>
    </Container>
  );
};
