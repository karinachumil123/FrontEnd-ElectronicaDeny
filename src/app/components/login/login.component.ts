import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginModel } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],// Importa FormsModule y CommonModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordType: string = 'password';
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  newPasswordType: string = 'password';
  confirmPasswordType: string = 'password';

  //Variables Modal Olvidar Contraseña
  mostrarModal = false;
  correoRecuperar: string = '';
  codigoEnviado: boolean = false;
  codigoVerificacion: string = '';
  codigoVerificado: boolean = false;
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  pasoActual: number = 1; 


  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.emailInvalid = !this.email;
    this.passwordInvalid = !this.password;
  
    if (this.emailInvalid || this.passwordInvalid) {
      return;
    }
  
    const loginData: LoginModel = { email: this.email, password: this.password };

    // Mostrar pantalla de carga
    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // Verificar que el token se haya guardado correctamente
        setTimeout(() => {
          const token = localStorage.getItem('token');
          console.log('Token stored in localStorage:', token ? 'Yes' : 'No');
          
          if (token) {
            // Cerrar pantalla de carga
            Swal.close();
            
            // Redirige a la página de inicio (home)
            this.router.navigate(['/home/inicio']);
          } else {
            // Si no se guardó el token
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo almacenar el token de autenticación',
            });
          }
        }, 100); // Pequeño retraso para asegurar que el almacenamiento se complete
      },
      error: (err) => {
        console.error('Login error:', err);
        
        Swal.close();
        
        // Manejo mejorado de errores que captura diferentes formatos de respuesta
        let errorTitle = 'Error de autenticación';
        let errorMessage = '';
        
        // Si el error es un objeto Error (del servicio auth)
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        // Si el error viene del backend con estructura específica
        else if (err?.error?.message) {
          errorMessage = err.error.message;
        }
        // Si el error tiene status code para interpretar
        else if (err?.status === 0) {
          errorMessage = 'Error de conexión: No se puede conectar al servidor.';
        } 
        else if (err?.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifique su correo y contraseña.';
        }
        else if (err?.status === 403) {
          errorMessage = 'Su cuenta no tiene permisos para acceder.';
        }
        else if (err?.status >= 500) {
          errorMessage = 'Error interno del servidor. Por favor, intente nuevamente más tarde.';
        }
        else {
          // Si ninguna de las condiciones anteriores coincide
          errorMessage = 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.';
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Método para alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  toggleNewPasswordVisibility() {
    this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
  }
  
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  abrirModal() {
    this.mostrarModal = true;
    this.pasoActual = 1;
    this.correoRecuperar = '';
    this.codigoVerificacion = '';
    this.codigoEnviado = false;
    this.codigoVerificado = false;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.correoRecuperar = '';
    this.codigoVerificacion = '';
    this.codigoEnviado = false;
    this.codigoVerificado = false;
    this.pasoActual = 1;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }

  enviarCodigo() {
    if (!this.correoRecuperar) {
      console.log('Correo vacío, mostrando error');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa un correo válido.'
      });
      return;
    }
  
    console.log('Mostrando pantalla de carga');
    Swal.fire({
      title: 'Enviando código...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    console.log('Enviando solicitud al backend con correo:', this.correoRecuperar);
  
    this.authService.enviarCodigoRecuperacion(this.correoRecuperar).subscribe({
      next: (res) => {
        console.log('✅ Respuesta del backend:', res);
        Swal.close();
  
        // Verificamos que la respuesta contiene el mensaje esperado
        if (res && res.mensaje === 'Código de recuperación enviado exitosamente') {
          console.log('Cambiando a paso 2');
          this.codigoEnviado = true;
          this.pasoActual = 2;
          Swal.fire({
            icon: 'success',
            title: 'Código enviado',
            text: 'Se envió un código de verificación a tu correo.'
          });
        } else {
          // Si la respuesta tiene otro mensaje, manejarlo como error
          console.error('Error en la respuesta del backend:', res);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.mensaje || 'Hubo un problema al procesar tu solicitud. Intenta nuevamente.'
          });
        }
      },
      error: (error) => {
        console.error('Error al enviar código:', error);
        Swal.close();
  
        // Manejar el error 404 específicamente
        if (error.status === 404) {
          Swal.fire({
            icon: 'error',
            title: 'Correo no encontrado',
            text: 'No se encontró un usuario con ese correo.'
          });
        } else {
          // Otros errores
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar el código. Intenta nuevamente.'
          });
        }
      }
    });
  }
  
  verificarCodigo() {
    if (!this.codigoVerificacion) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa el código de verificación.'
      });
      return;
    }
  
    Swal.fire({
      title: 'Verificando código...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    console.log('Verificando código con correo:', this.correoRecuperar, 'y código:', this.codigoVerificacion);
  
    this.authService.verificarCodigoRecuperacion(this.correoRecuperar, this.codigoVerificacion)
      .subscribe({
        next: (res) => {
          console.log('Respuesta del servidor (verificación exitosa):', res);
  
          // Aquí verificamos si la respuesta es el mensaje esperado
          if (res && res.message === 'Código verificado correctamente') {
            // Si el código es verificado correctamente, avanzamos al siguiente paso
            this.codigoVerificado = true;
            this.pasoActual = 3;
  
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Código verificado',
              text: 'Ahora puedes cambiar tu contraseña.'
            });
          } else {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Código incorrecto o expirado. Intenta nuevamente.'
            });
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          Swal.close();
  
          // Ahora, manejamos los errores de forma personalizada según el status.
          if (error.status === 400 || error.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Código incorrecto o expirado. Intenta nuevamente.'
            });
          } else if (error.status === 404) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Correo no encontrado. Verifica que el correo sea correcto.'
            });
          } else if (error.status === 500) {
            Swal.fire({
              icon: 'error',
              title: 'Error interno',
              text: 'Hubo un problema en el servidor. Intenta nuevamente más tarde.'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error desconocido',
              text: 'Hubo un error al verificar el código. Intenta nuevamente.'
            });
          }
        }
      });
  }
  
  
  

  cambiarContrasena() {
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor completa todos los campos.'
      });
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.'
      });
      return;
    }

    Swal.fire({
      title: 'Cambiando contraseña...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.cambiarContrasena(
      this.correoRecuperar,
      this.nuevaContrasena,
      this.codigoVerificacion
    ).subscribe({
      next: (res) => {
        console.log('Contraseña cambiada correctamente:', res);
        Swal.close();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
        });
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar la contraseña. Por favor intenta nuevamente.'
        });
      }
    });
  }
}