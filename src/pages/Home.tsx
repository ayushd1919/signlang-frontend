import * as React from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import FeatureCard from "../components/FeatureCard";
import LanguageIcon from "@mui/icons-material/Language";
import BackHandIcon from "@mui/icons-material/BackHand";
import BoltIcon from "@mui/icons-material/Bolt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(60% 60% at 50% -10%, rgba(165,180,252,0.2), transparent 60%),
          radial-gradient(50% 50% at -10% 40%, rgba(192,132,252,0.2), transparent 60%),
          radial-gradient(40% 40% at 110% 70%, rgba(147,197,253,0.2), transparent 60%)
        `
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 14 }, pb: 12 }}>
        <Stack alignItems="center" spacing={2}>
          <Typography
            component="h1"
            sx={{
              textAlign: "center",
              fontWeight: 900,
              lineHeight: 1.05,
              fontSize: { xs: 44, sm: 64, md: 80 },
              background: "linear-gradient(to bottom, #6EA8FF, #8BB7FF, #B6C9FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 0 rgba(0,0,0,0.06)"
            }}
          >
            Sign Language
          </Typography>

          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ maxWidth: 880 }}>
            Revolutionary AI-powered recognition system with cutting-edge neural networks for
            real-time sign language interpretation
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" color="text.secondary">
            <BoltIcon fontSize="small" />
            <Typography variant="body2">Powered by Advanced Machine Learning</Typography>
            <AutoAwesomeIcon fontSize="small" />
          </Stack>
        </Stack>

        <Grid container spacing={3} mt={6}>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="Indian Sign Language"
              description="Recognize ISL gestures with state-of-the-art neural networks and advanced computer vision algorithms"
              href="/isl"
              cta="Get Started with ISL"
              icon={<BackHandIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard
              title="American Sign Language"
              description="Real-time ASL recognition and interpretation with industry-leading accuracy and performance"
              href="/asl"
              cta="Get Started with ASL"
              icon={<LanguageIcon fontSize="large" />}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
