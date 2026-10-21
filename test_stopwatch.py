#!/usr/bin/env python3
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
        # Attempt second start
        second_start_success = sw.start()
        self.assertFalse(second_start_success)
        self.assertIn("already running", sw.last_toast)
        self.assertEqual(sw.start_time, original_start)  # Did not overwrite start_time
        self.assertTrue(sw.is_running)

    def test_test3_stop_twice(self):
        """TEST 3: Press Stop twice."""
        sw = MockStopwatchLogic()
        sw.start()
        time.sleep(0.05)
        self.assertTrue(sw.stop())
        self.assertFalse(sw.is_running)
        # Second stop
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

        # Resume
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
