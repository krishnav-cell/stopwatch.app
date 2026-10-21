# CHRONO BLACK — Precision Animated Python Stopwatch

An engineered, high-precision desktop stopwatch application built in **Python 3** using **Tkinter** and Python's built-in `time.perf_counter()`. Featuring a futuristic black-and-neon cyberpunk aesthetic, hardware-level timing accuracy, non-blocking visual animations, and comprehensive state validation that prevents invalid stopwatch operations.

Designed and developed as a complete college computer science & software engineering project.

---

## 1. Problem Statement & Objectives

Develop a simple, reliable, and visually distinctive Stopwatch application in Python that satisfies the following core criteria:

1. **Measure Elapsed Time Accurately**: Use Python's built-in high-resolution timer (`time.perf_counter()`) to calculate the exact difference between start and stop timestamps.
2. **Four Main Operations**:
   - `START`: Begin or resume time measurement without resetting prior accumulated time.
   - `STOP`: Freeze measurement and preserve recorded elapsed time.
   - `DISPLAY`: Explicitly calculate and display the current reading in both the central display and status card.
   - `RESET`: Return accumulated time to `00:00:00.000` and restore default visual indicators.
3. **Prevent Invalid Operations**:
   - Disallow stopping before starting (`"Start the stopwatch before stopping it."`).
   - Disallow starting again while already running (`"Stopwatch is already running."`).
   - Disallow stopping twice when already stopped (`"Notice: Stopwatch is already stopped."`).
   - Informative notice when attempting to display time before starting.
4. **Non-Blocking Architecture**: Never use `time.sleep()` inside GUI loops. Maintain smooth 60fps animations and responsive button clicks using Tkinter's `root.after()` event scheduler.

---

## 2. Technology Stack & Design Decisions

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | Python 3 (3.8+) | Built-in standard library, portable, cross-platform. |
| **GUI Framework** | Tkinter | Native GUI toolkit bundled with standard Python distributions on Windows/macOS. |
| **Time Source** | `time.perf_counter()` | Highest-resolution monotonic clock in Python; immune to system clock adjustments and drift. |
| **Scheduler** | `widget.after()` | Cooperative non-blocking event-loop scheduling for ~15ms timer updates and ~20ms arc animations. |
| **Rendering** | `tk.Canvas` | Vector rendering of circular track, ticks, rotating neon cyan arc, and drifting particle field. |
| **Dependencies** | Standard Library Only | Zero external packages required (`tkinter`, `time`, `math`, `random`). |

---

## 3. Visual Design System (Black Theme)

The UI blends a digital sports chronometer with an electronic dashboard:

- **Dominant Canvas Background**: `#050505` (Deep space black)
- **Secondary Surfaces**: `#0B0B0F` (Dark charcoal)
- **Container / Cards**: `#101014` (Elevation surface)
- **Primary Neon Accent**: `#00F5FF` (Electric cyan for running indicator arc & timer glow)
- **Secondary Accent**: `#8B5CF6` (Neon violet for reset and controls)
- **State Colors**:
  - `READY`: `#92929D` (Neutral muted silver)
  - `RUNNING`: `#00FF88` (Vibrant neon green)
  - `STOPPED`: `#FFB020` (Warning amber)
  - `ERROR / WARNING`: `#FF4560` (Ruby red alerts)
- **Typography**: `Consolas` (monospaced tabular digits for timer) and `Segoe UI` (clean interface headers and buttons).

---

## 4. Architecture & Main Functions

The codebase uses a clean, object-oriented design encapsulated in the `ChronoBlackStopwatch` class:

### `__init__(self, root: tk.Tk)`
Initializes the root window (centered at 850×650px), establishes timing state variables (`start_time`, `elapsed_time`, `is_running`, `has_started_once`), constructs widgets, and initiates the ambient particle field.

### `start_stopwatch(self)`
- **Validation**: Checks `self.is_running`. If already running, displays a warning toast and aborts.
- **Timing**: Captures the initial `time.perf_counter()`.
- **State**: Sets `is_running = True`, transitions status to `RUNNING` (neon green), enhances the cyan timer glow, and initiates the high-frequency `update_timer()` and `animate_timer_arc()` loops.

### `stop_stopwatch(self)`
- **Validation**: Verifies `self.has_started_once` (prevents stopping before starting) and `self.is_running` (prevents double stopping).
- **Timing**: Accumulates elapsed interval: `self.elapsed_time += (time.perf_counter() - self.start_time)`.
- **State**: Cancels pending scheduled jobs, freezes the display and circular arc at their exact elapsed values, and sets status to `STOPPED` (amber).

### `display_time(self)`
- Explicitly queries the single source of truth for elapsed time.
- If running: `current = elapsed_time + (time.perf_counter() - start_time)`.
- If stopped: `current = elapsed_time`.
- Formats time and logs a reading to the telemetry status card.

### `reset_stopwatch(self)`
- Halts any active timer or arc callbacks.
- Resets `elapsed_time = 0.0`, `start_time = 0.0`, `is_running = False`, and `has_started_once = False`.
- Reverts the digital timer to `00:00:00.000` and the arc to angle `0°`.
- Sets status back to `READY`.

### `format_elapsed_time(seconds: float) -> str`
Converts raw floating-point seconds into zero-padded `HH:MM:SS.mmm` (hours, minutes, seconds, milliseconds) using integer division and modulo math for microsecond precision.

### `update_timer(self)`
Scheduled every ~15ms via `root.after(15, self.update_timer)`. Reads the actual clock from `time.perf_counter()`—**never assumes time by incrementing 0.01s**.

### `animate_timer_arc(self)`
Smoothly advances the decorative cyan arc angle (`self.arc_angle += 4.2°`) every ~20ms while running.

### `animate_particles(self)`
Animates 24 subtle background particles across the canvas. Reuses pre-created canvas IDs to avoid memory leaks.

### `on_close(self)`
Intercepts `WM_DELETE_WINDOW` and the `Escape` key. Deterministically cancels all pending `after()` callbacks using `root.after_cancel()` before destroying the window, preventing post-closure callback exceptions.

---

## 5. How to Run Locally in VS Code (Windows)

### Prerequisites
- Windows 10 or 11
- Python 3.8 or newer (ensure **"Add Python to PATH"** and **"tcl/tk and IDLE"** were checked during Python installation)
- Visual Studio Code with the **Python extension** (by Microsoft)

### Step-by-Step Instructions

1. **Clone or Download the Project**:
   Place `stopwatch.py` and `README.md` into a folder (e.g., `C:\Projects\ChronoBlack\`).

2. **Open the Folder in VS Code**:
   - Launch VS Code.
   - Go to **File** → **Open Folder...** and select `C:\Projects\ChronoBlack\`.

3. **Select Your Python Interpreter**:
   - Press `Ctrl + Shift + P` to open the Command Palette.
   - Type `Python: Select Interpreter` and press Enter.
   - Choose your installed Python 3 interpreter (e.g., `Python 3.11.x 64-bit`).

4. **Run the Application**:
   - Open `stopwatch.py` in the editor.
   - Press the **Play button** in the top right corner of VS Code, or open the integrated terminal (`Ctrl + ~`) and execute:
     ```bash
     python stopwatch.py
     ```

5. **Interact via Keyboard Shortcuts**:
   - `Space`: Toggle Start / Stop
   - `D`: Display current / recorded time
   - `R`: Reset stopwatch
   - `Escape`: Clean exit

---

## 6. Verification & Test Suite

Follow these explicit verification tests to validate all requirements:

| Test # | Action | Expected Output & Behavior | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- |
| **TEST 1** | Click `STOP` before clicking `START`. | Warning toast: *"Start the stopwatch before stopping it."* No crash. Status stays `READY`. Display stays `00:00:00.000`. | **PASS** |
| **TEST 2** | Click `START`, wait 1s, click `START` again while running. | Warning toast: *"Stopwatch is already running."* Second click rejected. Timer continues running smoothly from original timestamp without stutter or duplicate loops. | **PASS** |
| **TEST 3** | Click `STOP` when already stopped. | Warning toast: *"Notice: Stopwatch is already stopped."* Rejected gracefully. | **PASS** |
| **TEST 4** | Click `DISPLAY` before starting. | Toast: *"No time recorded. Press Start to begin."* | **PASS** |
| **TEST 5** | While running, click `RESET`. | Timer instantly stops, elapsed time clears, display returns to `00:00:00.000`, status returns to `READY`, arc returns to starting angle. | **PASS** |
| **TEST 6** | Click `START`, wait ~5.00 seconds against a phone timer, click `STOP`. | Display shows `00:00:05.xxx` within human reaction tolerance (~±0.1s). Time freezes accurately. | **PASS** |
| **TEST 7** | Click `START`, run for 3s, click `STOP`. Then click `START` again for 2s, click `STOP`. | Final display shows approximately `00:00:05.xxx` (3s + 2s accumulated). Prior time was preserved and resumed accurately. | **PASS** |
| **TEST 8** | Start stopwatch (animations active) and close window or press `Escape`. | Window closes immediately and cleanly with zero console traceback errors or callback warnings. | **PASS** |

---

## 7. Troubleshooting Common Errors

### 1. `ModuleNotFoundError: No module named 'tkinter'`
- **Cause**: On Linux (or some custom minimal Python installations), Tkinter is packaged separately.
- **Solution (Windows)**: Re-run the official Python Windows installer from [python.org](https://www.python.org/), choose **Modify**, and make sure **"tcl/tk and IDLE"** is checked.
- **Solution (Ubuntu/Debian)**: Run `sudo apt-get install python3-tk`.
- **Solution (macOS)**: Run `brew install python-tk` or use the official python.org macOS installer.

### 2. `'python' is not recognized as an internal or external command`
- **Cause**: Python was not added to your Windows system `PATH` environment variable.
- **Solution**: Run `py stopwatch.py` or re-install Python with the "Add Python to PATH" option checked.

### 3. Display flickers or numbers shift horizontally
- **Cause**: Non-monospaced fonts have variable character widths (e.g. `'1'` is narrower than `'8'`).
- **Solution**: The application explicitly enforces monospaced fonts (`Consolas` / `Courier New`) with zero-padded digits (`00:00:00.000`) so character dimensions remain strictly fixed.

### 4. Application freezes when left running
- **Cause**: Using `time.sleep()` blocks the Tkinter GUI thread.
- **Solution**: Chrono Black never calls `time.sleep()`. All updates are scheduled cooperatively through `root.after()`.

---

## 8. Deploying Web Simulator to Netlify

This repository comes pre-configured with `netlify.toml` and `public/_redirects` for 1-click Netlify hosting:

### Method A: Connect with Git (Recommended)
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Log into [Netlify](https://app.netlify.com/) and click **"Add new site"** &gt; **"Import an existing project"**.
3. Select your repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**. Your web stopwatch will be live instantly with global CDN caching and HTTPS.

### Method B: Netlify CLI
Run the following in the project root:
```bash
# 1. Build the production assets
npm run build

# 2. Deploy directly via Netlify CLI
npx netlify deploy --prod --dir=dist
```

### Method C: Netlify Drop (No CLI Required)
1. Run `npm run build` locally.
2. Open [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the generated `dist` folder into the browser window.

---

## 9. License & Academic Attribution
Developed as an open-source educational submission. Feel free to reference, study, and extend this precision timekeeping implementation.
