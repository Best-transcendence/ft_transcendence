FROM nginx:1.22-alpine

# Install curl and git (optional), and modsecurity dependencies if available
RUN apk add --no-cache curl ca-certificates

# Create directories for ModSecurity + CRS
RUN mkdir -p /etc/nginx/modsec \
    && mkdir -p /etc/nginx/modsec/crs

# Copy modsecurity config and CRS into image
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certs
COPY certs/ /etc/nginx/certs/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

