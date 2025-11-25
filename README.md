# F3 Marietta Website

This is the official marketing website for F3 Marietta, a region of F3 Nation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (Recommended)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## Project Structure

- `src/app`: Application routes (Home, About, Workouts, etc.).
- `src/components/layout`: Global layout components (Navbar, Footer).
- `src/components/ui`: Reusable UI components (Button, Card, Hero, etc.).
- `src/lib`: Utility functions.

## Customization

### Adding New AOs
To add a new workout location, edit `src/app/workouts/page.tsx`. Add a new object to the `aos` array with the name, time, location, map link, and description.

### Updating Schedule
Edit the `time` field in the `aos` array in `src/app/workouts/page.tsx`.

### Changing Images
Place new images in the `public/images` folder and update the `backgroundImage` props in the page files (e.g., `src/app/page.tsx`, `src/app/about/page.tsx`).

## Note on Icons
Due to compatibility issues with the latest Next.js/React versions, icons (Lucide React) have been temporarily disabled and replaced with emoji placeholders. To restore them, ensure `lucide-react` is compatible with React 19 and uncomment the imports and usages in the components.
