import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { AppState, CollectionPlant, GrowthEntry, Profile } from "../types";
import { loadState, saveState, uid } from "../lib/storage";

type Action =
  | { type: "addPlant"; plant: CollectionPlant }
  | { type: "removePlant"; id: string }
  | { type: "updatePlant"; id: string; patch: Partial<CollectionPlant> }
  | { type: "addEntry"; plantId: string; entry: GrowthEntry }
  | { type: "removeEntry"; plantId: string; entryId: string }
  | { type: "updateProfile"; patch: Partial<Profile> }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "addPlant":
      return { ...state, plants: [action.plant, ...state.plants] };
    case "removePlant":
      return { ...state, plants: state.plants.filter((p) => p.id !== action.id) };
    case "updatePlant":
      return {
        ...state,
        plants: state.plants.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };
    case "addEntry":
      return {
        ...state,
        plants: state.plants.map((p) => {
          if (p.id !== action.plantId) return p;
          const history = [action.entry, ...p.history];
          const patch: Partial<CollectionPlant> = { history };
          if (action.entry.type === "water") patch.lastWaterAt = action.entry.date;
          if (action.entry.type === "repot") patch.lastRepotAt = action.entry.date;
          if (action.entry.photo) patch.photo = p.photo ?? action.entry.photo;
          return { ...p, ...patch };
        }),
      };
    case "removeEntry":
      return {
        ...state,
        plants: state.plants.map((p) =>
          p.id === action.plantId
            ? { ...p, history: p.history.filter((h) => h.id !== action.entryId) }
            : p
        ),
      };
    case "updateProfile":
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case "reset":
      return loadState();
    default:
      return state;
  }
}

interface Store {
  state: AppState;
  addPlant: (plant: CollectionPlant) => void;
  removePlant: (id: string) => void;
  updatePlant: (id: string, patch: Partial<CollectionPlant>) => void;
  addEntry: (plantId: string, entry: Omit<GrowthEntry, "id">) => void;
  removeEntry: (plantId: string, entryId: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      state,
      addPlant: (plant) => dispatch({ type: "addPlant", plant }),
      removePlant: (id) => dispatch({ type: "removePlant", id }),
      updatePlant: (id, patch) => dispatch({ type: "updatePlant", id, patch }),
      addEntry: (plantId, entry) =>
        dispatch({ type: "addEntry", plantId, entry: { ...entry, id: uid() } }),
      removeEntry: (plantId, entryId) => dispatch({ type: "removeEntry", plantId, entryId }),
      updateProfile: (patch) => dispatch({ type: "updateProfile", patch }),
    }),
    [state]
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
