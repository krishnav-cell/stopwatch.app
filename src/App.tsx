/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StopwatchSimulator } from './components/StopwatchSimulator';
import { CodeViewer } from './components/CodeViewer';
import { TestRunner } from './components/TestRunner';
import { DocumentationViewer } from './components/DocumentationViewer';
import { Download, Terminal, Clock, FileCode, CheckCircle2, BookOpen } from 'lucide-react';
import JSZip from 'jszip';
import { STOPWATCH_PYTHON_CODE, TEST_PYTHON_CODE } from './data/projectFiles';

type TabView = 'simulator' | 'code' | 'tests' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('simulator');

  const downloadFullProjectZip = async () => {
    const zip = new JSZip();
    zip.file('stopwatch.py', STOPWATCH_PYTHON_CODE);
    zip.file('test_stopwatch.py', TEST_PYTHON_CODE);

    try {
      const readmeRes = await fetch('/README.md');
      const readmeText = await readmeRes.text();
      zip.file('README.md', readmeText);
    } catch {
      zip.file('README.md', '# Chrono Black Stopwatch');
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ChronoBlack_Python_Stopwatch.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#00F5FF]/30 selection:text-white">
      {/* 
        Top Bar Contract (Section 2 of Frontend Design Constitution):
        [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#1C1C24] bg-[#07070A] sticky top-0 z-50">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF]" />
          <button
            onClick={() => setActiveTab('simulator')}
            className="text-base font-extrabold tracking-wider text-white whitespace-nowrap hover:text-[#00F5FF] transition-colors"
          >
            CHRONO STOPWATCH
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-[#92929D] overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'text-[#00F5FF] font-semibold border-b-2 border-[#00F5FF]'
                : 'hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Stopwatch
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'text-[#00F5FF] font-semibold border-b-2 border-[#00F5FF]'
                : 'hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Python Code
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'text-[#00F5FF] font-semibold border-b-2 border-[#00F5FF]'
                : 'hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Test Suite
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'text-[#00F5FF] font-semibold border-b-2 border-[#00F5FF]'
                : 'hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Download Complete Submission ZIP) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={downloadFullProjectZip}
            className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#00F5FF] hover:bg-[#33F7FF] shadow-[0_0_12px_rgba(0,245,255,0.4)] rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4 max-w-7xl w-full mx-auto">
        {activeTab === 'simulator' && <StopwatchSimulator />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'tests' && <TestRunner />}
        {activeTab === 'docs' && <DocumentationViewer />}
      </main>

      {/* Clean, Quiet Academic Project Footer */}
      <footer className="border-t border-[#1C1C24] py-4 px-6 text-center text-xs text-[#555562] bg-[#07070A] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>CHRONO BLACK</span>
          <span aria-hidden="true">·</span>
          <span>College Computer Science Project</span>
          <span aria-hidden="true">·</span>
          <span>Tkinter & time.perf_counter()</span>
        </div>
        <div className="font-mono text-[11px] text-[#737380]">
          Execution: <span className="text-[#00FF88]">python stopwatch.py</span>
        </div>
      </footer>
    </div>
  );
}
