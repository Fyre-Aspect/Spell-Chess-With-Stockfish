# Spell Chess with Stockfish

A modern chess application featuring a custom-built React/Next.js frontend and integrated Stockfish AI.

## Project Structure

-   **`frontend/`**: Next.js application (React, TypeScript, CSS Modules).
    -   **`src/lib/chess`**: Custom chess engine logic.
    -   **`src/app/api/move`**: Serverless API route acting as a proxy to Stockfish.

## Getting Started

### Prerequisites

-   Node.js (v18+)

### Start the Application

The entire application (frontend + AI proxy) runs within Next.js. You do **not** need Python.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

-   **Interactive Chess Board**: Fully custom implementation.
-   **Stockfish AI**: Play against the computer (Black). The Next.js API route handles communication with the Stockfish engine.
-   **Move Validation**: Client-side move validation for standard chess rules.
-   **Modern UI**: Clean, responsive design using CSS Modules.
