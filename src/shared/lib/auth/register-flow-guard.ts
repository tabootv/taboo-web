const REGISTER_FLOW_TOKEN_KEY = 'register_flow_allowed';

export function setRegisterFlowToken(): void {
  try {
    sessionStorage.setItem(REGISTER_FLOW_TOKEN_KEY, '1');
  } catch {
    // sessionStorage may be unavailable (private browsing, storage quota)
  }
}

export function hasRegisterFlowToken(): boolean {
  try {
    return sessionStorage.getItem(REGISTER_FLOW_TOKEN_KEY) === '1';
  } catch {
    return true; // graceful degradation: allow access if storage unavailable
  }
}

export function clearRegisterFlowToken(): void {
  try {
    sessionStorage.removeItem(REGISTER_FLOW_TOKEN_KEY);
  } catch {
    // fail silently
  }
}
