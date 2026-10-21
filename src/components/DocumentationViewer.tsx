import React from 'react';
import { BookOpen, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export const DocumentationViewer: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-8 text-sm text-[#E0E0E6]">
      {/* Title & Introduction */}
      <div className="border-b border-[#1C1C24] pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00F5FF]/10 text-[#00F5FF] text-xs font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          COLLEGE PROGRAMMING PROJECT SUBMISSION
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CHRONO BLACK — Precision Animated Python Stopwatch
        </h1>
        <p className="text-sm text-[#92929D] mt-2 leading-relaxed">
          Complete project documentation, VS Code execution guide, function breakdown, and invariant testing verification.
        </p>
      </div>

      {/* Section 1: Original Problem Statement Fulfillment */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00FF88]" />
          1. Core Requirements & Logic Verification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#101014] border border-[#1C1C24] p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-[#00F5FF] uppercase">Accurate Time Measurement</h3>
            <p className="text-xs text-[#92929D] leading-relaxed">
              Uses Python's native <code className="text-[#00F5FF] bg-[#050505] px-1.5 py-0.5 rounded font-mono">time.perf_counter()</code> as the immutable source of truth. Elapsed time is calculated strictly as a timestamp delta, never approximated by repeating additions of 0.01s.
            </p>
          </div>

          <div className="bg-[#101014] border border-[#1C1C24] p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-[#8B5CF6] uppercase">Four Required Operations</h3>
            <p className="text-xs text-[#92929D] leading-relaxed">
              <strong className="text-white">START</strong>, <strong className="text-white">STOP</strong>, <strong className="text-white">DISPLAY</strong>, and <strong className="text-white">RESET</strong> are four distinct, dedicated functions with clear state validation, non-blocking asynchronous execution, and zero duplication.
            </p>
          </div>

          <div className="bg-[#101014] border border-[#1C1C24] p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-[#FFB020] uppercase">Invalid Operation Prevention</h3>
            <p className="text-xs text-[#92929D] leading-relaxed">
              Guards against stopping before starting, pressing start repeatedly while running, stopping twice, or displaying before measurement. Displays informative, non-crashing status feedback toasts.
            </p>
          </div>

          <div className="bg-[#101014] border border-[#1C1C24] p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-[#00FF88] uppercase">Zero GUI Freeze / Non-Blocking</h3>
            <p className="text-xs text-[#92929D] leading-relaxed">
              Zero use of <code className="text-[#FF4560] bg-[#050505] px-1 py-0.5 rounded font-mono">time.sleep()</code> in the main thread. All visual animations (circular arc, floating particles, digit updates) are scheduled via cooperative <code className="text-[#00FF88] bg-[#050505] px-1 py-0.5 rounded font-mono">root.after()</code> callbacks.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How to Run in VS Code on Windows */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00F5FF]" />
          2. VS Code & Local Setup Guide (Windows)
        </h2>

        <div className="bg-[#0B0B0F] border border-[#1C1C24] rounded-xl p-5 space-y-4">
          <ol className="space-y-3 text-xs leading-relaxed text-[#92929D] list-decimal list-inside">
            <li className="text-white">
              <span className="font-semibold text-white">Download Project Files:</span>
              <p className="text-[#92929D] ml-5 mt-1">
                Save <code className="text-[#00F5FF]">stopwatch.py</code> and <code className="text-[#00F5FF]">test_stopwatch.py</code> into a local folder (e.g. <code className="text-white bg-[#101014] px-1 rounded">C:\Users\YourName\ChronoBlack\</code>).
              </p>
            </li>
            <li className="text-white">
              <span className="font-semibold text-white">Open in Visual Studio Code:</span>
              <p className="text-[#92929D] ml-5 mt-1">
                Launch VS Code → Click <strong>File &gt; Open Folder</strong> → Select the folder containing <code className="text-[#00F5FF]">stopwatch.py</code>.
              </p>
            </li>
            <li className="text-white">
              <span className="font-semibold text-white">Select Python 3 Interpreter:</span>
              <p className="text-[#92929D] ml-5 mt-1">
                Press <kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[11px] font-mono text-white">Ctrl + Shift + P</kbd>, type <code className="text-white">Python: Select Interpreter</code>, and select your installed Python 3.8+ interpreter.
              </p>
            </li>
            <li className="text-white">
              <span className="font-semibold text-white">Execute the Application:</span>
              <p className="text-[#92929D] ml-5 mt-1">
                Open the VS Code Terminal (<kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[11px] font-mono text-white">Ctrl + ~</kbd>) and execute:
              </p>
              <div className="ml-5 mt-2 bg-[#050505] p-2.5 rounded-lg border border-[#1C1C24] font-mono text-xs text-[#00FF88] flex items-center justify-between">
                <span>python stopwatch.py</span>
                <span className="text-[10px] text-[#555562]">Windows PowerShell / CMD</span>
              </div>
            </li>
            <li className="text-white">
              <span className="font-semibold text-white">Run the Automated Unit Tests:</span>
              <div className="ml-5 mt-2 bg-[#050505] p-2.5 rounded-lg border border-[#1C1C24] font-mono text-xs text-[#00F5FF] flex items-center justify-between">
                <span>python test_stopwatch.py</span>
                <span className="text-[10px] text-[#555562]">Runs 6 invariant unit tests</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Section 3: Function Reference */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#8B5CF6]" />
          3. Function Architecture & Logic Reference
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
            <span className="font-mono font-bold text-[#00FF88]">start_stopwatch(self)</span>
            <p className="text-[#92929D] mt-1">
              Checks if <code className="text-white font-mono">is_running</code> is True; if so, displays a non-destructive warning and exits. Otherwise captures <code className="text-white font-mono">time.perf_counter()</code>, sets <code className="text-white font-mono">is_running = True</code>, and activates the ~15ms timer update and ~20ms arc animation loops.
            </p>
          </div>

          <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
            <span className="font-mono font-bold text-[#FF4560]">stop_stopwatch(self)</span>
            <p className="text-[#92929D] mt-1">
              Verifies <code className="text-white font-mono">has_started_once</code> and <code className="text-white font-mono">is_running</code>. Calculates and accumulates the difference: <code className="text-[#00F5FF] font-mono">elapsed_time += (time.perf_counter() - start_time)</code>. Cancels scheduled callbacks and freezes display.
            </p>
          </div>

          <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
            <span className="font-mono font-bold text-[#00F5FF]">display_time(self)</span>
            <p className="text-[#92929D] mt-1">
              Queries current accurate time from monotonic clock (if running) or reads stored elapsed time (if stopped). Updates the main central readout and the status telemetry card.
            </p>
          </div>

          <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
            <span className="font-mono font-bold text-[#8B5CF6]">reset_stopwatch(self)</span>
            <p className="text-[#92929D] mt-1">
              Cancels active loops, zeroes all time counters, resets the Canvas arc angle to 0, and restores status to READY.
            </p>
          </div>

          <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
            <span className="font-mono font-bold text-white">on_close(self)</span>
            <p className="text-[#92929D] mt-1">
              Guarantees clean exit by explicitly calling <code className="text-white font-mono">root.after_cancel()</code> on all scheduled jobs before invoking <code className="text-white font-mono">root.destroy()</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Troubleshooting Guide */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FFB020]" />
          4. Troubleshooting Common Errors
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-[#101014] border border-[#1C1C24] rounded-xl space-y-1">
            <span className="font-semibold text-white">Q: "No module named 'tkinter'"</span>
            <p className="text-[#92929D]">
              <strong>Windows:</strong> Rerun Python installer, click <strong>Modify</strong>, and check <strong>tcl/tk and IDLE</strong>.
              <br />
              <strong>Ubuntu/Debian:</strong> Run <code className="text-[#00F5FF] font-mono">sudo apt-get install python3-tk</code>.
            </p>
          </div>

          <div className="p-4 bg-[#101014] border border-[#1C1C24] rounded-xl space-y-1">
            <span className="font-semibold text-white">Q: "python is not recognized as an internal or external command"</span>
            <p className="text-[#92929D]">
              Try running <code className="text-[#00F5FF] font-mono">py stopwatch.py</code> instead, or reinstall Python with <strong>"Add Python to PATH"</strong> enabled.
            </p>
          </div>

          <div className="p-4 bg-[#101014] border border-[#1C1C24] rounded-xl space-y-1">
            <span className="font-semibold text-white">Q: Does resizing break button accessibility?</span>
            <p className="text-[#92929D]">
              No. The window has an enforced minimum size of 780x620 and centers all interactive components with responsive packing.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Netlify Deployment */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00F5FF]" />
          5. Netlify Deployment Setup
        </h2>

        <div className="bg-[#0B0B0F] border border-[#1C1C24] rounded-xl p-5 space-y-4 text-xs text-[#92929D] leading-relaxed">
          <p>
            The project is pre-configured for direct Netlify hosting with <code className="text-[#00F5FF]">netlify.toml</code> and <code className="text-[#00F5FF]">public/_redirects</code>.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
              <span className="font-semibold text-white block mb-1">Option 1: Git Integration (Continuous Deployment)</span>
              <p>Push your repository to GitHub / GitLab, link it on <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-[#00F5FF] underline">app.netlify.com</a>. Netlify detects <code className="text-white">npm run build</code> and publishes the <code className="text-white">dist</code> folder automatically.</p>
            </div>

            <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
              <span className="font-semibold text-white block mb-1">Option 2: Netlify CLI (Terminal)</span>
              <pre className="bg-[#050505] p-2 rounded text-[#00FF88] font-mono mt-1 overflow-x-auto">
npm run build
npx netlify deploy --prod --dir=dist
              </pre>
            </div>

            <div className="p-3 bg-[#101014] border border-[#1C1C24] rounded-lg">
              <span className="font-semibold text-white block mb-1">Option 3: Netlify Drop (Drag & Drop)</span>
              <p>Run <code className="text-white">npm run build</code>, open <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-[#00F5FF] underline">app.netlify.com/drop</a>, and drag the generated <code className="text-[#00F5FF]">dist</code> folder into the drop zone.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
