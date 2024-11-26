import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Policy as PolicyIcon,
  Business as BusinessIcon,
  Nature as NatureIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface Topic {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: {
    title: string;
    subtitle?: string;
    sections: {
      title: string;
      items: {
        title: string;
        description: string;
      }[];
    }[];
  };
}

const topics: Topic[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    icon: <MenuBookIcon />,
    content: {
      title: 'Waste Management Fundamentals',
      subtitle: 'Understanding the basics of waste management systems and processes',
      sections: [
        {
          title: 'Key Principles',
          items: [
            {
              title: 'Waste Hierarchy',
              description: 'A comprehensive framework that prioritizes waste management strategies from most to least environmentally preferred. It emphasizes prevention, minimization, reuse, recycling, and energy recovery before considering disposal options.',
            },
            {
              title: 'Source Reduction',
              description: 'The practice of designing, manufacturing, and using products that minimize the amount and toxicity of waste created. This includes reducing packaging, using durable goods, and implementing efficient manufacturing processes.',
            },
            {
              title: 'Reuse and Recycling',
              description: 'Reuse involves using items multiple times before disposal, while recycling converts waste materials into new products. Both methods help conserve resources, reduce landfill use, and minimize environmental impact.',
            },
            {
              title: 'Waste Treatment',
              description: 'Various processes used to reduce waste volume and hazardous characteristics. This includes physical, chemical, and biological treatments that make waste safer for disposal or enable resource recovery.',
            },
            {
              title: 'Disposal Methods',
              description: 'The final stage of waste management, including landfilling and incineration. Modern disposal facilities incorporate environmental protection measures like leachate collection, gas management, and monitoring systems.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: <AssignmentIcon />,
    content: {
      title: 'Waste Management Best Practices',
      subtitle: 'Effective practices that ensure safety, efficiency, and environmental protection',
      sections: [
        {
          title: 'Core Practices',
          items: [
            {
              title: 'Waste Segregation',
              description: 'The systematic separation of waste into different categories such as recyclables, organic waste, and hazardous materials. Proper segregation ensures efficient recycling, reduces contamination, and improves resource recovery.',
            },
            {
              title: 'Regular Collection Schedules',
              description: 'Implementing consistent and reliable waste collection timing to prevent accumulation and maintain cleanliness. This includes coordinating with various stakeholders and optimizing routes for efficiency.',
            },
            {
              title: 'Proper Storage',
              description: 'Using appropriate containers and facilities to store different types of waste safely. This includes considerations for weather protection, pest control, and preventing contamination of surrounding areas.',
            },
            {
              title: 'Employee Training',
              description: 'Comprehensive training programs that ensure staff understand proper waste handling procedures, safety protocols, and environmental regulations. Regular updates keep everyone informed about best practices.',
            },
            {
              title: 'Documentation',
              description: 'Maintaining detailed records of waste generation, handling, and disposal activities. This includes tracking quantities, types, and movement of waste materials for compliance and improvement purposes.',
            },
            {
              title: 'Environmental Monitoring',
              description: 'Regular assessment of environmental impacts through air, water, and soil testing. This helps identify potential issues early and ensures compliance with environmental protection standards.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'regulations',
    title: 'Regulations & Standards',
    icon: <PolicyIcon />,
    content: {
      title: 'Waste Management Regulations & Standards',
      subtitle: 'Understanding compliance requirements and industry standards',
      sections: [
        {
          title: 'Key Regulations',
          items: [
            {
              title: 'Environmental Protection Laws',
              description: 'Federal and state regulations that govern waste management practices to protect environmental quality. These laws establish standards for air emissions, water discharges, and soil protection.',
            },
            {
              title: 'Health and Safety Standards',
              description: 'Regulations ensuring safe working conditions in waste management operations. This includes requirements for personal protective equipment, handling procedures, and emergency response protocols.',
            },
            {
              title: 'Transportation Requirements',
              description: 'Rules governing the movement of waste materials, including vehicle specifications, route restrictions, and documentation requirements. Special provisions apply to hazardous waste transportation.',
            },
            {
              title: 'Disposal Regulations',
              description: 'Standards for waste disposal facilities including design requirements, operational procedures, and monitoring protocols. These ensure environmental protection and public safety at disposal sites.',
            },
            {
              title: 'Documentation Requirements',
              description: 'Legal obligations for record-keeping and reporting of waste management activities. This includes manifests for waste shipments, disposal records, and regular compliance reports to regulatory agencies.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'industry',
    title: 'Industry Applications',
    icon: <BusinessIcon />,
    content: {
      title: 'Industry Applications',
      subtitle: 'Sector-specific approaches to waste management',
      sections: [
        {
          title: 'Industry Sectors',
          items: [
            {
              title: 'Manufacturing',
              description: 'Specialized waste management solutions for industrial processes, including scrap material recovery, chemical waste handling, and production waste minimization. Emphasis on circular economy principles.',
            },
            {
              title: 'Healthcare',
              description: 'Strict protocols for managing medical waste, including infectious materials, sharps, and pharmaceutical waste. Special handling and treatment requirements ensure public safety and regulatory compliance.',
            },
            {
              title: 'Construction',
              description: 'Management of construction and demolition debris, including material recycling, waste reduction planning, and proper disposal of hazardous materials like asbestos and lead-based materials.',
            },
            {
              title: 'Food Service',
              description: 'Systems for managing organic waste, packaging materials, and used cooking oils. Focus on composting programs, recycling initiatives, and proper disposal of food waste to minimize environmental impact.',
            },
            {
              title: 'Retail',
              description: 'Strategies for handling packaging waste, product returns, and general retail waste. Emphasis on recycling programs, sustainable packaging solutions, and efficient waste collection systems.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'sustainable',
    title: 'Sustainable Solutions',
    icon: <NatureIcon />,
    content: {
      title: 'Sustainable Waste Management Solutions',
      subtitle: 'Environmental protection and resource conservation strategies',
      sections: [
        {
          title: 'Key Areas',
          items: [
            {
              title: 'Zero Waste Programs',
              description: 'Comprehensive strategies aimed at eliminating waste through better design, consumption, reuse, and recovery practices. These programs often include community engagement and educational components.',
            },
            {
              title: 'Circular Economy',
              description: 'Business models and systems that eliminate waste by keeping materials in use through continuous cycles of reuse, repair, and recycling. This approach transforms waste into valuable resources.',
            },
            {
              title: 'Green Technologies',
              description: 'Innovative solutions for waste treatment and recycling, including advanced sorting systems, waste-to-energy technologies, and biodegradable materials processing methods.',
            },
            {
              title: 'Resource Recovery',
              description: 'Processes and technologies for extracting valuable materials from waste streams, including metals recovery, composting, and the production of alternative fuels from waste materials.',
            },
            {
              title: 'Environmental Impact Reduction',
              description: 'Strategies to minimize the environmental footprint of waste management activities, including greenhouse gas reduction, water conservation, and habitat protection measures.',
            },
          ],
        },
      ],
    },
  },
];

export const WasteManagementPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <List>
        {topics.map((topic) => (
          <ListItem
            button
            key={topic.id}
            onClick={() => {
              setSelectedTopic(topic);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={selectedTopic.id === topic.id}
          >
            <ListItemIcon>{topic.icon}</ListItemIcon>
            <ListItemText primary={topic.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100%', pt: 8, pb: 8 }}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 70, left: 10, zIndex: 1100 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          position: 'fixed',
          top: 64, // AppBar height
          height: 'auto',
          maxHeight: 'calc(100vh - 128px)',
          overflowY: 'auto',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawer}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            top: '64px',
            height: 'auto',
            maxHeight: 'calc(100vh - 128px)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {selectedTopic && selectedTopic.content && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {selectedTopic.content.title}
                </Typography>
                {selectedTopic.content.subtitle && (
                  <Typography variant="subtitle1" color="text.secondary" paragraph>
                    {selectedTopic.content.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {selectedTopic.content.sections?.map((section, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {section.title}
                      </Typography>
                      <Grid container spacing={2}>
                        {section.items?.map((item, itemIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={itemIndex}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default WasteManagementPage;
