import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Storage } from '@ionic/storage-angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AlertController } from '@ionic/angular';

defineCustomElements(window);

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage implements OnInit {
  user_data: any = {
    name: '',
    lastname: '', // Asegúrate de que esta propiedad exista en user_data
    email: '',
    image: '',
    followees: [],
    followers: []
  };

  isEditing = false; // Controla si el usuario está en modo de edición
  editedName = ''; // Almacena el nombre editado
  editedlastname = ''; // Almacena el apellido editado
  editedEmail = ''; // Almacena el email editado

  constructor(
    private userService: UserService,
    private storage: Storage,
    public alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.loadUserData();
  }

  // Carga los datos del usuario desde el almacenamiento
  async loadUserData() {
    let user: any = await this.storage.get('user');
    console.log(user, "usuario");
    this.userService.getUser(user.id).then(
      (data: any) => {
        console.log(data);
        this.storage.set('user', data);
        this.user_data = data;
      }
    ).catch(
      (error) => {
        console.log(error);
      });
  }

  // Inicia el modo de edición
  startEditing() {
    this.isEditing = true;
    this.editedName = this.user_data.name;
    this.editedlastname = this.user_data.lastname; // Copia el apellido actual
    this.editedEmail = this.user_data.email;
  }

  // Cancela la edición y restaura los valores originales
  cancelEditing() {
    this.isEditing = false;
    this.editedName = '';
    this.editedlastname = '';
    this.editedEmail = '';
  }

  // Guarda los cambios y actualiza el perfil
  async saveChanges() {
    this.user_data.name = this.editedName;
    this.user_data.lastname = this.editedlastname; // Actualiza el apellido
    this.user_data.email = this.editedEmail;
    this.isEditing = false;

    await this.update(); // Llama al método update para guardar los cambios en el servidor
  }

  // Actualiza la imagen del usuario
  async takePhoto(source: CameraSource) {
    console.log('Take Photo');
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: source,
      quality: 100
    });
    console.log(capturedPhoto.dataUrl);
    this.user_data.image = capturedPhoto.dataUrl;
    await this.update(); // Llama al método update para guardar la nueva imagen
  }

  // Actualiza los datos del usuario en el servidor
  async update() {
    this.userService.updateUser(this.user_data).then(
      (data) => {
        console.log(data);
        this.storage.set('user', this.user_data); // Actualiza el almacenamiento local
      }
    ).catch(
      (error) => {
        console.log(error);
      });
  }

  // Muestra las opciones para seleccionar una imagen (cámara o galería)
  async presentPhotoOptions() {
    const alert = await this.alertController.create({
      header: "Seleccione una opción",
      message: "¿De dónde desea obtener la imagen?",
      buttons: [
        {
          text: "Cámara",
          handler: () => {
            this.takePhoto(CameraSource.Camera);
          }
        },
        {
          text: "Galería",
          handler: () => {
            this.takePhoto(CameraSource.Photos);
          }
        },
        {
          text: "Cancelar",
          role: "cancel",
          handler: () => {
            console.log('Cancelado');
          }
        }
      ]
    });
    await alert.present();
  }
}