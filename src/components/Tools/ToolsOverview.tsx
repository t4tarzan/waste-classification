import React from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calculator, CalculatorCategory } from './types';
import * as Icons from '@mui/icons-material';

interface ToolsOverviewProps {
  categories: CalculatorCategory[];
  calculators: Calculator[];
}

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.CalculateOutlined />;
};

export const ToolsOverview: React.FC<ToolsOverviewProps> = ({ categories, calculators }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={category.id}>
          <Card>
            <CardActionArea 
              onClick={() => {
                if (category.id === 'waste-knowledge') {
                  navigate('/tools/waste-knowledge');
                } else {
                  // Handle other category navigations
                  const categoryCalculators = calculators.filter(calc => calc.category?.id === category.id);
                  if (categoryCalculators.length === 1) {
                    navigate(categoryCalculators[0].path);
                  }
                }
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <DynamicIcon iconName={category.icon} />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" component="h2">
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
