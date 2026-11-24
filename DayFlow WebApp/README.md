# DayFlow — Personal Routine & Productivity Manager (Web App Conversion)

**Course:** IT 105 – Application Development and Emerging Technologies  
**Project Type:** Final Project — Midterm Android App to Responsive Online Web App Conversion  

---

## 1. System Overview & Android-to-Web Conversion
**DayFlow** is a human-centered personal routine, task, habit, and note management application originally built as an Android mobile app and converted into a responsive, installable **Progressive Web App (PWA)** with integrated **Generative AI productivity assistance**.

### Core Functionalities Preserved & Adapted
| Module | Midterm Android Feature | Final Web App Implementation |
| :--- | :--- | :--- |
| **Public Home & Dashboard** | App splash & daily overview | Public landing page (`#screen-welcome`) + authenticated Home overview (`#view-home`) with live summary cards |
| **Tasks & Daily Routines** | Morning, Afternoon, Evening routines | Categorized routine planner with filter pills, pending counters, completion toggles, and notes |
| **Smart Alarm & Snooze** | Local Android AlarmManager & snooze | Live clock engine, Web Audio synthesized chimes, SpeechSynthesis voice reminders, 5/15/30/60m snooze, and **OS Push Notifications** |
| **Tactile Drum Focus Timer** | Scrollable wheel countdown timer | Pointer-drag & mouse-wheel hours/minutes/seconds drum (`#view-timer`) with customizable alarm sounds and saved quick-timer grid |
| **Habit Tracker & Streaks** | Daily habit progress & streaks | Incremental `+1` progress logging, overall completion bar, and consecutive streak tracking |
| **Folder-Based Quick Notes** | Categorized notes & search | Custom color-coded folders, pinned notes, real-time search, and **List / Grid / Card** view switcher |
| **Productivity Summary** | Weekly & monthly charts | Interactive Weekly/Monthly completion rate bar charts, best window detection, and trend metrics |
| **Recycle Bin** | Soft-delete recovery | Full trash bin (`#view-bin`) supporting one-click restore or permanent deletion for tasks and notes |

---

## 2. Technologies Used
* **Frontend Core:** Semantic HTML5, CSS3, Tailwind CSS (utility-first responsive layout & dark/light theming), Vanilla JavaScript (ES6+).
* **Client-Side Persistence:** Browser `localStorage` with per-account data isolation (`dayflow_users_v1`, `dayflow_data_v1_<email>`).
* **Multimedia & Accessibility:** Web Audio API (multi-tone alarm synthesizer), Web Speech API (`SpeechSynthesis` voice alerts), HTML5 Canvas (client-side avatar image cropping/compression).
* **Emerging Technologies Integrated:**
  1. **Progressive Web App (PWA) & Web Notifications API:** `manifest.json`, offline-first Service Worker (`sw.js`), standalone app install prompt (`beforeinstallprompt`), and OS-level push alerts (`Notification` API).
  2. **AI Smart Productivity Assistant (Generative AI):** Dual-mode AI planner (`#modal-ai-assistant`) supporting **Google Gemini API (`gemini-2.5-flash`)** live generation as well as a built-in **Smart Local Heuristic AI Planner** (works offline without an API key) to break down goals into Morning/Afternoon/Evening routine tasks or structured study notes.

---

## 3. Emerging Technology Justification (For Final Defense)
* **Why PWA + OS Web Notifications?** Since DayFlow originated as a native Android productivity app, converting it into a PWA allows users to install it directly onto desktop or mobile home screens, work offline via Service Worker caching (`sw.js`), and receive native OS notifications when alarms trigger.
* **Why AI Smart Breakdown & Note Generator?** Users often struggle to turn broad goals (e.g., *"Prepare for IT 105 Final Defense"*) into scheduled routines. The AI assistant automatically generates time-slotted tasks or study guides in one click.
* **Limitations & Mitigations:**
  * *Browser Notification & Audio Policies:* Browsers require explicit user permission for `Notification` alerts and user interaction before playing audio; DayFlow provides clear permission controls in **Profile & Settings** and a visual fullscreen alarm overlay fallback.
  * *Client-Side AI API Keys:* Calling Gemini directly from a static frontend requires user-supplied keys; DayFlow solves this by including an offline-ready Smart Local AI engine so all AI features work reliably during live demonstrations even without internet or API keys.

---

## 4. Installation, Online Deployment & Access Instructions
### Running Locally
1. Extract `dayflow-webapp-v8.zip`.
2. Serve the `dayflow-webapp/` folder over HTTP/HTTPS (required for Service Worker & PWA features):
   * **VS Code Live Server:** Right-click `index.html` → **Open with Live Server**.
   * **Python:** Run `python -m http.server 8080` inside `dayflow-webapp/` and open `http://localhost:8080`.

### Deploying Online (GitHub Pages / Vercel / Netlify)
1. Push the contents of `dayflow-webapp/` (`index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `icons/`) to a GitHub repository.
2. Enable **GitHub Pages** (or import the repository into **Vercel** or **Netlify**) to obtain a live HTTPS URL.

---

## 5. Step-by-Step User Procedures
1. **Launch & Sign In:** Open the Home landing page and click **Instant Demo Login (Alex)** for pre-loaded data, or click **Get Started** to register a new account.
2. **Install as App & Enable Alerts:** Go to **Profile & Settings** → click **Enable Alerts** for OS notifications and **📲 Install App** to install DayFlow as a standalone PWA.
3. **Use AI Smart Assistant:** Click **✨ AI Smart Plan** on the Home dashboard (or **✨ AI Smart Breakdown** in Tasks / **✨ AI Note** in Notes), enter a goal, preview the generated tasks or note, and click **Add All to My Workspace**.
4. **Manage Daily Workflow:** Use **Tasks & Routine** to schedule alarms, **Focus Timer** to drag-adjust countdowns, **Habit Tracker** to log streaks, **Quick Notes** to organize folders, and **Recycle Bin** to recover deleted items.
