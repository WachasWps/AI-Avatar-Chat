import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    CircularProgress, 
    Box, 
    Typography, 
    Button, 
    Alert, 
    TextField 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string>(''); // Password state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Auth state
    const navigate = useNavigate();

    // Hardcoded admin password (replace with a more secure solution in production)
    const adminPassword = "admin123"; // Change this to your desired password

    // Handle password submission
    const handlePasswordSubmit = () => {
        if (password === adminPassword) {
            setIsAuthenticated(true);
            setMessage('');
        } else {
            setMessage('Incorrect password. Please try again.');
        }
    };

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('https://bw-avatar.onrender.com/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage(`Upload successful! Document ID: ${response.data.uuid}`);
        } catch (error) {
            setMessage('An error occurred while uploading. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Navigate to Q&A Page
    const goToQnaPage = () => {
        navigate('/qna');
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top left, #7b2ff7, #2a2a72, #1c1c1c)',
                overflow: 'hidden',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                style={{
                    background: 'linear-gradient(145deg, #1e1e2f, #29293e)',
                    padding: '50px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '600px',
                }}
            >
                {!isAuthenticated ? (
                    <>
                        <Typography 
                            variant="h4" 
                            sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#fff' }}
                        >
                            Welcome Back, Admin
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ marginBottom: '20px', color: '#aaa' }}
                        >
                            Enter your password to unlock dynamic possibilities.
                        </Typography>

                        <TextField
                            type="password"
                            variant="outlined"
                            fullWidth
                            placeholder="Enter Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            sx={{ marginBottom: '20px', 
                                input: { color: '#fff' }, 
                                '& .MuiOutlinedInput-root': { borderColor: '#7b2ff7' }
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                padding: '12px 30px',
                                fontSize: '16px',
                                borderRadius: '8px',
                                background: 'linear-gradient(45deg, #7b2ff7, #9c1aff)',
                                color: '#fff',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                },
                            }}
                            onClick={handlePasswordSubmit}
                        >
                            Unlock
                        </Button>
                        {message && (
                            <Alert severity="error" sx={{ marginTop: '20px', backgroundColor: '#d32f2f', color: '#fff' }}>
                                {message}
                            </Alert>
                        )}
                    </>
                ) : (
                    <>
                        <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#fff' }}>
                            Upload Your File
                        </Typography>
                        <Typography variant="subtitle1" sx={{ marginBottom: '20px', color: '#ccc' }}>
                            Drag and drop or select a file to proceed.
                        </Typography>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{
                                background: 'linear-gradient(145deg, #2a2a72, #1c1c1c)',
                                border: '2px dashed #7b2ff7',
                                borderRadius: '10px',
                                padding: '40px',
                                margin: '20px 0',
                                color: '#fff',
                            }}
                        >
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    border: 'none',
                                }}
                            />
                        </motion.div>
                        <Button
                            variant="contained"
                            sx={{
                                marginTop: '20px',
                                padding: '12px 30px',
                                fontSize: '16px',
                                borderRadius: '8px',
                                background: 'linear-gradient(45deg, #7b2ff7, #9c1aff)',
                                color: '#fff',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                },
                            }}
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload File'}
                        </Button>
                        {loading && (
                            <Box mt={2}>
                                <CircularProgress sx={{ color: '#7b2ff7' }} />
                            </Box>
                        )}
                        {message && (
                            <Alert
                                severity={message.includes('successful') ? 'success' : 'error'}
                                sx={{
                                    marginTop: '20px',
                                    backgroundColor: message.includes('successful') ? '#388e3c' : '#d32f2f',
                                    color: '#fff',
                                }}
                            >
                                {message}
                            </Alert>
                        )}
                        {message.includes('successful') && (
                            <Button
                                variant="contained"
                                sx={{
                                    marginTop: '20px',
                                    padding: '12px 30px',
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(45deg, #7b2ff7, #9c1aff)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                    },
                                }}
                                onClick={goToQnaPage}
                            >
                                Proceed to Q&A
                            </Button>
                        )}
                    </>
                )}
            </motion.div>
        </Box>
    );
};

export default UploadPage;
