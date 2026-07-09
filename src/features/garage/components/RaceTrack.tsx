import type { RefObject } from 'react';
import { Box, Typography } from '@mui/material';
import './RaceTrack.css';
import { CarIcon } from '../../../shared/components/CarIcon';
import type { Car } from '../../../shared/types/car';
import { CAR_W, CE_PATHS, LANE_DASH_OFFSET, START_LINE_W } from '../../../shared/constants';

export type DivRef = RefObject<HTMLDivElement | null>;

export interface RaceTrackProps {
  trackRef: DivRef;
  carRef: DivRef;
  car: Car;
  isBroken: boolean;
  isWinner: boolean;
}

function CheckEngineIcon() {
  return (
    <svg
      viewBox="0 0 90 62"
      width={36}
      height={25}
      fill="none"
      style={{ display: 'block' }}
      aria-label="Check engine"
    >
      <g stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        {CE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

function StartLine() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: CAR_W,
        top: START_LINE_W,
        bottom: 0,
        width: START_LINE_W,
        background:
          'repeating-linear-gradient(0deg,' +
          'rgba(255,255,255,0.6) 0px,rgba(255,255,255,0.6) 5px,' +
          'rgba(150,160,180,0.07) 5px,rgba(150,160,180,0.07) 10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        component="span"
        sx={{
          display: 'block',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          fontSize: '0.38rem',
          fontWeight: 900,
          letterSpacing: '0.14em',
          color: '#f97316 !important',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        START
      </Typography>
    </Box>
  );
}

function TopCurb() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: START_LINE_W,
        left: CAR_W + START_LINE_W,
        right: 94,
        height: '2px',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
      }}
    />
  );
}

function LaneDashes() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 37,
        left: CAR_W + LANE_DASH_OFFSET,
        right: 96,
        height: '2px',
        backgroundImage:
          'repeating-linear-gradient(90deg,' +
          'rgba(255,215,50,0.65) 0px,rgba(255,215,50,0.65) 18px,' +
          'transparent 18px,transparent 40px)',
        backgroundSize: '40px 2px',
      }}
    />
  );
}

function BottomCurb() {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 2,
        left: CAR_W + START_LINE_W,
        right: 94,
        height: '1.5px',
        background: 'rgba(255,255,255,0.07)',
      }}
    />
  );
}

function TrackCurbs() {
  return (
    <>
      <TopCurb />
      <LaneDashes />
      <BottomCurb />
    </>
  );
}

function FinishLine({ isWinner }: { isWinner: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: 72,
        top: 0,
        bottom: 0,
        width: 22,
        background:
          'repeating-conic-gradient(' +
          'rgba(8,8,8,0.93) 0% 25%,' +
          'rgba(232,232,232,0.93) 0% 50%' +
          ') 0 0 / 11px 11px',
        animation: isWinner ? 'finish-glow 0.75s ease-in-out infinite' : undefined,
      }}
    />
  );
}

function RaceTrackLanes({ isWinner }: { isWinner: boolean }) {
  return (
    <>
      <StartLine />
      <TrackCurbs />
      <FinishLine isWinner={isWinner} />
    </>
  );
}

function CarNameLabel({ name, color }: { name: string; color: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        position: 'absolute',
        top: 1,
        left: 4,
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: '0.03em',
        opacity: 0.95,
        color: `${color} !important`,
        textShadow: '0 0 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.95)',
      }}
    >
      {name}
    </Typography>
  );
}

function CarMarker({ carRef, car, isBroken }: { carRef: DivRef; car: Car; isBroken: boolean }) {
  return (
    <Box
      ref={carRef}
      sx={{
        position: 'absolute',
        bottom: 2,
        left: 0,
        display: 'flex',
        alignItems: 'flex-end',
        willChange: 'transform',
      }}
    >
      <CarIcon color={car.color} size={CAR_W} />
      {isBroken && (
        <Box
          sx={{
            alignSelf: 'center',
            ml: '4px',
            animation: 'check-engine-pulse 1s ease-in-out infinite',
          }}
        >
          <CheckEngineIcon />
        </Box>
      )}
    </Box>
  );
}

export function RaceTrack({ trackRef, carRef, car, isBroken, isWinner }: RaceTrackProps) {
  return (
    <Box
      ref={trackRef}
      sx={{
        flex: 1,
        position: 'relative',
        height: 56,
        overflow: 'hidden',
        borderRadius: '6px',
        background:
          'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%),' +
          'linear-gradient(180deg, #252830 0%, #1c1f26 55%, #131519 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <RaceTrackLanes isWinner={isWinner} />
      <CarNameLabel name={car.name} color={car.color} />
      <CarMarker carRef={carRef} car={car} isBroken={isBroken} />
    </Box>
  );
}
