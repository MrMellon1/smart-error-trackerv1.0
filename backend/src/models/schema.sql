CREATE DATABASE IF NOT EXISTS error_tracker;
USE error_tracker;

-- Projeler Tablosu (API Key ve Yetkilendirme için)
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hata Grupları (Issues) Tablosu
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  fingerprint VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  occurrence_count INT DEFAULT 1,
  status ENUM('open', 'resolved', 'ignored') DEFAULT 'open',
  ai_explanation TEXT,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tekil Hata Kayıtları (Errors) Tablosu
CREATE TABLE IF NOT EXISTS errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  issue_id INT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  url VARCHAR(255),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Performans için indeksler
CREATE INDEX idx_project_fingerprint ON issues(project_id, fingerprint);
CREATE INDEX idx_issue_id ON errors(issue_id);