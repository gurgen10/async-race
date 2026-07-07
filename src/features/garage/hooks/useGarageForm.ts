import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks';
import { createCar, fetchCars, generateCars, selectCar, updateCar } from '../garageSlice';
import type { Car } from '../../../shared/types/car';
import { BRANDS, COLORS, DEFAULT_COLOR, GENERATE_COUNT, MODELS } from '../../../shared/constants';

type AppDispatch = ReturnType<typeof useAppDispatch>;

function randomCars(count: number) {
  return Array.from({ length: count }, () => ({
    name: `${BRANDS[Math.floor(Math.random() * BRANDS.length)] ?? 'Generic'} ${MODELS[Math.floor(Math.random() * MODELS.length)] ?? 'Car'}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? DEFAULT_COLOR,
  }));
}

async function submitCreate(
  dispatch: AppDispatch,
  name: string,
  color: string,
  onCreated: (car: Car) => void,
  resetForm: () => void,
) {
  if (!name) return;
  try {
    const car = await dispatch(createCar({ name, color })).unwrap();
    onCreated(car);
  } catch {
    // create failed — API unreachable or validation error
  }
  resetForm();
}

function useCreatedCar() {
  const [createdCar, setCreatedCar] = useState<Car | null>(null);
  return {
    createdCar,
    onCreated: (car: Car) => { setCreatedCar(car); },
    clearCreatedCar: () => { setCreatedCar(null); },
  };
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
  return { formName, formColor, setFormName, setFormColor, resetForm };
}

function useCarEditHandler(
  dispatch: AppDispatch,
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
  dispatch: AppDispatch,
  page: number,
  selectedCar: Car | null,
  state: GarageFormState,
  onCreated: (car: Car) => void,
) {
  const { formName, formColor, resetForm } = state;
  const creatingRef = useRef(false);

  const handleCreate = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    await submitCreate(dispatch, formName.trim(), formColor, onCreated, resetForm);
    creatingRef.current = false;
  };

  const handleUpdate = () => {
    if (!selectedCar || !formName.trim()) return;
    void dispatch(updateCar({ id: selectedCar.id, data: { name: formName.trim(), color: formColor } }));
    dispatch(selectCar(null));
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    dispatch(selectCar(null));
  };

  const handleGenerateCars = async () => {
    try {
      await dispatch(generateCars(randomCars(GENERATE_COUNT))).unwrap();
      void dispatch(fetchCars(page));
    } catch {
      // API unreachable or validation error
    }
  };

  return { handleCreate, handleUpdate, handleCancel, handleGenerateCars };
}

export function useGarageForm(dispatch: AppDispatch) {
  const { cars, page, selectedCar } = useAppSelector((state) => state.garage);
  const state = useGarageFormState();
  const { createdCar, onCreated, clearCreatedCar } = useCreatedCar();
  const handleEditCar = useCarEditHandler(dispatch, cars, selectedCar, state);
  const crud = useGarageFormCrud(dispatch, page, selectedCar, state, onCreated);

  return {
    formName: state.formName,
    formColor: state.formColor,
    selectedCar,
    setFormName: state.setFormName,
    setFormColor: state.setFormColor,
    handleEditCar,
    createdCar,
    clearCreatedCar,
    ...crud,
  };
}
