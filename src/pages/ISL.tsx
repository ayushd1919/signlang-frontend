import * as React from "react";
import {
  Box, Button, Chip, Container, Grid, Paper, Stack, Typography, LinearProgress
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import BoltIcon from "@mui/icons-material/Bolt";

export default function ISL() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 8 },
        background: `
          radial-gradient(60% 60% at 50% -10%, rgba(165,180,252,0.25), transparent 60%),
          radial-gradient(50% 50% at -10% 40%, rgba(192,132,252,0.25), transparent 60%),
          radial-gradient(40% 40% at 110% 70%, rgba(147,197,253,0.25), transparent 60%)
        `
      }}
    >
      <Container maxWidth="lg">
        {/* Top back button */}
        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIosNewIcon />}
            href="/"
            sx={{
              px: 2.2,
              borderRadius: 3,
              color: "text.primary",
              background: "linear-gradient(135deg,#eef2ff,#f5f3ff)",
              boxShadow: "0 6px 20px rgba(0,0,0,.06)"
            }}
          >
            Back to Home
          </Button>
        </Stack>

        {/* Title + subtitle */}
        <Stack alignItems="center" spacing={1.2} sx={{ mb: 4 }}>
          <Typography
            component="h1"
            sx={{
              textAlign: "center",
              fontWeight: 900,
              lineHeight: 1.05,
              fontSize: { xs: 38, sm: 56, md: 68 },
              background: "linear-gradient(to bottom, #6EA8FF, #8BB7FF, #B6C9FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 0 rgba(0,0,0,0.06)"
            }}
          >
            Indian <span style={{ textDecoration: "underline", textDecorationColor: "#8BB7FF" }}>Sign</span> Language
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ maxWidth: 880 }}>
            Choose your recognition method to begin advanced gesture analysis
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <BoltIcon fontSize="small" />
            <Typography variant="body2">AI-Powered Recognition Technology</Typography>
          </Stack>
        </Stack>

        {/* Two cards */}
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <ModeCard
              icon={<ImageIcon sx={{ fontSize: 30 }} />}
              title="Static Gestures"
              desc="Advanced recognition of individual hand positions and static signs with high precision computer vision algorithms"
              badge="Instant Recognition"
              statLabel="Accuracy Rate"
              statValue="98.5%"
              buttonText="Start Static Recognition"
              href="/isl/static"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ModeCard
              icon={<VideocamIcon sx={{ fontSize: 30 }} />}
              title="Dynamic Gestures"
              desc="Real-time recognition of continuous movement patterns and dynamic signs with temporal analysis"
              badge="Live Processing"
              statLabel="Processing Speed"
              statValue="30 FPS"
              buttonText="Start Dynamic Recognition"
              href="/isl/dynamic"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  badge,
  statLabel,
  statValue,
  href,
  buttonText
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge: string;
  statLabel: string;
  statValue: string;
  href: string;
  buttonText: string;
}) {
  const isStatic = title.toLowerCase().includes("static");

  return (
    <Paper
      elevation={10}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        background: "linear-gradient(180deg,#e5e7eb66,#ffffff99)",
        backdropFilter: "blur(6px)",
        position: "relative",
        overflow: "hidden",
        "&:hover": { boxShadow: 12, transform: "translateY(-2px)" },
        transition: "all .2s ease"
      }}
    >
      {/* floating accent dot */}
      <Box
        sx={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#7dd3fc,#a78bfa)",
          filter: "blur(.5px)"
        }}
      />

      <Stack spacing={2}>
        {/* Icon badge */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            background: "linear-gradient(135deg,#e0e7ff,#dbeafe)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,.7)"
          }}
        >
          {icon}
        </Box>

        <Typography variant="h5" fontWeight={900} color="text.primary">
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
          {desc}
        </Typography>

        {/* small badge */}
        <Chip
          label={badge}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start", borderRadius: 2, fontWeight: 700 }}
        />

        {/* stat bar */}
        <Typography variant="caption" color="text.secondary">
          {statLabel}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={isStatic ? 98.5 : 100}
          sx={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: "linear-gradient(90deg, #6366f1, #38bdf8)"
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
          {statValue}
        </Typography>

        <Box sx={{ pt: 1 }}>
          <Button
            variant="contained"
            href={href}
            size="large"
            sx={{
              borderRadius: 4,
              px: 3,
              py: 1.4,
              fontWeight: 700,
              background: "linear-gradient(135deg,#6366f1,#38bdf8)",
              boxShadow: "0 14px 30px rgba(56,189,248,.35)"
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
