# Spell Chess - Next.js Frontend

This is the new Next.js frontend for Spell Chess.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Run the backend:**
    Make sure the Python backend is running on port 8000.
    ```bash
    cd ../backend
    uvicorn main:app --reload
    ```

4.  **Open the game:**
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

-   **Custom Chess Engine:** Logic implemented in `src/lib/chess`.
-   **React Hooks:** Game state managed via `useChessGame`.
-   **CSS Modules:** Scoped styling for components.
-   **Stockfish Integration:** Connects to the backend for AI moves.
