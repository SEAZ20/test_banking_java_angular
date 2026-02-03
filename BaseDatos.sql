
CREATE DATABASE IF NOT EXISTS devsu_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE devsu_db;

-- =============================================

CREATE TABLE IF NOT EXISTS person (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    age INT,
    identification VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT UK_identification UNIQUE (identification)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS client (
    id BIGINT NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT UK_client_id UNIQUE (client_id),
    CONSTRAINT FK_client_person FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: account

CREATE TABLE IF NOT EXISTS account (
    id BIGINT NOT NULL AUTO_INCREMENT,
    account_number VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    initial_balance DOUBLE NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    client_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UK_account_number UNIQUE (account_number),
    CONSTRAINT FK_account_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================

CREATE TABLE IF NOT EXISTS movement (
    id BIGINT NOT NULL AUTO_INCREMENT,
    date DATETIME(6) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    value DOUBLE NOT NULL,
    balance DOUBLE NOT NULL,
    account_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_movement_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
