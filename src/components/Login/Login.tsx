import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Checkbox, 
  Container, 
  FormControlLabel, 
  TextField, 
  Typography,
  Paper,
  Link as MuiLink,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  background: '#f5f5f5',
});

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none', // Hide on mobile
  },
}));

const RightPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
});

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    boxShadow: 'none',
  },
}));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/add-new';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <Box position="relative" zIndex={1}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome Back!
          </Typography>
          <Typography variant="body1">
            Please login to your account to continue and explore our platform.
          </Typography>
        </Box>
      </LeftPanel>
      
      <RightPanel>
        <FormContainer elevation={3}>
          <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
            Sign In
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <MuiLink href="#" variant="body2">
                Forgot Password?
              </MuiLink>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ py: 1.5, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <MuiLink href="#" variant="body2" onClick={() => navigate('/signup')}>
                  Sign Up
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </FormContainer>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login;
