import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string;
  stargazers_count: number;
  owner: {
    login: string;
  };
}

interface SearchState {
  query: string;
  results: Repo[];
  page: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  results: [],
  page: 1,
  totalCount: 0,
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.page = 1;
    },
    setResults: (
      state,
      action: PayloadAction<{ items: Repo[]; totalCount: number }>
    ) => {
      state.results = action.payload.items;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setQuery, setResults, setLoading, setError, setPage } =
  searchSlice.actions;
export default searchSlice.reducer;
