import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { STOPWATCH_PYTHON_CODE, TEST_PYTHON_CODE } from '../data/projectFiles';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'stopwatch' | 'test'>('stopwatch');
  const [copied, setCopied] = useState(false);

  const activeCode = selectedFile === 'stopwatch' ? STOPWATCH_PYTHON_CODE : TEST_PYTHON_CODE;
  const fileName = selectedFile === 'stopwatch' ? 'stopwatch.py' : 'test_stopwatch.py';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, name: string) => {
    const blob = new Blob([content], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadProjectBundle = async () => {
    const zip = new JSZip();
    zip.file('stopwatch.py', STOPWATCH_PYTHON_CODE);
    zip.file('test_stopwatch.py', TEST_PYTHON_CODE);

    // Fetch README from window location or static import
    const readmeBlob = await fetch('/README.md')
      .then((r) => r.text())
      .catch(() => '# Chrono Black Python Stopwatch');

    zip.file('README.md', readmeBlob);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ChronoBlack_Stopwatch_Project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = activeCode.split('\n');

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* File Selector & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C24] mb-4">
        {/* File tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFile('stopwatch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              selectedFile === 'stopwatch'
                ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/40'
                : 'text-[#92929D] hover:text-white bg-[#101014] border border-[#1C1C24]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            stopwatch.py (Main App)
          </button>

          <button
            onClick={() => setSelectedFile('test')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              selectedFile === 'test'
                ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/40'
                : 'text-[#92929D] hover:text-white bg-[#101014] border border-[#1C1C24]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            test_stopwatch.py (Unit Tests)
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-[#101014] hover:bg-[#1C1C24] text-[#92929D] hover:text-white border border-[#1C1C24] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF88]" />
                <span className="text-[#00FF88]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={() => downloadFile(activeCode, fileName)}
            className="px-3 py-1.5 bg-[#101014] hover:bg-[#1C1C24] text-[#00F5FF] border border-[#00F5FF]/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {fileName}</span>
          </button>

          <button
            onClick={downloadProjectBundle}
            className="px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-[#08080C] border border-[#1C1C24] rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-2 bg-[#0E0E14] border-b border-[#1C1C24] flex items-center justify-between text-xs font-mono text-[#737380]">
          <span>{fileName} — Python 3 Standard Library</span>
          <span>{lines.length} lines · UTF-8</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[580px] font-mono text-[13px] leading-relaxed selection:bg-[#00F5FF]/20">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-[#101017]">
                  <td className="w-12 pr-4 text-right select-none text-[#3E3E4D] text-xs">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre">
                    {formatSyntax(line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Lightweight syntax colorizer for Python keywords, comments, strings, and defs
 */
function formatSyntax(line: string): React.ReactNode {
  if (line.trim().startsWith('#')) {
    return <span className="text-[#6A7282] italic">{line}</span>;
  }
  if (line.trim().startsWith('"""') || line.trim().startsWith("'''")) {
    return <span className="text-[#6A7282] italic">{line}</span>;
  }

  // Highlight keywords
  const parts = line.split(/(\b(?:def|class|import|from|return|if|elif|else|while|for|in|try|except|as|None|True|False|self)\b|"[^"]*"|'[^']*')/g);

  return (
    <span>
      {parts.map((p, i) => {
        if (/^(def|class|return|if|elif|else|while|for|in|try|except|as)$/.test(p)) {
          return <span key={i} className="text-[#FF7B72] font-semibold">{p}</span>;
        }
        if (/^(import|from)$/.test(p)) {
          return <span key={i} className="text-[#D2A8FF] font-semibold">{p}</span>;
        }
        if (/^(True|False|None)$/.test(p)) {
          return <span key={i} className="text-[#79C0FF] font-semibold">{p}</span>;
        }
        if (p === 'self') {
          return <span key={i} className="text-[#FFA657] italic">{p}</span>;
        }
        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
          return <span key={i} className="text-[#A5D6FF]">{p}</span>;
        }
        return <span key={i} className="text-[#E6EDF3]">{p}</span>;
      })}
    </span>
  );
}
