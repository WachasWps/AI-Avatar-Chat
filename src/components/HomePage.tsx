// src/components/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow'; // For the Demo button

const HomePage: React.FC = () => {
  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: 'linear-gradient(135deg, #f3f4f6, #e2e8f0)', }}>
      {/* Cards Container */}
      <Box sx={{ display: "flex", gap: 4 }}>
        
        {/* Admin Card */}
        <Box
          sx={{
            width: 500,
            height: 300,
            padding: 3,
            backgroundColor: "black", // Black background for the card
            borderRadius: "12px",
            boxShadow: 3,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Center text vertically
            alignItems: "center", // Center text horizontally
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)", // Hover effect to slightly scale the card
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, color: "#fff" }}>
            Admin
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 3, color: "#fff", fontSize: '1.2rem' }}>
            Upload your knowledge base
          </Typography>
          <Link to="/upload" style={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                backgroundColor: "#6a1b9a",
                '&:hover': { backgroundColor: '#9b59b6' },
                color: "#fff",
                fontSize: "20px",
                borderRadius: "8px", // Border radius for the button
                display: "flex", // To align the icon and text
                justifyContent: "center", // Center the content horizontally
                gap: 2, // Space between the icon and text
              }}
              startIcon={<UploadIcon sx={{ color: "#fff" }} />} // Add the Upload icon to the button
            >
              Upload
            </Button>
          </Link>
        </Box>

        {/* Demo Card */}
        <Box
          sx={{
            width: 500,
            height: 300,
            padding: 3,
            backgroundColor: "black", // Black background for the card
            borderRadius: "12px",
            boxShadow: 3,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Center text vertically
            alignItems: "center", // Center text horizontally
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)", // Hover effect to slightly scale the card
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, color: "#fff" }}>
            Demo
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 3, color: "#fff", fontSize: '1.2rem' }}>
            Try our Avatar
          </Typography>
          <Link to="/qna" style={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                fontSize: "20px",
                backgroundColor: "#6a1b9a",
                '&:hover': { backgroundColor: '#9b59b6' },
                color: "#fff",
                borderRadius: "8px", // Border radius for the button
                display: "flex", // To align the icon and text
                justifyContent: "center", // Center the content horizontally
                gap: 2, // Space between the icon and text
              }}
              startIcon={<PlayArrowIcon sx={{ color: "#fff" }} />} // Add the Play icon to the button
            >
              Demo
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
