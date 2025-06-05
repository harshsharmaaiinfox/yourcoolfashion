import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateUserPassword } from '../../../../action/account.action';
import { CustomValidators } from '../../../../validator/password-match';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent {

  public form: FormGroup;
  public closeResult: string;

  public modalOpen: boolean = false;

  @ViewChild("passwordModal", { static: false }) PasswordModal: TemplateRef<string>;
  
  constructor(private modalService: NgbModal,
    private store: Store,
    private formBuilder: FormBuilder) {
      this.form = this.formBuilder.group({
        current_password: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        password_confirmation: new FormControl('', [Validators.required])
      }, {
        validators: [
          CustomValidators.MatchValidator('password', 'password_confirmation'),
          CustomValidators.DifferentFromCurrentPassword('current_password', 'password')
        ]
      });
  }

  async openModal() {
    this.modalOpen = true;
    this.modalService.open(this.PasswordModal, {
      ariaLabelledBy: 'password-Modal',
      centered: true,
      windowClass: 'theme-modal'
    }).result.then((result) => {
      `Result ${result}`
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  get passwordMatchError() {
    return (
      this.form.getError('mismatch') &&
      this.form.get('password_confirmation')?.touched
    );
  }

  get sameAsCurrentError() {
    return (
      this.form.getError('sameAsCurrent') &&
      this.form.get('password')?.touched
    );
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      if (this.sameAsCurrentError) {
        // Show error message for same password
        alert('New password cannot be the same as your current password');
        return;
      }
      
      this.store.dispatch(new UpdateUserPassword(this.form.value)).subscribe({
        complete: () => {
          this.form.reset();
          this.modalService.dismissAll();
          alert('Password updated successfully!');
        },
        error: (error) => {
          if (error.error?.message === 'Current password is incorrect') {
            alert('Current password is incorrect');
          } else {
            alert('Failed to update password. Please try again.');
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if(this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

}
