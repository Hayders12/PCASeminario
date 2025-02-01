import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Storage } from '@ionic/storage-angular';
import { ModalController, AlertController } from '@ionic/angular';

defineCustomElements(window);

@Component({
  selector: 'app-add-post-modal',
  templateUrl: './add-post-modal.page.html',
  styleUrls: ['./add-post-modal.page.scss'],
  standalone: false,
})
export class AddPostModalPage implements OnInit {
  post_image: string | undefined; // Almacena la URL de la imagen seleccionada
  addPostForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private storage: Storage,
    private modalController: ModalController,
    private alertController: AlertController // Agregamos AlertController
  ) {
    // Inicializa el formulario
    this.addPostForm = this.formBuilder.group({
      description: new FormControl('', Validators.required), // Descripción obligatoria
      image: new FormControl('', Validators.required), // Imagen obligatoria
    });
  }

  ngOnInit() {}

  // Método para abrir la cámara o la galería
  async uploadPhone() {
    const alert = await this.alertController.create({
      header: 'Selecciona una opción',
      message: '¿De dónde deseas obtener la imagen?',
      buttons: [
        {
          text: 'Cámara',
          handler: () => {
            this.takePhoto(CameraSource.Camera); // Abre la cámara
          },
        },
        {
          text: 'Galería',
          handler: () => {
            this.takePhoto(CameraSource.Photos); // Abre la galería
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  // Método para tomar una foto o seleccionar una imagen
  async takePhoto(source: CameraSource) {
    const capturedPhoto = await Camera.getPhoto({
      quality: 90, // Calidad de la imagen (0 a 100)
      allowEditing: false, // Permite editar la imagen (opcional)
      resultType: CameraResultType.DataUrl, // Devuelve la imagen como una URL de datos
      source: source, // Fuente de la imagen (cámara o galería)
    });

    // Asigna la imagen capturada a la variable post_image
    this.post_image = capturedPhoto.dataUrl;
    this.addPostForm.patchValue({
      image: this.post_image, // Actualiza el valor del campo 'image' en el formulario
    });
  }

  // Método para agregar el post
  async addPost(post_data: any) {
    console.log('Add Post');
    console.log(post_data);

    // Obtiene el usuario actual desde el almacenamiento
    const user = await this.storage.get('user');

    // Prepara los datos del post
    const post_param = {
      post: {
        description: post_data.description,
        image: post_data.image,
        user_id: user.id,
      },
    };

    console.log(post_param, 'post para enviar');

    // Envía el post al servicio
    this.postService.createPost(post_param).then(
      (data: any) => {
        console.log(data, 'post creado');

        data.user = {
          id: user.id,
          name: user.name,
          image: user.image || 'assets/images/default-avatar.jpeg',
        };

        this.postService.postCreated.emit(data);

        this.addPostForm.reset();
        this.post_image = undefined;
        this.modalController.dismiss();
      },
      (error) => {
        console.log(error, 'error');
      }
    );
  }
}