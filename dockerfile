FROM postgres:latest

# Create the postgres user if it doesn't exist
RUN if ! id -u postgres >/dev/null 2>&1; then \
    useradd -m -s /bin/bash postgres; \
    echo "postgres:postgres" | chpasswd; \
    chown -R postgres:postgres /var/lib/postgresql/data; \
    su - postgres -c "initdb -D /var/lib/postgresql/data --auth-local=peer --auth-host=md5"; \
    fi

# Start PostgreSQL
CMD ["postgres"]