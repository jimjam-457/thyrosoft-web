import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MuiGrid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import {
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

// Create a custom Grid component to handle the item prop correctly
const Grid = ({ children, item = false, ...props }: any) => {
  if (item) {
    return <MuiGrid item {...props}>{children}</MuiGrid>;
  }
  return <MuiGrid container {...props}>{children}</MuiGrid>;
};

const Reports: React.FC = () => {
  const reportCards = [
    {
      title: 'Patient Reports',
      description: 'View patient statistics and analytics',
      icon: <PeopleIcon />,
      color: '#1976d2'
    },
    {
      title: 'Doctor Reports',
      description: 'Monitor doctor performance and schedules',
      icon: <HospitalIcon />,
      color: '#388e3c'
    },
    {
      title: 'Revenue Reports',
      description: 'Track financial performance and revenue',
      icon: <TrendingUpIcon />,
      color: '#f57c00'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Reports Dashboard
        </Typography>
      </Box>

      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Available Reports
        </Typography>

        <Grid container spacing={3}>
          {reportCards.map((report, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        bgcolor: report.color,
                        color: 'white',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {report.icon}
                    </Box>
                  }
                  title={report.title}
                  subheader={report.description}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Click to view detailed {report.title.toLowerCase()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Reports;