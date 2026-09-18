import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  AppState, AppUser, Provider, ClassifyResponse,
  Toast, ToastType, DashboardView, PublicView, ContactActionPayload,
} from '../types';

// ─── Initial state ─────────────────────────────────────────────────────────

const initialState: AppState = {
  user:                  null,
  authLoading:           true,
  selectedArea:          '',
  problemText:           '',
  detectedService:       null,
  classifyResult:        null,
  urgency:               null,
  providers:             [],
  providersLoading:      false,
  currentView:           'finder',
  publicView:            'home',
  isEmergency:           false,
  toasts:                [],
  pendingContactAction:  null,
  contactModalOpen:      false,
};

// ─── Action types ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_USER';                  payload: AppUser | null }
  | { type: 'SET_AUTH_LOADING';          payload: boolean }
  | { type: 'SET_AREA';                  payload: string }
  | { type: 'SET_PROBLEM_TEXT';          payload: string }
  | { type: 'SET_CLASSIFY_RESULT';       payload: ClassifyResponse | null }
  | { type: 'SET_PROVIDERS';             payload: Provider[] }
  | { type: 'SET_PROVIDERS_LOADING';     payload: boolean }
  | { type: 'SET_VIEW';                  payload: DashboardView }
  | { type: 'SET_PUBLIC_VIEW';           payload: PublicView }
  | { type: 'TOGGLE_EMERGENCY' }
  | { type: 'ADD_TOAST';                 payload: Toast }
  | { type: 'REMOVE_TOAST';              payload: string }
  | { type: 'PROMPT_CONTACT_LOGIN';      payload: ContactActionPayload }
  | { type: 'CLOSE_CONTACT_MODAL' }
  | { type: 'SET_CONTACT_MODAL_OPEN';    payload: boolean }
  | { type: 'CLEAR_PENDING_ACTION' };

// ─── Reducer ──────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_AREA':
      return { ...state, selectedArea: action.payload };
    case 'SET_PROBLEM_TEXT':
      return { ...state, problemText: action.payload };
    case 'SET_CLASSIFY_RESULT':
      return {
        ...state,
        classifyResult:  action.payload,
        detectedService: action.payload?.serviceCategory ?? null,
        urgency:         action.payload?.urgency ?? null,
      };
    case 'SET_PROVIDERS':
      return { ...state, providers: action.payload };
    case 'SET_PROVIDERS_LOADING':
      return { ...state, providersLoading: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_PUBLIC_VIEW':
      return { ...state, publicView: action.payload };
    case 'TOGGLE_EMERGENCY':
      return { ...state, isEmergency: !state.isEmergency };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'PROMPT_CONTACT_LOGIN':
      return { ...state, pendingContactAction: action.payload, contactModalOpen: true };
    case 'CLOSE_CONTACT_MODAL':
      return { ...state, contactModalOpen: false };
    case 'SET_CONTACT_MODAL_OPEN':
      return { ...state, contactModalOpen: action.payload };
    case 'CLEAR_PENDING_ACTION':
      return { ...state, pendingContactAction: null };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface AppContextValue {
  state:                     AppState;
  setUser:                   (user: AppUser | null) => void;
  setAuthLoading:            (v: boolean) => void;
  setArea:                   (area: string) => void;
  setProblemText:            (text: string) => void;
  setClassifyResult:         (result: ClassifyResponse | null) => void;
  setProviders:              (providers: Provider[]) => void;
  setProvidersLoading:       (v: boolean) => void;
  setView:                   (view: DashboardView) => void;
  setPublicView:             (view: PublicView) => void;
  toggleEmergency:           () => void;
  addToast:                  (message: string, type?: ToastType) => void;
  removeToast:               (id: string) => void;
  promptContactLogin:        (action: ContactActionPayload) => void;
  closeContactModal:         () => void;
  setContactModalOpen:       (open: boolean) => void;
  clearPendingContactAction: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setUser                   = useCallback((u: AppUser | null) =>
    dispatch({ type: 'SET_USER', payload: u }), []);
  const setAuthLoading            = useCallback((v: boolean) =>
    dispatch({ type: 'SET_AUTH_LOADING', payload: v }), []);
  const setArea                   = useCallback((a: string) =>
    dispatch({ type: 'SET_AREA', payload: a }), []);
  const setProblemText            = useCallback((t: string) =>
    dispatch({ type: 'SET_PROBLEM_TEXT', payload: t }), []);
  const setClassifyResult         = useCallback((r: ClassifyResponse | null) =>
    dispatch({ type: 'SET_CLASSIFY_RESULT', payload: r }), []);
  const setProviders              = useCallback((p: Provider[]) =>
    dispatch({ type: 'SET_PROVIDERS', payload: p }), []);
  const setProvidersLoading       = useCallback((v: boolean) =>
    dispatch({ type: 'SET_PROVIDERS_LOADING', payload: v }), []);
  const setView                   = useCallback((v: DashboardView) =>
    dispatch({ type: 'SET_VIEW', payload: v }), []);
  const setPublicView             = useCallback((v: PublicView) =>
    dispatch({ type: 'SET_PUBLIC_VIEW', payload: v }), []);
  const toggleEmergency           = useCallback(() =>
    dispatch({ type: 'TOGGLE_EMERGENCY' }), []);

  const promptContactLogin        = useCallback((action: ContactActionPayload) =>
    dispatch({ type: 'PROMPT_CONTACT_LOGIN', payload: action }), []);
  const closeContactModal         = useCallback(() =>
    dispatch({ type: 'CLOSE_CONTACT_MODAL' }), []);
  const setContactModalOpen       = useCallback((open: boolean) =>
    dispatch({ type: 'SET_CONTACT_MODAL_OPEN', payload: open }), []);
  const clearPendingContactAction = useCallback(() =>
    dispatch({ type: 'CLEAR_PENDING_ACTION' }), []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000);
  }, []);

  const removeToast = useCallback((id: string) =>
    dispatch({ type: 'REMOVE_TOAST', payload: id }), []);

  const ctx: AppContextValue = {
    state, setUser, setAuthLoading, setArea, setProblemText,
    setClassifyResult, setProviders, setProvidersLoading,
    setView, setPublicView, toggleEmergency, addToast, removeToast,
    promptContactLogin, closeContactModal, setContactModalOpen, clearPendingContactAction,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
};
