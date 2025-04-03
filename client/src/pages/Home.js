import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Card, CardContent, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <DescriptionIcon fontSize="large" color="primary" />,
      title: t('requestDocuments'),
      description: t('requestDocumentsDescription'),
    },
    {
      icon: <AssignmentIcon fontSize="large" color="primary" />,
      title: t('trackStatus'),
      description: t('trackStatusDescription'),
    },
    {
      icon: <LocalShippingIcon fontSize="large" color="primary" />,
      title: t('multipleDelivery'),
      description: t('multipleDeliveryDescription'),
    },
    {
      icon: <SchoolIcon fontSize="large" color="primary" />,
      title: t('studentFriendly'),
      description: t('studentFriendlyDescription'),
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          borderRadius: '0 0 20px 20px',
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            {t('welcome')}
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            {t('welcomeDescription')}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {isAuthenticated ? (
              <Button
                component={Link}
                to="/new-request"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mr: 2 }}
              >
                {t('newRequest')}
              </Button>
            ) : (
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mr: 2 }}
              >
                {t('getStarted')}
              </Button>
            )}
            <Button
              component={Link}
              to="/about"
              variant="outlined"
              color="inherit"
              size="large"
            >
              {t('learnMore')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          {t('features')}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              {t('readyToStart')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('readyToStartDescription')}
            </Typography>
            <Button
              component={Link}
              to={isAuthenticated ? '/new-request' : '/register'}
              variant="contained"
              color="secondary"
              size="large"
            >
              {isAuthenticated ? t('newRequest') : t('register')}
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          {t('frequentlyAskedQuestions')}
        </Typography>
        <Box sx={{ mt: 4 }}>
          {/* FAQ items would go here */}
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('faqQuestion1')}
            </Typography>
            <Typography variant="body1">
              {t('faqAnswer1')}
            </Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('faqQuestion2')}
            </Typography>
            <Typography variant="body1">
              {t('faqAnswer2')}
            </Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('faqQuestion3')}
            </Typography>
            <Typography variant="body1">
              {t('faqAnswer3')}
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;