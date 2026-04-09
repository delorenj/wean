import {
  ACCOUNT_DELETION_CONFIRMATION_TEXT,
  accountDeletionUiReducer,
  initialAccountDeletionUiState,
  isDeletionConfirmationValid,
  mapAccountDeletionErrorMessage,
} from './accountDeletion.helpers';

describe('accountDeletion.helpers', () => {
  describe('isDeletionConfirmationValid', () => {
    it('requires exact DELETE confirmation text', () => {
      expect(isDeletionConfirmationValid(ACCOUNT_DELETION_CONFIRMATION_TEXT)).toBe(true);
      expect(isDeletionConfirmationValid(' DELETE ')).toBe(true);
      expect(isDeletionConfirmationValid('delete')).toBe(false);
      expect(isDeletionConfirmationValid('DELET')).toBe(false);
      expect(isDeletionConfirmationValid('')).toBe(false);
    });
  });

  describe('accountDeletionUiReducer', () => {
    it('opens dialog with reset input and no errors', () => {
      const nextState = accountDeletionUiReducer(initialAccountDeletionUiState, { type: 'openDialog' });

      expect(nextState).toEqual({
        ...initialAccountDeletionUiState,
        isDialogVisible: true,
      });
    });

    it('tracks input while clearing prior errors', () => {
      const stateWithError = {
        ...initialAccountDeletionUiState,
        isDialogVisible: true,
        errorMessage: 'Type DELETE',
      };

      const nextState = accountDeletionUiReducer(stateWithError, {
        type: 'updateInput',
        payload: 'DEL',
      });

      expect(nextState.confirmationInput).toBe('DEL');
      expect(nextState.errorMessage).toBeNull();
    });

    it('sets loading state when deletion starts', () => {
      const openState = accountDeletionUiReducer(initialAccountDeletionUiState, {
        type: 'openDialog',
      });

      const nextState = accountDeletionUiReducer(openState, { type: 'startDeletion' });

      expect(nextState.isDeleting).toBe(true);
      expect(nextState.errorMessage).toBeNull();
    });

    it('closes dialog and stores success message on deletion success', () => {
      const deletingState = {
        ...initialAccountDeletionUiState,
        isDialogVisible: true,
        isDeleting: true,
        confirmationInput: 'DELETE',
      };

      const nextState = accountDeletionUiReducer(deletingState, {
        type: 'deletionSuccess',
        payload: 'Deleted',
      });

      expect(nextState).toEqual({
        ...initialAccountDeletionUiState,
        successMessage: 'Deleted',
      });
    });

    it('keeps dialog open and sets error on deletion failure', () => {
      const deletingState = {
        ...initialAccountDeletionUiState,
        isDialogVisible: true,
        isDeleting: true,
      };

      const nextState = accountDeletionUiReducer(deletingState, {
        type: 'deletionFailed',
        payload: 'Deletion failed',
      });

      expect(nextState.isDialogVisible).toBe(true);
      expect(nextState.isDeleting).toBe(false);
      expect(nextState.errorMessage).toBe('Deletion failed');
    });
  });

  describe('mapAccountDeletionErrorMessage', () => {
    it('maps requires recent login errors', () => {
      expect(
        mapAccountDeletionErrorMessage({
          code: 'auth/requires-recent-login',
        })
      ).toBe('For security, please sign in again before deleting your account.');
    });

    it('maps permission denied errors', () => {
      expect(
        mapAccountDeletionErrorMessage({
          code: 'permission-denied',
        })
      ).toBe('Unable to delete account data due to missing permissions.');
    });

    it('uses fallback message for unknown errors', () => {
      expect(mapAccountDeletionErrorMessage(new Error('boom'))).toBe(
        'Unable to delete your account right now. Please try again.'
      );
    });
  });
});
