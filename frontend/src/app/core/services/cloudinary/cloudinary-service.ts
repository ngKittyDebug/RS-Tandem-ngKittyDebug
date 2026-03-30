import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CloudinaryUploadResponse } from './models/cloudinary.interface';
import { Observable } from 'rxjs';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from './models/cloudinary.constants';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly http = inject(HttpClient);

  public uploadImage(file: File): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'avatars');

    return this.http.post<CloudinaryUploadResponse>(CLOUDINARY_UPLOAD_URL, formData);
  }
}
