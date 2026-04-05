# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NG_APP_API_URL=http://localhost:4000
ARG NG_APP_CLOUDINARY_CLOUD_NAME=
ARG NG_APP_CLOUDINARY_UPLOAD_PRESET=
ARG NG_APP_CLOUDINARY_UPLOAD_URL=
ENV NG_APP_API_URL=${NG_APP_API_URL}
ENV NG_APP_CLOUDINARY_CLOUD_NAME=${NG_APP_CLOUDINARY_CLOUD_NAME}
ENV NG_APP_CLOUDINARY_UPLOAD_PRESET=${NG_APP_CLOUDINARY_UPLOAD_PRESET}
ENV NG_APP_CLOUDINARY_UPLOAD_URL=${NG_APP_CLOUDINARY_UPLOAD_URL}

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production
  
LABEL maintainer="MeowVault Team"
LABEL description="MeowVault Frontend (Angular SPA)"

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
