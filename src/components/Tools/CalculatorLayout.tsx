import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { EducationalContent } from './types';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  educationalContent: EducationalContent;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  description,
  children,
  educationalContent,
}) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Calculator Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
            <Divider sx={{ my: 3 }} />
            {children}
          </Paper>
        </Grid>

        {/* Educational Content Section */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 88 }}>
            {/* Introduction */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                About This Calculator
              </Typography>
              <Typography variant="body1">
                {educationalContent.introduction}
              </Typography>
            </Paper>

            {/* How to Use */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">How to Use</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {educationalContent.howToUse.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${index + 1}. ${step}`}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Use Cases */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Use Cases</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {educationalContent.useCases.map((useCase, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={useCase}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Examples */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Examples</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {educationalContent.examples.map((example, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {example.title}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {example.description}
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                      }}
                    >
                      {example.calculation}
                    </Paper>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* FAQs */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">FAQs</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {educationalContent.faqs.map((faq, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {faq.question}
                    </Typography>
                    <Typography variant="body2">
                      {faq.answer}
                    </Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* References */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">References</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {educationalContent.references.map((reference, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <MuiLink
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {reference.title}
                          </MuiLink>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
