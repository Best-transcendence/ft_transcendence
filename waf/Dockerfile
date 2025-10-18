FROM owasp/modsecurity:nginx

# Working directory
WORKDIR /etc/nginx

# Copy configfiles
COPY buffer.conf /etc/nginx/conf.d/buffer.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY exception-rules.conf /etc/nginx/modsec/exception-rules.conf

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
    CMD curl -f http://gateway-service:3003/health || exit 1

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
