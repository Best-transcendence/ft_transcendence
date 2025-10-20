FROM nginx:1.22-alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certs - see README how to do it on your machine
COPY certs/ /etc/nginx/certs/

# Expose both HTTP and HTTPS ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

