FROM nginx:stable-alpine

# Install ModSecurity
RUN apk add --no-cache nginx-mod-security curl

# Create directories for configs
RUN mkdir -p /etc/nginx/modsec/crs

# Copy configfiles
COPY nginx.conf /etc/nginx/nginx.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY exception-rules.conf /etc/nginx/modsec/exception-rules.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
