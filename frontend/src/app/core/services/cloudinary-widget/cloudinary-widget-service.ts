import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
import { CloudinaryUploadResponse } from './models/cloudinary.interface';
import { Observable } from 'rxjs';

// export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Injectable({
  providedIn: 'root',
})
export class CloudinaryWidgetService {
  private readonly http = inject(HttpClient);

  private readonly cloudName = 'dteatn1v6';
  private readonly uploadPreset = 'test_preset';

  // public async uploadImage(file: File): Promise<CloudinaryUploadResponse> {
  public uploadImage(file: File): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'avatars');

    return this.http.post<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      formData,
      // { context: new HttpContext().set(SKIP_AUTH, true), },
    );

    //   const response: Response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //       contentType: 'multipart/form-data',
    //     }
    //   });

    //   const data: CloudinaryUploadResponse = await response.json();
    //   return data;
    // }
  }
}
