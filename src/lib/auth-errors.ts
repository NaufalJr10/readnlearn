export const LOGIN_ERRORS = {
  invalid_credentials: "That email and password combination didn't match our records.",
  pending: "Your account is awaiting admin approval. We'll email you as soon as it's approved.",
  inactive: "Your account has been deactivated. Contact support if you'd like to reactivate it.",
  rejected: "Your account was rejected. Contact support.",
  rate_limited: "Too many failed attempts. Please wait 15 minutes and try again.",
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERRORS;

export function loginErrorMessage(code: string | null | undefined) {
  if (code && code in LOGIN_ERRORS) return LOGIN_ERRORS[code as LoginErrorCode];
  return "Something went wrong while signing in. Please try again.";
}

export function dashboardPath(role: string) {
  return role === "tutor" ? "/tutor" : "/student";
}
