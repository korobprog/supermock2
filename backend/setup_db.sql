-- Создание пользователя postgres
CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;

-- Создание базы данных mock_interview
CREATE DATABASE mock_interview OWNER postgres;

-- Предоставление всех привилегий
GRANT ALL PRIVILEGES ON DATABASE mock_interview TO postgres;