import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { AddLeadDialog } from "../components/AddLeadDialog";
import { LeadsTable } from "../components/LeadsTable";
import { Footer } from "../components/Footer";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  type Lead,
  type LeadStage,
  type NewLeadInput,
} from "../types/lead";

type StageFilter = "all" | LeadStage;

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<StageFilter>("all");

  async function loadLeads() {
    setLoading(true);
    // No `.eq('user_id', ...)` here on purpose: Row Level Security on the
    // `leads` table (see supabase/schema.sql) already restricts every query
    // to the signed-in user's own rows, even if this filter were removed or
    // tampered with.
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Log the real (potentially technical/internal) error for debugging,
      // but never show raw database error text in the UI.
      console.error("Failed to load leads:", error);
      setError("Could not load your leads. Please refresh and try again.");
    } else {
      setLeads((data as Lead[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddLead(input: NewLeadInput) {
    // `user_id` is intentionally omitted: the column defaults to auth.uid()
    // in the database, and the insert RLS policy would reject any other
    // value anyway, so the client can't set it even by trying.
    const { error } = await supabase.from("leads").insert(input);
    if (error) {
      console.error("Failed to add lead:", error);
      throw error;
    }
    await loadLeads();
    setIsAddOpen(false);
  }

  async function handleStageChange(lead: Lead, stage: LeadStage) {
    const previous = leads;
    setLeads((cur) => cur.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
    const { error } = await supabase
      .from("leads")
      .update({ stage })
      .eq("id", lead.id);
    if (error) {
      console.error("Failed to update lead stage:", error);
      setLeads(previous);
      setError("Could not update that lead. Please try again.");
    }
  }

  const counts = useMemo(() => {
    const base: Record<StageFilter, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      signed: 0,
    };
    for (const lead of leads) base[lead.stage]++;
    return base;
  }, [leads]);

  const visibleLeads =
    filter === "all" ? leads : leads.filter((l) => l.stage === filter);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Avatar
              sx={{ bgcolor: "primary.main", width: 34, height: 34, mr: 1.5 }}
            >
              <WbSunnyRoundedIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Solar Leads
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {user?.email}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Box>
              <Typography variant="h5">Your leads</Typography>
              <Typography variant="body2" color="text.secondary">
                Track every lead from first contact through to a signed deal.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsAddOpen(true)}
            >
              Add lead
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ px: 1 }}>
            <Tabs
              value={filter}
              onChange={(_, v) => setFilter(v)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab value="all" label={`All (${counts.all})`} />
              {LEAD_STAGES.map((stage) => (
                <Tab
                  key={stage}
                  value={stage}
                  label={`${LEAD_STAGE_LABELS[stage]} (${counts[stage]})`}
                />
              ))}
            </Tabs>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
              <CircularProgress size={28} />
            </Paper>
          ) : leads.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 6, textAlign: "center", borderStyle: "dashed" }}
            >
              <Typography color="text.primary">No leads yet.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add your first lead to start tracking it through your pipeline.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setIsAddOpen(true)}
              >
                Add lead
              </Button>
            </Paper>
          ) : visibleLeads.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 6, textAlign: "center", borderStyle: "dashed" }}
            >
              <Typography color="text.secondary">
                No leads in this stage.
              </Typography>
            </Paper>
          ) : (
            <LeadsTable
              leads={visibleLeads}
              onStageChange={handleStageChange}
            />
          )}
        </Stack>
      </Container>

      <Footer />

      <AddLeadDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddLead}
      />
    </Box>
  );
}
