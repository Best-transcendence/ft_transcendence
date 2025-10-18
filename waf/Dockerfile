FROM owasp/modsecurity:nginx

# Working directory
WORKDIR /etc/nginx

# Copy configfiles
COPY nginx.conf /etc/nginx/nginx.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY exception-rules.conf /etc/nginx/modsec/exception-rules.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
