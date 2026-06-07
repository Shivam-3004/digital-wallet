-- V2: Create Audit Logs Schema

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details VARCHAR(1000),
    ip_address VARCHAR(255),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_email ON audit_logs(email);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
