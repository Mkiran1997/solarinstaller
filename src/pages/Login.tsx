import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useAuth } from "../context/AuthContext";
import { SolarIllustration } from "../components/SolarIllustration";
import { Footer } from "../components/Footer";

const FEATURES = [
  {
    icon: <TimelineRoundedIcon fontSize="small" />,
    title: "A pipeline that fits your team",
    body: "Move every lead through New, Contacted and Signed without losing track of where it stands.",
  },
  {
    icon: <LockPersonRoundedIcon fontSize="small" />,
    title: "Your leads, and only yours",
    body: "Access is enforced at the database level, so one account can never see another account’s leads.",
  },
  {
    icon: <GroupsRoundedIcon fontSize="small" />,
    title: "Built for solar sales teams",
    body: "Log contact details, source and notes for every homeowner from first call to signed contract.",
  },
];

export function Login() {
  const { user, signInWithIdentifier } = useAuth();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signInWithIdentifier(identifier, password);
    if (error) setError(error);
    setSubmitting(false);
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Branding panel */}
        <Box
          sx={{
            flexBasis: { md: "48%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            px: { xs: 3, sm: 6, md: 8 },
            py: { xs: 5, md: 0 },
            color: "common.white",
            background:
              "linear-gradient(160deg, #3730a3 0%, #4f46e5 55%, #6366f1 100%)",
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", mb: 3 }}
            >
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fbbf24" }}
              >
                <WbSunnyRoundedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Solar Leads
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 700 }}>
              Turn every inquiry into a signed installation.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
              A simple CRM to track solar leads from first contact to a signed
              deal nothing more, nothing less.
            </Typography>

            <Box sx={{ mb: 4, maxWidth: 340, mx: "auto" }}>
              <SolarIllustration />
            </Box>

            <Stack spacing={2.5}>
              {FEATURES.map((f) => (
                <Stack
                  key={f.title}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "flex-start" }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    {f.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {f.body}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Sign-in panel */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 6,
            bgcolor: "background.default",
          }}
        >
          <Paper variant="outlined" sx={{ width: "100%", maxWidth: 400, p: 4 }}>
            <Stack
              spacing={3}
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <Box>
                <Typography variant="h6">Welcome back</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to manage your leads.
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                fullWidth
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
