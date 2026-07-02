import { Box, Typography } from '@mui/material';

const STRIPS = 5;
const STRIP_W = 18; // px — 2 × 9 px squares per strip column
const FLAG_H = 54; // px — 3 tile heights (6 rows of 9 px squares)
const POLE_X = 10;
const POLE_W = 5;
const FLAG_TOP = 18;
const TOTAL_W_PADDING = 4; // right-side padding added to totalW
const FLAG_TAIL_H = 55; // extra height below flag for shadow room
const STRIP_WAVE_DELAY = 0.09; // animation delay increment per strip (seconds)
const FLAG_STRIP_EXTRA_H = 20; // extra strip height so wave never reveals a gap
const CONNECTOR_OFFSET = 2; // connector knob inset/outset from pole edges

function FlagStrips() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: POLE_X + POLE_W,
        top: FLAG_TOP,
        display: 'flex',
        height: FLAG_H,
        overflow: 'hidden',
        borderRadius: '0 5px 5px 0',
        boxShadow: '6px 8px 24px rgba(0,0,0,0.7)',
      }}
    >
      {Array.from({ length: STRIPS }, (_, i) => (
        <Box
          key={i}
          style={{ animationDelay: `${i * STRIP_WAVE_DELAY}s` }}
          sx={{
            width: STRIP_W,
            height: FLAG_H + FLAG_STRIP_EXTRA_H,
            marginTop: '-10px',
            flexShrink: 0,
            background: `repeating-conic-gradient(
                  #0a1628 0% 25%,
                  #f0f4f8 0% 50%
              ) ${-i * STRIP_W}px 0 / 18px 18px`,
            animation: 'flag-strip-wave 1.1s ease-in-out infinite',
          }}
        />
      ))}
    </Box>
  );
}

function CheckeredFlag({ totalW }: { totalW: number }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: totalW,
        height: FLAG_TOP + FLAG_H + FLAG_TAIL_H,
        mb: 5,
      }}
    >
      {/* Pole */}
      <Box
        sx={{
          position: 'absolute',
          left: POLE_X,
          top: 0,
          bottom: 0,
          width: POLE_W,
          borderRadius: '3px 3px 1px 1px',
          background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 55%, #475569 85%, #334155 100%)',
          zIndex: 1,
        }}
      />

      <FlagStrips />

      {/* Connector knob where flag meets pole */}
      <Box
        sx={{
          position: 'absolute',
          left: POLE_X - CONNECTOR_OFFSET,
          top: FLAG_TOP - CONNECTOR_OFFSET,
          width: POLE_W + CONNECTOR_OFFSET,
          height: 8,
          borderRadius: '3px',
          background: '#cbd5e1',
          zIndex: 2,
        }}
      />
    </Box>
  );
}

export function LoadingScreen() {
  const totalW = POLE_X + POLE_W + STRIPS * STRIP_W + TOTAL_W_PADDING;
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #060e1e 0%, #0f172a 50%, #1e293b 100%)',
        zIndex: 9999,
        userSelect: 'none',
        animation: 'loading-screen-in 0.3s ease-out',
      }}
    >
      <CheckeredFlag totalW={totalW} />
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: '1rem',
          letterSpacing: '0.55em',
          color: '#f8fafc',
          animation: 'loading-text-blink 1.1s ease-in-out infinite',
        }}
      >
        LOADING...
      </Typography>
    </Box>
  );
}
