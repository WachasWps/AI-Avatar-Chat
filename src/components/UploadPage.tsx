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
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
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
                background: 'linear-gradient(135deg, #f3f4f6, #e2e8f0)',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{
                    backgroundColor: '#ffffff',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '600px',
                }}
            >
                {/* Password Check */}
                {!isAuthenticated ? (
                    <>
                        {/* Heading for the Password Card */}
                        <Typography 
                            variant="h4" 
                            sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}
                        >
                            Admin Access Required
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ marginBottom: '20px', color: '#666' }}
                        >
                            Please enter the admin password to proceed.
                        </Typography>

                        <TextField
                            type="password"
                            variant="outlined"
                            fullWidth
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} // Enter key support
                            sx={{ marginBottom: '20px' }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                padding: '12px 30px',
                                fontSize: '16px',
                                borderRadius: '8px',
                                background: 'linear-gradient(45deg, #7b2ff7, #9c1aff)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                },
                            }}
                            onClick={handlePasswordSubmit}
                        >
                            Submit
                        </Button>
                        {message && (
                            <Alert severity="error" sx={{ marginTop: '20px' }}>
                                {message}
                            </Alert>
                        )}
                    </>
                ) : (
                    <>
                        <Typography variant="h4" sx={{ marginBottom: '20px' }}>
                            Upload Your PDF
                        </Typography>
                        <Typography variant="subtitle1" sx={{ marginBottom: '20px', color: '#555' }}>
                            Drag and drop or select your PDF file below.
                        </Typography>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{
                                backgroundColor: '#f9f9f9',
                                border: '2px dashed #4caf50',
                                borderRadius: '10px',
                                padding: '30px',
                                margin: '30px 0',
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
                                    color: '#333',
                                    cursor: 'pointer',
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
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                },
                            }}
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </Button>
                        {loading && (
                            <Box mt={2}>
                                <CircularProgress />
                            </Box>
                        )}
                        {message && (
                            <Alert
                                severity={message.includes('successful') ? 'success' : 'error'}
                                sx={{ marginTop: '20px' }}
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
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #9c1aff, #7b2ff7)',
                                    },
                                }}
                                onClick={goToQnaPage}
                            >
                                Go to Q&A
                            </Button>
                        )}
                    </>
                )}
            </motion.div>
        </Box>
    );
};

export default UploadPage;
