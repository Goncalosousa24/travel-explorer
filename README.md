# 🌍 Travel Explorer

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

A fully interactive, highly visual WebGL application designed to provide users with an immersive way to explore global travel destinations. Built as a Single Page Application (SPA), it combines 3D rendering with real-time data to deliver a premium, cinematic browsing experience.

## ✨ Key Features & Modules

The application is divided into several powerful modules, offering a comprehensive and interactive travel planning experience:

* 🌐 **Interactive 3D Globe:** Explore the world through a high-performance WebGL 3D globe (`react-globe.gl`). Features smooth camera flights, dynamic night skies, and clickable destination markers with multi-language support.
* ✈️ **Real-Time Context & Widgets:** Instantly access critical information for any destination. Includes live weather updates (OpenWeather API), local time zones, and a custom algorithm that calculates flight duration and distance from your current location.
* 📰 **Smart Local Guide & News:** Stay informed before you travel. Displays dynamic local news fetched via SerpAPI, alongside a practical guide detailing currency, plug types, water quality, tipping culture, and emergency numbers.
* 🎬 **Cinematic Scroll Experience:** Immersive destination pages powered by dynamic color extraction (`fast-average-color`). The background seamlessly adapts its gradient to match the visual identity of the current section as you scroll through history, geography, and nature.
* 🗺️ **360° Street View & Itineraries:** Walk the streets before you arrive using the integrated Google Maps Street View API. Includes an interactive day-by-day itinerary planner with integrated mapping.
* 🌍 **Multi-Language Support:** Fully localized application supporting English, Portuguese, and French, dynamically adapting all UI elements, destination descriptions, and practical guides.

## 📸 Screenshots

<div align="center">
  <img width="100%" alt="Travel Explorer - View 1" src="https://github.com/user-attachments/assets/e07970ae-61c3-411e-aa4f-32cf97e51eb2" />
  <br><br>
  <img width="100%" alt="Travel Explorer - View 2" src="https://github.com/user-attachments/assets/b5bfc07d-9d49-4f65-ad27-3415d983811e" />
  <br><br>
  <img width="100%" alt="Travel Explorer - View 3" src="https://github.com/user-attachments/assets/262197b2-c2e0-40ec-98f8-150f1fca7fe9" />
</div>

## 🛠️ Tech Stack & Architecture

This project was built with modern web development standards focusing on high performance and visual fidelity:

* **Framework:** [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
* **3D Rendering:** `react-globe.gl` (Three.js wrapper for interactive globes)
* **Animations:** GSAP (GreenSock) & Lottie (`lottie-react`)
* **State Management:** React Context API & Hooks
* **Data Integration:** Google Maps API (Places & Street View), OpenWeatherMap API, SerpAPI (Google News)
* **UI/UX Utilities:** `fast-average-color` (dynamic theming), CSS Modules, CSS Variables

## 🚀 How to Run the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Goncalosousa24/travel-explorer.git
   ```
2. **Environment Setup:**
   * Due to security reasons, API keys are ignored in this repository.
   * Duplicate the `.env.example` file, rename it to `.env`, and fill in your API keys:
     * `VITE_GOOGLE_MAPS_API_KEY`
     * `VITE_OPENWEATHER_API_KEY`
     * `VITE_SERPAPI_KEY`
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 👨‍💻 Author

**Gonçalo Sousa**
* GitHub: [@Goncalosousa24](https://github.com/Goncalosousa24)
