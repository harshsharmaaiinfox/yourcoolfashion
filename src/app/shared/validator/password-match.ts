import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);
      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }

  static DifferentFromCurrentPassword(currentPassword: string, newPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentPasswordCtrl = control.get(currentPassword);
      const newPasswordCtrl = control.get(newPassword);
      
      if (currentPasswordCtrl && newPasswordCtrl && 
          currentPasswordCtrl.value && newPasswordCtrl.value && 
          currentPasswordCtrl.value === newPasswordCtrl.value) {
        return { sameAsCurrent: true };
      }
      return null;
    };
  }
}
