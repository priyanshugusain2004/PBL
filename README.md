LINK TO MY SITE: https://priyanshugusain2004.github.io/PBL/
# CPU Scheduling Visualizer

A modern, interactive web application to simulate and visualize various CPU scheduling algorithms. Built with React and Vite, this project helps you understand how different scheduling strategies work by providing step-by-step simulation, Gantt charts, and detailed process metrics.

## ✨ Features
- **Multiple Scheduling Algorithms:**
  - FCFS (First-Come, First-Served)
  - SJF (Shortest Job First, Preemptive & Non-Preemptive)
  - Priority Scheduling (Preemptive & Non-Preemptive)
  - Round Robin (RR)
  - HRRN (Highest Response Ratio Next)
  - MQS (Multi-level Queue Scheduling)
- **Interactive Process Input:** Add, edit, and remove processes with custom arrival time, burst time, and priority.
- **Step-by-Step Simulation:** Visualize the scheduling process in real time.
- **Gantt Chart Visualization:** See how processes are scheduled on the CPU timeline.
- **Detailed Metrics:** Turnaround time, waiting time, response time, CPU utilization, and throughput.
- **Beautiful UI:** Responsive and user-friendly interface.

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key (if using Gemini API)
Create a `.env.local` file and add:
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the development server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment

### Deploy to GitHub Pages
1. Install the deploy tool:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add to your `package.json`:
   ```json
   "homepage": "https://<your-username>.github.io/PBL",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Set the correct `base` in `vite.config.ts`:
   ```ts
   base: '/PBL/',
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```
5. Visit: `https://<your-username>.github.io/PBL/`

### Deploy to Vercel or Netlify
- Connect your GitHub repo and follow the platform instructions.
- For Vite, no extra config is needed for Vercel/Netlify.

## 📁 Project Structure
```
components/         # React components
services/           # Scheduling logic and services
App.tsx             # Main app entry
index.tsx           # React DOM entry
vite.config.ts      # Vite configuration
...
```

## 🛠️ Technologies Used
- React
- TypeScript
- Vite
- CSS/Styled Components

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.
