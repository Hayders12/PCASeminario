import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';

  formErrors = {
    name: [{ type: 'required', message: 'El nombre es obligatorio' }],
    lastname: [{ type: 'required', message: 'El apellido es obligatorio' }],
    email: [
      { type: 'required', message: 'El correo es obligatorio' },
      { type: 'email', message: 'El correo no es válido' }
    ],
    username: [{ type: 'required', message: 'El usuario es obligatorio' }],
    password: [
      { type: 'required', message: 'La contraseña es obligatoria' },
      { type: 'minlength', message: 'Debe tener al menos 6 caracteres' }
    ],
    password_confirmation: [
      { type: 'required', message: 'Debe confirmar la contraseña' },
      { type: 'mismatch', message: 'Las contraseñas no coinciden' }
    ]
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController
  ) { 
    this.registerForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password_confirmation: new FormControl('', Validators.required)
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {}

  
  passwordsMatch(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  registerUser() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).then(res => {
        console.log('Usuario registrado:', res);
        this.errorMessage = '';
        this.navCtrl.navigateRoot('/login'); 
      }).catch(err => {
        console.error(err);
        this.errorMessage = 'Error al registrar. Inténtalo de nuevo.';
      });
    } else {
      console.log('Formulario no válido');
    }
  }
}
