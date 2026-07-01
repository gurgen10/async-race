import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createCar,
  fetchCars,
  generateCars,
  selectCar,
  setPage,
  updateCar,
  GARAGE_PAGE_SIZE,
} from '../store/slices/garageSlice';
import { beginRace, clearWinner, resetAllCars, type RaceState } from '../store/slices/raceSlice';
import { saveWinner } from '../store/slices/winnersSlice';
import { CarRow } from '../components/CarRow';
import { WinnerModal } from '../components/WinnerModal';
import type { Car } from '../types/car';

const BRANDS = [
  'Tesla',
  'Ford',
  'BMW',
  'Audi',
  'Ferrari',
  'Lamborghini',
  'Porsche',
  'Toyota',
  'Honda',
  'Chevrolet',
  'Dodge',
  'Bugatti',
  'McLaren',
  'Aston Martin',
  'Jaguar',
  'Maserati',
  'Bentley',
  'Rolls-Royce',
  'Koenigsegg',
  'Pagani',
];
const MODELS = [
  'Model S',
  'Mustang',
  'M3',
  'R8',
  '488',
  'Huracán',
  '911',
  'Supra',
  'NSX',
  'Corvette',
  'Charger',
  'Chiron',
  '720S',
  'DB11',
  'F-Type',
  'GranTurismo',
  'Continental',
  'Ghost',
  'Jesko',
  'Zonda',
];
const COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#e91e63',
  '#ff5722',
  '#00bcd4',
  '#8bc34a',
  '#ff9800',
  '#673ab7',
  '#f44336',
  '#4caf50',
  '#2196f3',
  '#ff4081',
  '#00e676',
  '#ff6d00',
  '#aa00ff',
];
const GENERATE_COUNT = 100;
const DEFAULT_COLOR = '#e74c3c';

function randomCars(count: number) {
  return Array.from({ length: count }, () => ({
    name: `${BRANDS[Math.floor(Math.random() * BRANDS.length)] ?? 'Generic'} ${MODELS[Math.floor(Math.random() * MODELS.length)] ?? 'Car'}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? DEFAULT_COLOR,
  }));
}

const FORM_BOX_SX = {
  display: 'flex',
  gap: 1.5,
  alignItems: 'center',
  mt: 2,
  p: '10px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  flexWrap: 'wrap',
} as const;

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#f97316' },
  },
  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 },
};

function ColorPicker({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  return (
    <Box
      component="label"
      title="Pick a colour"
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: color,
        border: '2.5px solid rgba(255,255,255,0.25)',
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.55)' },
      }}
    >
      <Box
        component="input"
        type="color"
        value={color}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}

interface CreateUpdateButtonProps {
  isEditing: boolean;
  formName: string;
  onCreate: () => void;
  onUpdate: () => void;
}

function CreateUpdateButton({ isEditing, formName, onCreate, onUpdate }: CreateUpdateButtonProps) {
  if (isEditing) {
    return (
      <Button
        variant="contained"
        onClick={onUpdate}
        disabled={!formName.trim()}
        sx={{
          borderRadius: 999,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '&.Mui-disabled': { opacity: 0.4, color: 'white' },
        }}
      >
        Update
      </Button>
    );
  }
  return (
    <Button
      variant="contained"
      onClick={onCreate}
      disabled={!formName.trim()}
      sx={{
        borderRadius: 999,
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        flexShrink: 0,
        '&.Mui-disabled': { opacity: 0.4, color: 'white' },
      }}
    >
      Create
    </Button>
  );
}

interface CancelButtonProps {
  formName: string;
  isEditing: boolean;
  onCancel: () => void;
}

function CancelButton({ formName, isEditing, onCancel }: CancelButtonProps) {
  return (
    <Button
      variant="outlined"
      onClick={onCancel}
      disabled={!formName.trim() && !isEditing}
      sx={{
        borderRadius: 999,
        flexShrink: 0,
        borderColor: 'rgba(148,163,184,0.35)',
        color: '#64748b',
        '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.08)', color: '#94a3b8' },
        '&.Mui-disabled': {
          borderColor: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.15)',
        },
      }}
    >
      Cancel
    </Button>
  );
}

interface GarageFormProps {
  formName: string;
  formColor: string;
  isEditing: boolean;
  onNameChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onCancel: () => void;
}

function GarageForm({
  formName,
  formColor,
  isEditing,
  onNameChange,
  onColorChange,
  onCreate,
  onUpdate,
  onCancel,
}: GarageFormProps) {
  return (
    <Box sx={FORM_BOX_SX}>
      <ColorPicker color={formColor} onChange={onColorChange} />

      <TextField
        size="small"
        value={formName}
        onChange={(e) => {
          onNameChange(e.target.value);
        }}
        placeholder="Car name"
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          if (isEditing) onUpdate();
          else onCreate();
        }}
        sx={{ flex: 1, minWidth: 150, ...INPUT_SX }}
      />

      <CreateUpdateButton
        isEditing={isEditing}
        formName={formName}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
      <CancelButton formName={formName} isEditing={isEditing} onCancel={onCancel} />
    </Box>
  );
}

function RaceButton({ canRace, onRace }: { canRace: boolean; onRace: () => void }) {
  return (
    <Button
      variant="contained"
      color="secondary"
      className="action-secondary"
      disabled={!canRace}
      onClick={onRace}
      startIcon={
        <Box component="span" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
          ▶
        </Box>
      }
      sx={{ '&.Mui-disabled': { opacity: 0.4, color: 'white' } }}
    >
      Race
    </Button>
  );
}

function ResetButton({ canReset, onReset }: { canReset: boolean; onReset: () => void }) {
  return (
    <Button
      variant="outlined"
      disabled={!canReset}
      onClick={onReset}
      startIcon={
        <Box component="span" sx={{ fontSize: '0.95rem', lineHeight: 1 }}>
          ↺
        </Box>
      }
      sx={{
        borderRadius: 999,
        borderColor: canReset ? 'rgba(148,163,184,0.5)' : 'rgba(255,255,255,0.12)',
        color: canReset ? '#94a3b8' : 'rgba(255,255,255,0.25)',
        '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.1)' },
        '&.Mui-disabled': {
          borderColor: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.2)',
        },
      }}
    >
      Reset
    </Button>
  );
}

function GenerateButton({ onGenerate }: { onGenerate: () => void }) {
  return (
    <Button
      variant="outlined"
      onClick={onGenerate}
      sx={{
        borderRadius: 999,
        borderColor: 'rgba(249,115,22,0.4)',
        color: '#f97316',
        fontSize: '0.75rem',
        '&:hover': { borderColor: '#f97316', bgcolor: 'rgba(249,115,22,0.08)' },
      }}
    >
      Generate 100 Random Cars
    </Button>
  );
}

interface RaceControlsProps {
  canRace: boolean;
  canReset: boolean;
  onRace: () => void;
  onReset: () => void;
  onGenerate: () => void;
}

function RaceControls({ canRace, canReset, onRace, onReset, onGenerate }: RaceControlsProps) {
  return (
    <Stack direction="row" spacing={1.5} className="page-actions">
      <RaceButton canRace={canRace} onRace={onRace} />
      <ResetButton canReset={canReset} onReset={onReset} />
      <Box sx={{ flex: 1 }} />
      <GenerateButton onGenerate={onGenerate} />
    </Stack>
  );
}

interface GarageFormState {
  formName: string;
  formColor: string;
  setFormName: (v: string) => void;
  setFormColor: (v: string) => void;
  resetForm: () => void;
}

function useGarageFormState(): GarageFormState {
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(DEFAULT_COLOR);
  const resetForm = () => {
    setFormName('');
    setFormColor(DEFAULT_COLOR);
  };
  return {
    formName,
    formColor,
    setFormName,
    setFormColor,
    resetForm,
  };
}

function useCarEditHandler(
  dispatch: ReturnType<typeof useAppDispatch>,
  cars: Car[],
  selectedCar: Car | null,
  state: GarageFormState,
) {
  const { setFormName, setFormColor, resetForm } = state;

  return (id: number, name: string, color: string) => {
    if (selectedCar?.id === id) {
      dispatch(selectCar(null));
      resetForm();
    } else {
      dispatch(selectCar(cars.find((c) => c.id === id) ?? null));
      setFormName(name);
      setFormColor(color);
    }
  };
}

function useGarageFormCrud(
  dispatch: ReturnType<typeof useAppDispatch>,
  page: number,
  selectedCar: Car | null,
  state: GarageFormState,
) {
  const { formName, formColor, resetForm } = state;

  const handleCreate = () => {
    const name = formName.trim();
    if (!name) return;
    void dispatch(createCar({ name, color: formColor }));
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedCar || !formName.trim()) return;
    void dispatch(
      updateCar({
        id: selectedCar.id,
        data: { name: formName.trim(), color: formColor },
      }),
    );
    dispatch(selectCar(null));
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    dispatch(selectCar(null));
  };

  const handleGenerateCars = () => {
    void dispatch(generateCars(randomCars(GENERATE_COUNT))).then(() => dispatch(fetchCars(page)));
  };

  return {
    handleCreate,
    handleUpdate,
    handleCancel,
    handleGenerateCars,
  };
}

function useGarageForm(dispatch: ReturnType<typeof useAppDispatch>) {
  const { cars, page, selectedCar } = useAppSelector((state) => state.garage);
  const state = useGarageFormState();
  const handleEditCar = useCarEditHandler(dispatch, cars, selectedCar, state);
  const crud = useGarageFormCrud(dispatch, page, selectedCar, state);

  return {
    formName: state.formName,
    formColor: state.formColor,
    selectedCar,
    setFormName: state.setFormName,
    setFormColor: state.setFormColor,
    handleEditCar,
    ...crud,
  };
}

function useResetOnMount(dispatch: ReturnType<typeof useAppDispatch>) {
  const raceCars = useAppSelector((state) => state.race.cars);
  const mountIdsRef = useRef(Object.keys(raceCars).map(Number));

  useEffect(() => {
    const ids = mountIdsRef.current;
    if (ids.length > 0) {
      void dispatch(resetAllCars(ids));
    }
  }, [dispatch]);
}

function useGaragePageEffects(
  dispatch: ReturnType<typeof useAppDispatch>,
  page: number,
  winnerId: number | null,
  winnerTime: number | null,
) {
  useEffect(() => {
    void dispatch(fetchCars(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (winnerId !== null && winnerTime !== null) {
      void dispatch(saveWinner({ id: winnerId, time: winnerTime }));
    }
  }, [dispatch, winnerId, winnerTime]);
}

function useGaragePageDerived(cars: Car[], raceState: RaceState) {
  const carIds = cars.map((c) => c.id);
  const anyCarActive = Object.keys(raceState.cars).length > 0;
  return {
    carIds,
    anyCarActive,
    canRace: !anyCarActive && cars.length > 0,
    canReset: anyCarActive,
    winnerCar: cars.find((c) => c.id === raceState.winnerId) ?? null,
    modalOpen: raceState.winnerId !== null && raceState.winnerTime !== null,
  };
}

function GarageHeading({ status, total }: { status: string; total: number }) {
  return (
    <Box className="page-heading">
      <Typography variant="h4" component="h2">
        Garage
      </Typography>
      <Chip
        label={status === 'loading' ? '…' : `${total} cars`}
        color="success"
        variant="outlined"
      />
    </Box>
  );
}

interface GarageStatusBodyProps {
  status: 'idle' | 'loading' | 'failed';
  cars: Car[];
  onEdit: (id: number, name: string, color: string) => void;
}

function GarageStatusBody({ status, cars, onEdit }: GarageStatusBodyProps) {
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress size={32} sx={{ color: '#f97316' }} />
      </Box>
    );
  }
  if (status === 'failed') {
    return (
      <Typography sx={{ mt: 2, color: '#f87171' }}>
        Failed to load cars — is the API server running on port 3000?
      </Typography>
    );
  }
  if (cars.length === 0) {
    return <Typography sx={{ mt: 2, opacity: 0.5 }}>No cars in the garage yet.</Typography>;
  }
  return (
    <Box
      component="ul"
      className="list"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        mt: 2,
      }}
    >
      {cars.map((car) => (
        <CarRow key={car.id} car={car} onEdit={onEdit} />
      ))}
    </Box>
  );
}

interface GaragePaginationProps {
  pageCount: number;
  page: number;
  onChange: (page: number) => void;
}

function GaragePagination({ pageCount, page, onChange }: GaragePaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_e, p) => {
          onChange(p);
        }}
        sx={{
          '& .MuiPaginationItem-root': { color: '#f8fafc' },
          '& .Mui-selected': { background: 'rgba(249,115,22,0.3) !important' },
        }}
      />
    </Box>
  );
}

interface GarageWinnerSectionProps {
  winnerCar: Car | null;
  winnerTime: number | null;
  open: boolean;
  onClose: () => void;
}

function GarageWinnerSection({ winnerCar, winnerTime, open, onClose }: GarageWinnerSectionProps) {
  if (!winnerCar || winnerTime === null) return null;
  return (
    <WinnerModal
      open={open}
      winnerName={winnerCar.name}
      winnerColor={winnerCar.color}
      winnerTime={winnerTime}
      onClose={onClose}
    />
  );
}

interface GarageControlsSectionProps {
  form: ReturnType<typeof useGarageForm>;
  derived: ReturnType<typeof useGaragePageDerived>;
  dispatch: ReturnType<typeof useAppDispatch>;
}

function GarageControlsSection({ form, derived, dispatch }: GarageControlsSectionProps) {
  return (
    <>
      <GarageForm
        formName={form.formName}
        formColor={form.formColor}
        isEditing={!!form.selectedCar}
        onNameChange={form.setFormName}
        onColorChange={form.setFormColor}
        onCreate={form.handleCreate}
        onUpdate={form.handleUpdate}
        onCancel={form.handleCancel}
      />
      <RaceControls
        canRace={derived.canRace}
        canReset={derived.canReset}
        onRace={() => {
          void dispatch(beginRace(derived.carIds));
        }}
        onReset={() => {
          void dispatch(resetAllCars(derived.carIds));
        }}
        onGenerate={form.handleGenerateCars}
      />
    </>
  );
}

function GaragePage() {
  const dispatch = useAppDispatch();
  const { cars, total, page, status } = useAppSelector((state) => state.garage);
  const raceState = useAppSelector((state) => state.race);
  const pageCount = Math.ceil(total / GARAGE_PAGE_SIZE);

  const form = useGarageForm(dispatch);
  useResetOnMount(dispatch);
  useGaragePageEffects(dispatch, page, raceState.winnerId, raceState.winnerTime);
  const derived = useGaragePageDerived(cars, raceState);

  return (
    <Box component="section" className="page-card garage-card">
      <GarageHeading status={status} total={total} />
      <GarageControlsSection form={form} derived={derived} dispatch={dispatch} />
      <GarageStatusBody status={status} cars={cars} onEdit={form.handleEditCar} />
      <GaragePagination
        pageCount={pageCount}
        page={page}
        onChange={(p) => {
          dispatch(setPage(p));
        }}
      />
      <GarageWinnerSection
        winnerCar={derived.winnerCar}
        winnerTime={raceState.winnerTime}
        open={derived.modalOpen}
        onClose={() => {
          dispatch(clearWinner());
        }}
      />
    </Box>
  );
}

export default GaragePage;
