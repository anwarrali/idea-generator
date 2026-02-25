# 💡 AI-Powered Project Idea Generator

Generate detailed, structured project ideas or get a professional analysis for your own concept using the power of AI. This application helps developers, students, and innovators quickly move from an idea to a actionable plan with requirements, technology stacks, and step-by-step development roadmaps.

🔗 **Live Demo:** [https://idea-generator-i2z3.onrender.com/analyze](https://idea-generator-i2z3.onrender.com/analyze)

---

## ✨ Features

*   **Generate Random Ideas**: Select your areas of interest (like Web Dev, AI, Cybersecurity) and a difficulty level (Beginner to Advanced). The AI will generate a complete project concept for you.
*   **Analyze Your Own Idea**: Have a concept in mind? Describe it, and the AI will refine it into a professional project outline, complete with functional and non-functional requirements.
*   **Structured Output**: Every generated idea includes:
    *   A clear, concise **project idea**.
    *   Detailed **functional and non-functional requirements**.
    *   A list of recommended **technologies and tools**.
    *   A concrete **step-by-step development plan**.
*   **Clean, Responsive UI**: Built with a focus on usability, featuring smooth animations with AOS (Animate on Scroll).

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.
*   **Backend**: Node.js, Express.js.
*   **AI Integration**: OpenAI API (GPT-3.5 Turbo).
*   **Deployment**:
    *   Frontend & Backend: [Render](https://render.com/)
    *   *(Note: You can also deploy the frontend separately to Cloudflare Pages)*

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v16 or later)
*   npm (usually comes with Node.js)
*   An OpenAI API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install server dependencies**
    The project's root `package.json` should contain all necessary backend dependencies. Install them by running this command in the **root directory**:
    ```bash
    npm install
    ```
    This will install packages like `express`, `cors`, `dotenv`, `openai`, and `express-rate-limit`.

3.  **Set up environment variables**
    Create a `.env` file in the **root directory** of the project. Add your OpenAI API key and desired port:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    PORT=3000
    API_URL=http://localhost:3000
    ```

4.  **Run the server**
    Start the Node.js server from the root directory:
    ```bash
    npm start
    ```
    For development with auto-restart on file changes, you can use `nodemon`. If it's installed globally, run:
    ```bash
    nodemon src/server/server.js
    ```

5.  **Open the application**
    Once the server is running, open your web browser and navigate to `http://localhost:3000`.

## 👤 Author

*   **Anwar Ali (Anwar Roumanen)** - [GitHub Profile](https://github.com/anwarrali)

---

