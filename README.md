# FSAD-Frontend

This repository contains the frontend for the FSAD project. It is containerized using Docker for easy deployment. You can build and run the project using Make (recommended), Docker directly, or run it locally if you prefer.

## Project Structure

- `Dockerfile` – Instructions to build the Docker image
- `Makefile` – Simplifies the build process
- `package.json` and related files – Project dependencies and scripts
- (Other source files)

## Installation & Usage

### 1. Using Make (Recommended)

Make sure you have Docker and Make installed.

```bash
make deploy
```

- This command builds a Docker image named `fsad-frontend`.
- To run the container after building:

```bash
docker run -p 3000:3000 fsad-frontend
```

- Open http://localhost:3000 in your browser.

### 2. Using Docker Directly

If you prefer not to use Make, you can build and run the Docker image manually:

```bash
docker build -t fsad-frontend .
docker run -p 3000:3000 fsad-frontend
```

### 3. Running Locally (Without Docker)

If you want to run the project without Docker, install the required dependencies as specified in your `package.json` and start the application:

```bash
npm install --force
npm start
```

- The application will be available at http://localhost:3000.

## Notes

- The application listens on port 3000 by default.
- If you make changes to the code, rebuild the Docker image to see the updates.
- If you encounter issues, make sure Docker is running and you have the necessary permissions.

## Why Docker?

Docker is not strictly required to run this project. It is provided as a convenience to ensure a consistent environment across different machines and to simplify deployment. You can always run the app directly on your system if you prefer.