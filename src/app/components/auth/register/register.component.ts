import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CustomValidators } from '../../../shared/validator/password-match';
import { Register } from '../../../shared/action/auth.action';
import { Breadcrumb } from '../../../shared/interface/breadcrumb';
import { SettingState } from '../../../shared/state/setting.state';
import { ThemeOptionState } from '../../../shared/state/theme-option.state';
import { Option } from '../../../shared/interface/theme-option.interface';
import { Values } from '../../../shared/interface/setting.interface';
import * as data from '../../../shared/data/country-code';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  @Select(SettingState.setting) setting$: Observable<Values>;
  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;

  public form: FormGroup;
  public breadcrumb: Breadcrumb = {
    title: "Sign In",
    items: [{ label: 'Sign In', active: true }]
  }
  public codes = data.countryCodes;
  public tnc = new FormControl(false, [Validators.requiredTrue]);


  public reCaptcha: boolean = true;
  

  constructor(
    private store: Store,
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.form = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      country_code: new FormControl('91', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      password_confirmation: new FormControl('', [Validators.required]),
      recaptcha: new FormControl(null, Validators.required)
    },{validator : CustomValidators.MatchValidator('password', 'password_confirmation')});

    this.setting$.subscribe(seting => {
      if((seting?.google_reCaptcha && !seting?.google_reCaptcha?.status) || !seting?.google_reCaptcha) {
        this.form.removeControl('recaptcha');
        this.reCaptcha = false;
      } else {
        this.form.setControl('recaptcha', new FormControl(null, Validators.required))
        this.reCaptcha = true;
      }
    });

    this.form.get('country_code')?.disable();
    this.form.controls['phone']?.valueChanges.subscribe((value) => {
      let phoneStr = value ? value.toString().replace(/[^0-9]/g, '') : '';
      // Always keep max 10 digits
      if (phoneStr.length > 10) {
        phoneStr = phoneStr.slice(0, 10);
        this.form.controls['phone'].setValue(phoneStr, { emitEvent: false });
      }
      // Set error if not exactly 10 digits
      if (phoneStr.length !== 10) {
        this.form.controls['phone'].markAsTouched();
        this.form.controls['phone'].setErrors({ invalid: true });
      } else {
        this.form.controls['phone'].setErrors(null);
      }
    });

  }

  onNameInput(event: any) {
    const input = event.target;
    const value = input.value;
    // Remove special characters and numbers, keep only letters and spaces
    const cleanValue = value.replace(/[^A-Za-z\s]/g, '');
    
    // Update the input value if it was changed
    if (value !== cleanValue) {
      input.value = cleanValue;
      this.form.controls['name'].setValue(cleanValue);
    }
  }

  onPhoneInput(event: any) {
    const input = event.target;
    const value = input.value;
    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    // Update the input value if it was changed
    if (value !== cleanValue) {
      input.value = cleanValue;
      this.form.controls['phone'].setValue(cleanValue);
    }
  }

  get passwordMatchError() {
    return (
      this.form.getError('mismatch') &&
      this.form.get('password_confirmation')?.touched
    );
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.tnc.invalid){
      return
    }
    if(this.form.valid) {
      this.store.dispatch(new Register(this.form.value)).subscribe({
          complete: () => {
            this.router.navigateByUrl('/');
          }
        }
      );
    }
  }
}
