import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { models } from '@grupo21/shared-react'

export type Period = {
  year: number;
  month: number;
};

export type FiltersState = {
  period: Period;
  type: typeof models.TransactionType | "all";
  category: typeof models.TransactionCategory | "all";
  search: string;
};

function getNowPeriod(): Period {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

const initialState: FiltersState = {
  period: getNowPeriod(),
  type: "all",
  category: "all",
  search: "",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload;
    },
    setType(state, action: PayloadAction<FiltersState["type"]>) {
      state.type = action.payload;
    },
    setCategory(state, action: PayloadAction<FiltersState["category"]>) {
      state.category = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    resetFilters(state) {
      state.type = "all";
      state.category = "all";
      state.search = "";
    },
  },
});

export const { setPeriod, setType, setCategory, setSearch, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;