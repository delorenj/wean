export const ACCOUNT_DELETION_CONFIRMATION_TEXT = 'DELETE';

export interface AccountDeletionUiState {
  isDialogVisible: boolean;
  confirmationInput: string;
  isDeleting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

export type AccountDeletionUiAction =
  | { type: 'openDialog' }
  | { type: 'closeDialog' }
  | { type: 'updateInput'; payload: string }
  | { type: 'startDeletion' }
  | { type: 'deletionSuccess'; payload: string }
  | { type: 'deletionFailed'; payload: string };

export const initialAccountDeletionUiState: AccountDeletionUiState = {
  isDialogVisible: false,
  confirmationInput: '',
  isDeleting: false,
  errorMessage: null,
  successMessage: null,
};

export const isDeletionConfirmationValid = (value: string): boolean =>
  value.trim() === ACCOUNT_DELETION_CONFIRMATION_TEXT;

export const accountDeletionUiReducer = (
  state: AccountDeletionUiState,
  action: AccountDeletionUiAction
): AccountDeletionUiState => {
  switch (action.type) {
    case 'openDialog':
      return {
        ...state,
        isDialogVisible: true,
        confirmationInput: '',
        isDeleting: false,
        errorMessage: null,
        successMessage: null,
      };

    case 'closeDialog':
      return {
        ...state,
        isDialogVisible: false,
        confirmationInput: '',
        isDeleting: false,
        errorMessage: null,
        successMessage: null,
      };

    case 'updateInput':
      return {
        ...state,
        confirmationInput: action.payload,
        errorMessage: null,
      };

    case 'startDeletion':
      return {
        ...state,
        isDeleting: true,
        errorMessage: null,
        successMessage: null,
      };

    case 'deletionSuccess':
      return {
        ...state,
        isDialogVisible: false,
        isDeleting: false,
        confirmationInput: '',
        errorMessage: null,
        successMessage: action.payload,
      };

    case 'deletionFailed':
      return {
        ...state,
        isDeleting: false,
        errorMessage: action.payload,
      };

    default:
      return state;
  }
};

export const mapAccountDeletionErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: unknown }).code);

    if (code === 'auth/requires-recent-login') {
      return 'For security, please sign in again before deleting your account.';
    }

    if (code === 'permission-denied') {
      return 'Unable to delete account data due to missing permissions.';
    }
  }

  return 'Unable to delete your account right now. Please try again.';
};
