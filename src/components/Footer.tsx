import { Box, Typography } from "@mui/material";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2.5,
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Built by Kiran Mistary 14-09-2026
      </Typography>
    </Box>
  );
}
