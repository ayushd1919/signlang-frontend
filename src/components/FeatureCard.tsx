import * as React from "react";
import { Card, CardContent, Stack, Typography, Button, Box } from "@mui/material";

type Props = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  cta: string;
};

export default function FeatureCard({ title, description, href, icon, cta }: Props) {
  return (
    <Card
      elevation={6}
      sx={{
        p: 2,
        backdropFilter: "blur(6px)",
        background: "rgba(255,255,255,0.7)",
        position: "relative",
        overflow: "hidden",
        "&:hover": { boxShadow: 10, transform: "translateY(-2px)" },
        transition: "all .2s ease"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(125,211,252,.9), rgba(167,139,250,.9))",
          filter: "blur(0.5px)",
          pointerEvents: "none"
        }}
      />
      <CardContent>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              background:
                "linear-gradient(135deg, rgba(224,231,255,1), rgba(219,234,254,1))"
            }}
          >
            {icon}
          </Box>

          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            {description}
          </Typography>

          <Button
            href={href}
            variant="contained"
            size="large"
            sx={{
              px: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(56,189,248,1))"
            }}
          >
            {cta}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
