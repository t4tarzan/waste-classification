import React from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calculator, CalculatorCategory } from './types';
import * as Icons from '@mui/icons-material';

interface ToolsOverviewProps {
  calculators: Calculator[];
}

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.CalculateOutlined />;
};

export const ToolsOverview: React.FC<ToolsOverviewProps> = ({ calculators }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      {calculators.map((calculator) => (
        <Grid item xs={12} sm={6} md={4} key={calculator.id}>
          <Card>
            <CardActionArea onClick={() => navigate(calculator.path)}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <DynamicIcon iconName={calculator.icon} />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" component="h2">
                      {calculator.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {calculator.description}
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
