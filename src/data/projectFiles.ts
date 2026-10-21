/**
 * Project file contents for the Chrono Black college submission.
 * Allows 1-click preview, copy, and download directly from the web interface.
 */

export const STOPWATCH_PYTHON_CODE = `#!/usr/bin/env python3
"""
=============================================================================
PROJECT: CHRONO BLACK — ANIMATED PYTHON STOPWATCH
PRECISION TIMEKEEPING SYSTEM
=============================================================================
A premium, black-themed, animated desktop stopwatch built with Python 3 and Tkinter.
Features microsecond-accurate timekeeping using time.perf_counter(), smooth Canvas
animations, multi-phase invalid operation prevention, and zero external dependencies.

Requirements:
- Python 3.8+
- Tkinter (standard library)

Execution:
    python stopwatch.py
=============================================================================
"""

import math
import random
import time
try:
    import tkinter as tk
    from tkinter import font as tkfont
    TKINTER_AVAILABLE = True
except ImportError:
    tk = None
    tkfont = None
    TKINTER_AVAILABLE = False


class ChronoBlackStopwatch:
    """
    Main application controller for Chrono Black Stopwatch.
    
    Manages:
    - Accurate elapsed time measurement with time.perf_counter()
    - Strict state transitions (READY, RUNNING, STOPPED)
    - High-frequency UI timer refresh loop (~15ms)
    - Canvas-rendered rotating neon circular indicator
    - Ambient background particle field
    - Invalid operation warnings and notifications
    - Safe callback lifecycle management (cancellation on shutdown)
    """

    # -------------------------------------------------------------------------
    # Color Palette Specifications
    # -------------------------------------------------------------------------
    COLOR_BG_MAIN = "#050505"         # Dominant deep black
    COLOR_BG_SECONDARY = "#0B0B0F"    # Subtle secondary dark surface
    COLOR_BG_CARD = "#101014"         # Surface card background
    COLOR_BORDER_SUBTLE = "#1C1C24"   # Hairline boundary
    COLOR_NEON_CYAN = "#00F5FF"       # Primary electric accent
    COLOR_NEON_CYAN_DIM = "#005566"   # Dim cyan for tracks/particles
    COLOR_NEON_VIOLET = "#8B5CF6"     # Secondary accent
    COLOR_SUCCESS = "#00FF88"         # Running status neon green
    COLOR_WARNING = "#FFB020"         # Stopped status amber
    COLOR_ERROR = "#FF4560"           # Invalid operation ruby red
    COLOR_TEXT_MAIN = "#FFFFFF"       # Bright white
    COLOR_TEXT_MUTED = "#92929D"      # Secondary muted gray

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("CHRONO BLACK | Stopwatch")
        self.root.configure(bg=self.COLOR_BG_MAIN)
        self.root.minsize(780, 620)

        # Center the 850x650 window on the user's display
        self._center_window(850, 650)

        # ---------------------------------------------------------------------
        # Core State & Timing Variables (Single Source of Truth)
        # ---------------------------------------------------------------------
        self.start_time: float = 0.0
        self.elapsed_time: float = 0.0
        self.is_running: bool = False
        self.has_started_once: bool = False  # Distinguishes pristine state from stopped
        self.last_recorded_time_str: str = "00:00:00.000"

        # Scheduled after() job identifiers for deterministic cleanup
        self.update_job: str | None = None
        self.animation_job: str | None = None
        self.particle_job: str | None = None
        self.toast_job: str | None = None

        # Visual animation parameters
        self.arc_angle: float = 0.0            # Current rotation angle of arc (degrees)
        self.arc_speed: float = 4.2            # Degrees to advance per animation tick
        self.pulse_phase: float = 0.0          # For pulsing neon glow while running
        self.particles = []                    # List of particle state dictionaries

        # Construct GUI widgets and initialize background effects
        self.create_widgets()
        self.init_particles(count=26)
        self.bind_events()

        # Start lightweight background particle animation immediately
        self.animate_particles()

    # -------------------------------------------------------------------------
    # Window Layout & Sizing
    # -------------------------------------------------------------------------
    def _center_window(self, width: int, height: int):
        """Calculates screen coordinates to place the application window dead center."""
        self.root.update_idletasks()
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        pos_x = max(0, int((screen_w - width) / 2))
        pos_y = max(0, int((screen_h - height) / 2))
        self.root.geometry(f"{width}x{height}+{pos_x}+{pos_y}")

    # -------------------------------------------------------------------------
    # Widget Construction
    # -------------------------------------------------------------------------
    def create_widgets(self):
        """Builds all visual elements adhering to the premium black aesthetic."""
        # Top Header Section
        self.header_frame = tk.Frame(self.root, bg=self.COLOR_BG_MAIN)
        self.header_frame.pack(fill="x", padx=30, pady=(24, 6))

        self.lbl_title = tk.Label(
            self.header_frame,
            text="CHRONO BLACK",
            font=("Segoe UI", 20, "bold"),
            fg=self.COLOR_TEXT_MAIN,
            bg=self.COLOR_BG_MAIN,
            letterspacing=2 if hasattr(tkfont, "Font") else None
        )
        self.lbl_title.pack(anchor="center")

        self.lbl_subtitle = tk.Label(
            self.header_frame,
            text="PRECISION TIMEKEEPING SYSTEM",
            font=("Segoe UI", 8, "bold"),
            fg=self.COLOR_TEXT_MUTED,
            bg=self.COLOR_BG_MAIN
        )
        self.lbl_subtitle.pack(anchor="center", pady=(2, 8))

        # Thin Neon Cyan Accent Divider Line
        self.header_line = tk.Frame(self.header_frame, height=2, bg=self.COLOR_NEON_CYAN)
        self.header_line.pack(fill="x", padx=120)

        # Toast / Status Warning Bar (for invalid operation feedback)
        self.toast_frame = tk.Frame(self.root, bg=self.COLOR_BG_MAIN, height=26)
        self.toast_frame.pack(fill="x", padx=40, pady=(6, 0))
        self.toast_frame.pack_propagate(False)

        self.lbl_toast = tk.Label(
            self.toast_frame,
            text="System Initialized — Ready for Precision Timing",
            font=("Segoe UI", 9),
            fg=self.COLOR_TEXT_MUTED,
            bg=self.COLOR_BG_MAIN
        )
        self.lbl_toast.pack(fill="both", expand=True)

        # Center Stage: Canvas for Circular Arc, Glow, and Monospaced Timer
        self.canvas_w = 460
        self.canvas_h = 280
        self.center_canvas = tk.Canvas(
            self.root,
            width=self.canvas_w,
            height=self.canvas_h,
            bg=self.COLOR_BG_MAIN,
            highlightthickness=0,
            bd=0
        )
        self.center_canvas.pack(pady=(4, 10))

        self._draw_initial_canvas_elements()

        # Status & Telemetry Information Card
        self.status_card = tk.Frame(
            self.root,
            bg=self.COLOR_BG_CARD,
            highlightthickness=1,
            highlightbackground=self.COLOR_BORDER_SUBTLE,
            padx=20,
            pady=10
        )
        self.status_card.pack(pady=(0, 16))

        # Horizontal Row inside Status Card
        self.status_inner = tk.Frame(self.status_card, bg=self.COLOR_BG_CARD)
        self.status_inner.pack()

        # Status indicator circle + label
        self.canvas_status_dot = tk.Canvas(
            self.status_inner,
            width=14,
            height=14,
            bg=self.COLOR_BG_CARD,
            highlightthickness=0,
            bd=0
        )
        self.canvas_status_dot.pack(side="left", padx=(0, 8))
        self.status_dot_id = self.canvas_status_dot.create_oval(
            2, 2, 12, 12, fill=self.COLOR_TEXT_MUTED, outline=""
        )

        self.lbl_status_tag = tk.Label(
            self.status_inner,
            text="STATUS:",
            font=("Segoe UI", 9, "bold"),
            fg=self.COLOR_TEXT_MUTED,
            bg=self.COLOR_BG_CARD
        )
        self.lbl_status_tag.pack(side="left", padx=(0, 4))

        self.lbl_status_val = tk.Label(
            self.status_inner,
            text="READY",
            font=("Segoe UI", 9, "bold"),
            fg=self.COLOR_TEXT_MUTED,
            bg=self.COLOR_BG_CARD
        )
        self.lbl_status_val.pack(side="left", padx=(0, 20))

        # Vertical Divider inside Status Card
        tk.Frame(
            self.status_inner, width=1, height=16, bg=self.COLOR_BORDER_SUBTLE
        ).pack(side="left", padx=(0, 20))

        # Last Recorded Time
        self.lbl_last_time_tag = tk.Label(
            self.status_inner,
            text="LAST RECORDED TIME:",
            font=("Segoe UI", 9, "bold"),
            fg=self.COLOR_TEXT_MUTED,
            bg=self.COLOR_BG_CARD
        )
        self.lbl_last_time_tag.pack(side="left", padx=(0, 6))

        self.lbl_last_time_val = tk.Label(
            self.status_inner,
            text="00:00:00.000",
            font=("Consolas", 10, "bold"),
            fg=self.COLOR_TEXT_MAIN,
            bg=self.COLOR_BG_CARD
        )
        self.lbl_last_time_val.pack(side="left")

        # Four Main Operations Control Bar: START | STOP | DISPLAY | RESET
        self.button_frame = tk.Frame(self.root, bg=self.COLOR_BG_MAIN)
        self.button_frame.pack(pady=(0, 14))

        self.btn_start = self._create_cyber_button(
            self.button_frame,
            text="START",
            command=self.start_stopwatch,
            accent_color=self.COLOR_SUCCESS,
            width=11
        )
        self.btn_start.pack(side="left", padx=8)

        self.btn_stop = self._create_cyber_button(
            self.button_frame,
            text="STOP",
            command=self.stop_stopwatch,
            accent_color=self.COLOR_ERROR,
            width=11
        )
        self.btn_stop.pack(side="left", padx=8)

        self.btn_display = self._create_cyber_button(
            self.button_frame,
            text="DISPLAY",
            command=self.display_time,
            accent_color=self.COLOR_NEON_CYAN,
            width=11
        )
        self.btn_display.pack(side="left", padx=8)

        self.btn_reset = self._create_cyber_button(
            self.button_frame,
            text="RESET",
            command=self.reset_stopwatch,
            accent_color=self.COLOR_NEON_VIOLET,
            width=11
        )
        self.btn_reset.pack(side="left", padx=8)

        # Keyboard Shortcuts Hint Strip (Quiet and Clean)
        self.footer_frame = tk.Frame(self.root, bg=self.COLOR_BG_MAIN)
        self.footer_frame.pack(side="bottom", fill="x", pady=(0, 16))

        hints_text = "SHORTCUTS:  [Space] Start / Stop   ·   [D] Display Time   ·   [R] Reset   ·   [Esc] Exit"
        self.lbl_hints = tk.Label(
            self.footer_frame,
            text=hints_text,
            font=("Segoe UI", 8),
            fg="#555562",
            bg=self.COLOR_BG_MAIN
        )
        self.lbl_hints.pack(anchor="center")

    def _create_cyber_button(self, parent, text: str, command, accent_color: str, width: int = 10) -> tk.Button:
        """Constructs a responsive button with hover highlight and active styling."""
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=("Segoe UI", 10, "bold"),
            fg=self.COLOR_TEXT_MAIN,
            bg=self.COLOR_BG_CARD,
            activeforeground=self.COLOR_BG_MAIN,
            activebackground=accent_color,
            bd=1,
            relief="solid",
            highlightthickness=1,
            highlightbackground=self.COLOR_BORDER_SUBTLE,
            cursor="hand2",
            width=width,
            pady=8
        )

        def on_enter(e):
            if btn["state"] != "disabled":
                btn.configure(
                    highlightbackground=accent_color,
                    fg=accent_color,
                    bg="#16161D"
                )

        def on_leave(e):
            if btn["state"] != "disabled":
                btn.configure(
                    highlightbackground=self.COLOR_BORDER_SUBTLE,
                    fg=self.COLOR_TEXT_MAIN,
                    bg=self.COLOR_BG_CARD
                )

        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)
        return btn

    def _draw_initial_canvas_elements(self):
        """Pre-draws reusable Canvas objects to prevent runtime allocation."""
        cx = self.canvas_w / 2
        cy = self.canvas_h / 2
        radius = 110

        # Circular Track Background
        self.center_canvas.create_oval(
            cx - radius, cy - radius, cx + radius, cy + radius,
            fill=self.COLOR_BG_SECONDARY,
            outline=self.COLOR_BORDER_SUBTLE,
            width=2,
            tags="track_bg"
        )

        # Decorative Radial Tick Marks (60 ticks like an analog stopwatch)
        for i in range(60):
            angle_rad = math.radians(i * 6)
            is_major = (i % 5 == 0)
            inner_r = radius - (10 if is_major else 5)
            outer_r = radius - 3
            x1 = cx + inner_r * math.cos(angle_rad)
            y1 = cy + inner_r * math.sin(angle_rad)
            x2 = cx + outer_r * math.cos(angle_rad)
            y2 = cy + outer_r * math.sin(angle_rad)
            tick_color = self.COLOR_NEON_CYAN_DIM if is_major else "#1C1C24"
            self.center_canvas.create_line(x1, y1, x2, y2, fill=tick_color, width=1, tags="ticks")

        # Rotating Neon Cyan Running Arc Indicator
        arc_inset = 6
        self.arc_id = self.center_canvas.create_arc(
            cx - (radius - arc_inset),
            cy - (radius - arc_inset),
            cx + (radius - arc_inset),
            cy + (radius - arc_inset),
            start=0,
            extent=90,
            style="arc",
            outline=self.COLOR_NEON_CYAN,
            width=3,
            tags="running_arc"
        )

        # Glow Layer for Large Monospaced Digital Timer
        self.timer_glow_id = self.center_canvas.create_text(
            cx, cy,
            text="00:00:00.000",
            font=("Consolas", 32, "bold"),
            fill=self.COLOR_NEON_CYAN_DIM,
            tags="timer_glow"
        )

        # Primary Crisp Monospaced Timer Digits
        self.timer_text_id = self.center_canvas.create_text(
            cx, cy,
            text="00:00:00.000",
            font=("Consolas", 32, "bold"),
            fill=self.COLOR_TEXT_MAIN,
            tags="timer_main"
        )

        # Mode Indicator Microtext below time
        self.mode_text_id = self.center_canvas.create_text(
            cx, cy + 42,
            text="ELAPSED TIME",
            font=("Segoe UI", 7, "bold"),
            fill=self.COLOR_TEXT_MUTED,
            tags="timer_mode"
        )

    def init_particles(self, count: int = 24):
        """Initializes tiny, subtle cyan particles to drift across the Canvas background."""
        self.particles.clear()
        for _ in range(count):
            px = random.uniform(20, self.canvas_w - 20)
            py = random.uniform(20, self.canvas_h - 20)
            vx = random.uniform(-0.35, 0.35)
            vy = random.uniform(-0.35, 0.35)
            size = random.uniform(1.2, 2.4)
            color = random.choice(["#003344", "#004855", "#0a2b38"])
            item_id = self.center_canvas.create_oval(
                px, py, px + size, py + size,
                fill=color,
                outline="",
                tags="particle"
            )
            self.center_canvas.tag_lower(item_id, "track_bg")
            self.particles.append({
                "id": item_id,
                "x": px,
                "y": py,
                "vx": vx,
                "vy": vy,
                "size": size
            })

    def animate_particles(self):
        """Updates particle positions periodically. Reuses Canvas IDs to prevent leaks."""
        try:
            for p in self.particles:
                p["x"] += p["vx"]
                p["y"] += p["vy"]

                if p["x"] <= 10 or p["x"] >= self.canvas_w - 10:
                    p["vx"] *= -1
                if p["y"] <= 10 or p["y"] >= self.canvas_h - 10:
                    p["vy"] *= -1

                self.center_canvas.coords(
                    p["id"],
                    p["x"], p["y"],
                    p["x"] + p["size"], p["y"] + p["size"]
                )

            self.particle_job = self.root.after(50, self.animate_particles)
        except tk.TclError:
            pass

    def start_stopwatch(self):
        """Operation 1: START"""
        if self.is_running:
            self.show_toast("Warning: Stopwatch is already running.", self.COLOR_WARNING)
            return

        self.start_time = time.perf_counter()
        self.is_running = True
        self.has_started_once = True

        self.update_status("RUNNING", self.COLOR_SUCCESS)
        self.show_toast("Stopwatch running — measuring elapsed time.", self.COLOR_SUCCESS)

        self.center_canvas.itemconfig(self.timer_glow_id, fill=self.COLOR_NEON_CYAN)

        if self.update_job is None:
            self.update_timer()
        if self.animation_job is None:
            self.animate_timer_arc()

    def stop_stopwatch(self):
        """Operation 2: STOP"""
        if not self.has_started_once:
            self.show_toast("Warning: Start the stopwatch before stopping it.", self.COLOR_ERROR)
            return

        if not self.is_running:
            self.show_toast("Notice: Stopwatch is already stopped.", self.COLOR_WARNING)
            return

        self.elapsed_time += (time.perf_counter() - self.start_time)
        self.is_running = False

        if self.update_job is not None:
            self.root.after_cancel(self.update_job)
            self.update_job = None
        if self.animation_job is not None:
            self.root.after_cancel(self.animation_job)
            self.animation_job = None

        time_str = self.format_elapsed_time(self.elapsed_time)
        self.center_canvas.itemconfig(self.timer_text_id, text=time_str)
        self.center_canvas.itemconfig(self.timer_glow_id, text=time_str, fill=self.COLOR_NEON_CYAN_DIM)
        self.last_recorded_time_str = time_str
        self.lbl_last_time_val.configure(text=time_str)

        self.update_status("STOPPED", self.COLOR_WARNING)
        self.show_toast(f"Stopwatch stopped at {time_str}.", self.COLOR_WARNING)

    def display_time(self):
        """Operation 3: DISPLAY"""
        if not self.has_started_once and self.elapsed_time == 0.0:
            self.show_toast("No time recorded. Press Start to begin.", self.COLOR_TEXT_MUTED)
            return

        if self.is_running:
            current_time = self.elapsed_time + (time.perf_counter() - self.start_time)
        else:
            current_time = self.elapsed_time

        formatted = self.format_elapsed_time(current_time)
        self.center_canvas.itemconfig(self.timer_text_id, text=formatted)
        self.center_canvas.itemconfig(self.timer_glow_id, text=formatted)
        self.last_recorded_time_str = formatted
        self.lbl_last_time_val.configure(text=formatted)

        state_label = "Running" if self.is_running else "Recorded"
        self.show_toast(f"{state_label} reading captured: {formatted}", self.COLOR_NEON_CYAN)

    def reset_stopwatch(self):
        """Operation 4: RESET"""
        if self.update_job is not None:
            self.root.after_cancel(self.update_job)
            self.update_job = None
        if self.animation_job is not None:
            self.root.after_cancel(self.animation_job)
            self.animation_job = None

        self.is_running = False
        self.has_started_once = False
        self.elapsed_time = 0.0
        self.start_time = 0.0
        self.arc_angle = 0.0

        self.center_canvas.itemconfig(self.timer_text_id, text="00:00:00.000")
        self.center_canvas.itemconfig(self.timer_glow_id, text="00:00:00.000", fill=self.COLOR_NEON_CYAN_DIM)
        self.center_canvas.itemconfig(self.arc_id, start=0, extent=90)

        self.update_status("READY", self.COLOR_TEXT_MUTED)
        self.show_toast("Stopwatch reset to 00:00:00.000. Ready for new run.", self.COLOR_NEON_VIOLET)

    def update_timer(self):
        """High-precision refresh loop (~15ms) reading time.perf_counter()."""
        if not self.is_running:
            self.update_job = None
            return

        current_elapsed = self.elapsed_time + (time.perf_counter() - self.start_time)
        time_str = self.format_elapsed_time(current_elapsed)

        try:
            self.center_canvas.itemconfig(self.timer_text_id, text=time_str)
            self.center_canvas.itemconfig(self.timer_glow_id, text=time_str)
            self.update_job = self.root.after(15, self.update_timer)
        except tk.TclError:
            self.update_job = None

    def animate_timer_arc(self):
        """Smoothly rotates neon cyan arc while running."""
        if not self.is_running:
            self.animation_job = None
            return

        try:
            self.arc_angle = (self.arc_angle + self.arc_speed) % 360
            self.center_canvas.itemconfig(self.arc_id, start=self.arc_angle)
            self.animation_job = self.root.after(20, self.animate_timer_arc)
        except tk.TclError:
            self.animation_job = None

    @staticmethod
    def format_elapsed_time(seconds: float) -> str:
        """Converts floating seconds into standard HH:MM:SS.mmm format."""
        if seconds < 0:
            seconds = 0.0

        total_milliseconds = int(round(seconds * 1000))
        millis = total_milliseconds % 1000
        total_seconds = total_milliseconds // 1000
        secs = total_seconds % 60
        total_minutes = total_seconds // 60
        mins = total_minutes % 60
        hours = total_minutes // 60

        return f"{hours:02d}:{mins:02d}:{secs:02d}.{millis:03d}"

    def update_status(self, status_name: str, color: str):
        self.lbl_status_val.configure(text=status_name, fg=color)
        self.canvas_status_dot.itemconfig(self.status_dot_id, fill=color)

    def show_toast(self, message: str, color: str = None):
        if color is None:
            color = self.COLOR_TEXT_MAIN
        self.lbl_toast.configure(text=message, fg=color)

        if self.toast_job is not None:
            try:
                self.root.after_cancel(self.toast_job)
            except Exception:
                pass
            self.toast_job = None

        def revert():
            try:
                self.lbl_toast.configure(
                    text="CHRONO BLACK Precision System Active",
                    fg=self.COLOR_TEXT_MUTED
                )
            except Exception:
                pass

        self.toast_job = self.root.after(4000, revert)

    def bind_events(self):
        self.root.bind("<space>", lambda event: self._toggle_start_stop())
        self.root.bind("<d>", lambda event: self.display_time())
        self.root.bind("<D>", lambda event: self.display_time())
        self.root.bind("<r>", lambda event: self.reset_stopwatch())
        self.root.bind("<R>", lambda event: self.reset_stopwatch())
        self.root.bind("<Escape>", lambda event: self.on_close())
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def _toggle_start_stop(self):
        if self.is_running:
            self.stop_stopwatch()
        else:
            self.start_stopwatch()

    def on_close(self):
        for job_attr in ("update_job", "animation_job", "particle_job", "toast_job"):
            job_id = getattr(self, job_attr, None)
            if job_id is not None:
                try:
                    self.root.after_cancel(job_id)
                except Exception:
                    pass
                setattr(self, job_attr, None)

        try:
            self.root.destroy()
        except Exception:
            pass


def main():
    if not TKINTER_AVAILABLE:
        print("=" * 60)
        print("CHRONO BLACK — PRECISION TIMEKEEPING SYSTEM")
        print("=" * 60)
        print("ERROR: Python Tkinter is not installed on this system.")
        print("\\nSolutions:")
        print("  - Windows: Re-run python-installer and select 'tcl/tk and IDLE'.")
        print("  - Ubuntu/Debian: sudo apt-get install python3-tk")
        print("  - macOS: brew install python-tk")
        print("=" * 60)
        return

    root = tk.Tk()
    root.configure(bg="#050505")
    app = ChronoBlackStopwatch(root)
    root.mainloop()


if __name__ == "__main__":
    main()
`;

export const TEST_PYTHON_CODE = `#!/usr/bin/env python3
"""
Unit tests for Chrono Black Stopwatch timing logic and state validation.
Can run headless on any Python 3 environment without Tkinter graphical display.
"""

import unittest
import time
from stopwatch import ChronoBlackStopwatch


class MockStopwatchLogic:
    """
    Headless representation of ChronoBlackStopwatch logic to test time calculation,
    pause/resume persistence, and invalid state transitions without requiring X11/Tkinter.
    """
    def __init__(self):
        self.start_time: float = 0.0
        self.elapsed_time: float = 0.0
        self.is_running: bool = False
        self.has_started_once: bool = False
        self.last_status: str = "READY"
        self.last_toast: str = ""

    def start(self):
        if self.is_running:
            self.last_toast = "Warning: Stopwatch is already running."
            return False
        self.start_time = time.perf_counter()
        self.is_running = True
        self.has_started_once = True
        self.last_status = "RUNNING"
        self.last_toast = "Stopwatch running"
        return True

    def stop(self):
        if not self.has_started_once:
            self.last_toast = "Warning: Start the stopwatch before stopping it."
            return False
        if not self.is_running:
            self.last_toast = "Notice: Stopwatch is already stopped."
            return False
        self.elapsed_time += (time.perf_counter() - self.start_time)
        self.is_running = False
        self.last_status = "STOPPED"
        self.last_toast = "Stopwatch stopped"
        return True

    def get_current_elapsed(self) -> float:
        if self.is_running:
            return self.elapsed_time + (time.perf_counter() - self.start_time)
        return self.elapsed_time

    def reset(self):
        self.is_running = False
        self.has_started_once = False
        self.elapsed_time = 0.0
        self.start_time = 0.0
        self.last_status = "READY"
        self.last_toast = "Reset to zero"


class TestChronoBlackLogic(unittest.TestCase):
    def test_format_elapsed_time(self):
        """Verify standard formatting across various durations."""
        self.assertEqual(ChronoBlackStopwatch.format_elapsed_time(0.0), "00:00:00.000")
        self.assertEqual(ChronoBlackStopwatch.format_elapsed_time(5.123), "00:00:05.123")
        self.assertEqual(ChronoBlackStopwatch.format_elapsed_time(65.456), "00:01:05.456")
        self.assertEqual(ChronoBlackStopwatch.format_elapsed_time(3661.789), "01:01:01.789")
        self.assertEqual(ChronoBlackStopwatch.format_elapsed_time(-10.0), "00:00:00.000")

    def test_test1_stop_before_start(self):
        """TEST 1: Press Stop before pressing Start."""
        sw = MockStopwatchLogic()
        success = sw.stop()
        self.assertFalse(success)
        self.assertIn("Start the stopwatch before stopping it", sw.last_toast)
        self.assertEqual(sw.elapsed_time, 0.0)
        self.assertEqual(sw.last_status, "READY")

    def test_test2_start_twice(self):
        """TEST 2: Press Start twice while running."""
        sw = MockStopwatchLogic()
        self.assertTrue(sw.start())
        original_start = sw.start_time
        time.sleep(0.05)
        second_start_success = sw.start()
        self.assertFalse(second_start_success)
        self.assertIn("already running", sw.last_toast)
        self.assertEqual(sw.start_time, original_start)
        self.assertTrue(sw.is_running)

    def test_test3_stop_twice(self):
        """TEST 3: Press Stop twice."""
        sw = MockStopwatchLogic()
        sw.start()
        time.sleep(0.05)
        self.assertTrue(sw.stop())
        self.assertFalse(sw.is_running)
        second_stop = sw.stop()
        self.assertFalse(second_stop)
        self.assertIn("already stopped", sw.last_toast)

    def test_test4_pause_and_resume_accumulation(self):
        """TEST 7: Start, wait ~0.1s, Stop, then Start again for ~0.1s."""
        sw = MockStopwatchLogic()
        sw.start()
        time.sleep(0.1)
        sw.stop()
        first_elapsed = sw.elapsed_time
        self.assertGreater(first_elapsed, 0.08)

        sw.start()
        time.sleep(0.1)
        sw.stop()
        total_elapsed = sw.elapsed_time
        self.assertGreater(total_elapsed, first_elapsed + 0.08)

    def test_test5_reset_clears_state(self):
        """TEST 5: Press Reset while running."""
        sw = MockStopwatchLogic()
        sw.start()
        time.sleep(0.05)
        sw.reset()
        self.assertFalse(sw.is_running)
        self.assertFalse(sw.has_started_once)
        self.assertEqual(sw.elapsed_time, 0.0)
        self.assertEqual(sw.last_status, "READY")


if __name__ == "__main__":
    unittest.main()
`;
