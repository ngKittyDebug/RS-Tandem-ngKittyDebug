export const CLOUDINARY_API_HOST = 'api.cloudinary.com';
export const CLOUDINARY_CLOUD_NAME = import.meta.env['NG_APP_CLOUDINARY_CLOUD_NAME'];
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env['NG_APP_CLOUDINARY_UPLOAD_PRESET'];
export const CLOUDINARY_UPLOAD_URL = `${import.meta.env['NG_APP_CLOUDINARY_UPLOAD_URL']}/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
