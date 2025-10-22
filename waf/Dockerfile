FROM owasp/modsecurity:nginx

# Copy your nginx configuration and ModSecurity configuration into image
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY certs/ /etc/nginx/certs/

# Ensure logs directories exist
RUN mkdir -p /var/log/modsec /var/log/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
