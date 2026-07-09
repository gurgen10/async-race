import { Box, Typography } from '@mui/material';
import './AppHeader.css';
import { NavLinks } from '../NavLinks';

const BRAND_LINE_1 = ['A', 's', 'y', 'n', 'c'];
const BRAND_LINE_2 = ['R', 'a', 'c', 'e'];

function BrandLetter({ char }: { char: string }) {
  return (
    <span className="brand-letter">
      <span className="brand-lights" aria-hidden="true">
        <span className="brand-light brand-light-red" />
        <span className="brand-light brand-light-blue" />
        <span className="brand-light brand-light-orange" />
      </span>
      <span className="brand-text">{char}</span>
    </span>
  );
}

export function AppHeader() {
  return (
    <Box component="header" className="app-header">
      <Box className="brand-frame" role="img" aria-label="Async Race logo">
        <Typography component="h1" className="brand-title">
          <span className="brand-word">
            {BRAND_LINE_1.map((char) => (
              <BrandLetter key={char} char={char} />
            ))}
          </span>
          <span className="brand-word">
            {BRAND_LINE_2.map((char) => (
              <BrandLetter key={char} char={char} />
            ))}
          </span>
        </Typography>
      </Box>
      <NavLinks />
    </Box>
  );
}
