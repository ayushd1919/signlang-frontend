// src/pages/ISLStatic.tsx
import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import CircleIcon from "@mui/icons-material/Circle";
import SpeedIcon from "@mui/icons-material/Speed";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { API_BASE } from "../config";

type Domain = "Alphabet" | "Numeral";

const CAPTURE_MS = 900; // throttle capture frequency
const JPEG_QUALITY = 0.8;

export default function ISLStatic() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [live, setLive] = React.useState(false);
  const [fps, setFps] = React.useState(0);
  const [label, setLabel] = React.useState("");
  const [accuracy] = React.useState(98.5); // static display metric (your UI)
  const [procLoad, setProcLoad] = React.useState(75);
  const [mem, setMem] = React.useState(60);
  const [domain, setDomain] = React.useState<Domain>("Alphabet");
  const [errorText, setErrorText] = React.useState<string>("");

  // AbortController for in-flight request cancellation
  const requestAbortRef = React.useRef<AbortController | null>(null);
  // Interval refs for cleanup
  const captureIntervalRef = React.useRef<number | null>(null);
  const perfIntervalRef = React.useRef<number | null>(null);
  const fpsRafRef = React.useRef<number | null>(null);

  // Camera controls
  const startCamera = React.useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setErrorText("");
    } catch (err: any) {
      setErrorText(
        err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access."
          : "Unable to access camera."
      );
      throw err;
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
  }, []);

  // Live session toggle
  const startSession = async () => {
    setLabel("");
    setFps(0);
    try {
      await startCamera();
      setLive(true);
    } catch {
      // errorText already set in startCamera
    }
  };
  const endSession = () => {
    // cancel any in-flight request
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;

    // clear timers
    if (captureIntervalRef.current) {
      window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (perfIntervalRef.current) {
      window.clearInterval(perfIntervalRef.current);
      perfIntervalRef.current = null;
    }
    if (fpsRafRef.current) {
      cancelAnimationFrame(fpsRafRef.current);
      fpsRafRef.current = null;
    }

    stopCamera();
    setLive(false);
  };

  // FPS meter
  React.useEffect(() => {
    if (!live) return;
    let frames = 0;
    let last = performance.now();

    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      fpsRafRef.current = requestAnimationFrame(tick);
    };
    fpsRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (fpsRafRef.current) cancelAnimationFrame(fpsRafRef.current);
      fpsRafRef.current = null;
    };
  }, [live]);

  // Fake perf movement (visual only)
  React.useEffect(() => {
    if (!live) return;
    perfIntervalRef.current = window.setInterval(() => {
      setProcLoad((v) => Math.max(0, Math.min(100, v + (Math.random() * 10 - 5))));
      setMem((v) => Math.max(0, Math.min(100, v + (Math.random() * 6 - 3))));
    }, 1200);

    return () => {
      if (perfIntervalRef.current) window.clearInterval(perfIntervalRef.current);
      perfIntervalRef.current = null;
    };
  }, [live]);

  // Periodic capture + predict
  React.useEffect(() => {
    if (!live) return;

    const doCapture = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      // cancel any previous in-flight request before starting a new one
      requestAbortRef.current?.abort();
      const controller = new AbortController();
      requestAbortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/isl/static/predict-frame`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_b64: dataUrl, domain }),
          signal: controller.signal,
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLabel(json?.detail ?? "No hand / multiple hands");
        } else {
          setLabel(json?.label ?? "");
        }
        setErrorText("");
      } catch (err: any) {
        if (err?.name === "AbortError") return; // expected when we cancel
        setErrorText("API error");
      }
    };

    // first immediate capture (snappier UX), then interval
    doCapture();
    captureIntervalRef.current = window.setInterval(doCapture, CAPTURE_MS);

    return () => {
      if (captureIntervalRef.current) window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      requestAbortRef.current?.abort();
      requestAbortRef.current = null;
    };
  }, [live, domain]);

  // Pause/resume when tab hidden/visible (saves CPU & bandwidth)
  React.useEffect(() => {
    const onVis = () => {
      if (document.hidden && live) {
        endSession();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  // Cleanup on unmount
  React.useEffect(() => endSession, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 8 },
        background: `
          radial-gradient(60% 60% at 50% -10%, rgba(165,180,252,0.25), transparent 60%),
          radial-gradient(50% 50% at -10% 40%, rgba(192,132,252,0.25), transparent 60%),
          radial-gradient(40% 40% at 110% 70%, rgba(147,197,253,0.25), transparent 60%)
        `,
      }}
    >
      <Container maxWidth="lg">
        {/* Top row: back + title + live chip + domain toggle */}
        <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md="auto">
            <Button
              variant="contained"
              startIcon={<ArrowBackIosNewIcon />}
              href="/isl"
              sx={{
                px: 2.2,
                borderRadius: 3,
                color: "text.primary",
                background: "linear-gradient(135deg,#eef2ff,#f5f3ff)",
                boxShadow: "0 6px 20px rgba(0,0,0,.06)",
              }}
            >
              Back
            </Button>
          </Grid>

          <Grid item xs>
            <Typography
              component="h1"
              sx={{
                textAlign: { xs: "center", md: "center" },
                fontWeight: 900,
                fontSize: { xs: 30, sm: 40, md: 48 },
                background: "linear-gradient(to bottom, #6EA8FF, #8BB7FF, #B6C9FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 1px 0 rgba(0,0,0,0.06)",
              }}
            >
              ISL - Static Gesture Recognition
            </Typography>
          </Grid>

          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<AutoAwesomeIcon />}
                label={live ? "Live Session" : "Idle"}
                color={live ? "primary" : "default"}
                variant={live ? "filled" : "outlined"}
                sx={{ fontWeight: 600, borderRadius: 3, backdropFilter: "blur(6px)" }}
              />
              {/* Domain toggle */}
              <ToggleButtonGroup
                size="small"
                exclusive
                value={domain}
                onChange={(_, val: Domain | null) => {
                  if (val) setDomain(val);
                }}
                sx={{
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.6)",
                  "& .MuiToggleButton-root": {
                    border: "none",
                    px: 1.5,
                    "&.Mui-selected": { color: "white", bgcolor: "primary.main" },
                  },
                }}
              >
                <ToggleButton value="Alphabet">Alphabet</ToggleButton>
                <ToggleButton value="Numeral">Numeral</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* LEFT: Output */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={8}
              sx={{
                p: 3,
                borderRadius: 4,
                background: "linear-gradient(180deg,#e5e7eb55,#ffffff77)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Stack spacing={1.2} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <AutoAwesomeIcon fontSize="small" color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                    Neural Network Output
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Real-time sign language recognition with advanced AI processing
                </Typography>

                {/* Frame container */}
                <Box
                  sx={{
                    mt: 2,
                    width: "100%",
                    borderRadius: 4,
                    p: 2.2,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.08))",
                    boxShadow:
                      "0 20px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      height: { xs: 340, sm: 420 },
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #0ea5e9, #1e3a8a 60%)",
                      boxShadow:
                        "inset 0 2px 30px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Chips */}
                    <Chip
                      label={live ? "Processing" : "Paused"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        borderRadius: 3,
                        fontWeight: 700,
                        color: "#6ef3ff",
                        background: "linear-gradient(135deg, #6d28d9, #2563eb)",
                        boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                      }}
                    />

                    <Chip
                      icon={<SpeedIcon />}
                      label={`${fps} FPS`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        borderRadius: 3,
                        color: "white",
                        background: "linear-gradient(135deg, #111827, #1f2937)",
                        boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                      }}
                    />

                    {/* Video + hidden canvas */}
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: live ? 0.88 : 0.45,
                      }}
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Prediction overlay */}
                    <Typography
                      variant="h5"
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: 16,
                        color: "#fff",
                        fontWeight: 800,
                        textShadow: "0 2px 10px rgba(0,0,0,.5)",
                      }}
                    >
                      {label ? `Prediction: ${label}` : ""}
                    </Typography>

                    {/* Domain overlay */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 16,
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: 700,
                      }}
                    >
                      {domain}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 3, width: "100%" }}
                >
                  <Button
                    variant="contained"
                    disabled
                    fullWidth
                    sx={{
                      maxWidth: 260,
                      py: 1.6,
                      borderRadius: 6,
                      color: "#9aa4b2",
                      background: "linear-gradient(135deg,#eef2ff,#f5f3ff)",
                      boxShadow: "0 10px 25px rgba(0,0,0,.08)",
                    }}
                  >
                    Refresh Model
                  </Button>

                  {live ? (
                    <Button
                      variant="contained"
                      onClick={endSession}
                      fullWidth
                      sx={{
                        maxWidth: 260,
                        py: 1.6,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                        boxShadow: "0 14px 30px rgba(56,189,248,.35)",
                        fontWeight: 700,
                      }}
                    >
                      End Session
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={startSession}
                      fullWidth
                      sx={{
                        maxWidth: 260,
                        py: 1.6,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #22c55e, #10b981)",
                        boxShadow: "0 14px 30px rgba(16,185,129,.35)",
                        fontWeight: 700,
                      }}
                    >
                      Start Session
                    </Button>
                  )}
                </Stack>

                {errorText && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1.5, textAlign: "center", fontWeight: 600 }}
                  >
                    {errorText}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT: Status & Performance */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* System Status */}
              <Paper
                elevation={6}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  background: "linear-gradient(180deg,#e5e7eb55,#ffffff88)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <BoltIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={800}>
                    System Status
                  </Typography>
                </Stack>

                <CardRow
                  label="Neural Network"
                  right={
                    <Chip
                      size="small"
                      icon={<CircleIcon sx={{ color: live ? "#22c55e" : "#9ca3af" }} />}
                      label={live ? "Active" : "Idle"}
                      sx={{ borderRadius: 3 }}
                    />
                  }
                />

                <CardRow
                  label="Processing Speed"
                  right={
                    <Chip
                      size="small"
                      label={live ? "Real-time" : "Stopped"}
                      color={live ? "primary" : "default"}
                      sx={{ borderRadius: 3 }}
                    />
                  }
                />

                <CardRow
                  label="Accuracy"
                  right={
                    <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>
                      {accuracy.toFixed(1)}%
                    </Typography>
                  }
                />
              </Paper>

              {/* Performance */}
              <Paper
                elevation={6}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  background: "linear-gradient(180deg,#e5e7eb55,#ffffff88)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <TaskAltIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Performance
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Processing Load
                </Typography>
                <GradientLinear value={procLoad} />
                <Typography variant="caption" color="text.secondary" sx={{ float: "right", mt: 0.5 }}>
                  {Math.round(procLoad)}%
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Memory Usage
                </Typography>
                <GradientLinear value={mem} />
                <Typography variant="caption" color="text.secondary" sx={{ float: "right", mt: 0.5 }}>
                  {Math.round(mem)}%
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/* Helpers */
function CardRow({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <Box
      sx={{
        mt: 1.2,
        mb: 1,
        px: 1.5,
        py: 1.2,
        borderRadius: 2.5,
        background: "rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      {right}
    </Box>
  );
}

function GradientLinear({ value }: { value: number }) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, value))}
      sx={{
        height: 10,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.08)",
        "& .MuiLinearProgress-bar": {
          borderRadius: 999,
          background: "linear-gradient(90deg, #6366f1, #38bdf8)",
        },
      }}
    />
  );
}
