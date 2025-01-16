import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow'; // For the Demo button

const HomePage: React.FC = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: 'radial-gradient(circle at top, #6a1b9a, #120136, #000)',
        overflow: 'hidden',
      }}
    >
      {/* Heading */}
      <Typography
        variant="h2"
        sx={{
          color: "#ffffff",
          fontWeight: "bold",
          marginBottom: 4,
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)",
          letterSpacing: "1.5px",
        }}
      >
        Talk Smarter, Not Harder
      </Typography>

      {/* Cards Container */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 4,
        }}
      >
        {/* Admin Card */}
        <Box
          sx={{
            width: 500,
            height: 300,
            padding: 3,
            background: "linear-gradient(145deg, #240046, #3c096c)",
            borderRadius: "20px",
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Center text vertically
            alignItems: "center", // Center text horizontally
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              color: "#f3f4f6",
              letterSpacing: "1px",
            }}
          >
            Admin
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 3,
              color: "#e0e0e0",
              fontSize: "1.2rem",
              letterSpacing: "0.5px",
            }}
          >
            Upload your knowledge base
          </Typography>
          <Link to="/upload" style={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                background: "linear-gradient(45deg, #9d4edd, #7b2ff7)",
                '&:hover': { background: 'linear-gradient(45deg, #7b2ff7, #9d4edd)' },
                color: "#fff",
                fontSize: "20px",
                borderRadius: "10px", // Border radius for the button
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
            background: "linear-gradient(145deg, #120136, #240046)",
            borderRadius: "20px",
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Center text vertically
            alignItems: "center", // Center text horizontally
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              color: "#f3f4f6",
              letterSpacing: "1px",
            }}
          >
            Demo
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 3,
              color: "#e0e0e0",
              fontSize: "1.2rem",
              letterSpacing: "0.5px",
            }}
          >
            Try our Avatar
          </Typography>
          <Link to="/qna" style={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                fontSize: "20px",
                background: "linear-gradient(45deg, #9d4edd, #7b2ff7)",
                '&:hover': { background: 'linear-gradient(45deg, #7b2ff7, #9d4edd)' },
                color: "#fff",
                borderRadius: "10px", // Border radius for the button
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