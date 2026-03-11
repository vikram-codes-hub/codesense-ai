import Editor from '@monaco-editor/react'
import { mockReviewFiles } from '../../utils/mockData'
import { useState } from 'react'
import { FileCode, AlertCircle } from 'lucide-react'
import { getScoreGrade } from '../../utils/mockData'

export default function FileViewer({ files = mockReviewFiles, issues = [] }) {
  const [selectedFile, setSelectedFile] = useState(files[0])

  const fileIssues = issues.filter(i => i.filename === selectedFile?.filename)

  const markers = fileIssues.map(issue => ({
    startLineNumber: issue.line || 1,
    endLineNumber: issue.line || 1,
    startColumn: issue.column || 1,
    endColumn: 100,
    message: `[${issue.severity.toUpperCase()}] ${issue.message}`,
    severity: issue.severity === 'critical' || issue.severity === 'high' ? 8 : 4,
  }))

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.setModelMarkers(editor.getModel(), 'codesense', markers)
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* ── File Tabs ───────────────────────────── */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)',
      }}>
        {files.map(file => {
          const isActive = selectedFile?._id === file._id
          const grade = file.score ? getScoreGrade(file.score) : null
          return (
            <button
              key={file._id}
              onClick={() => setSelectedFile(file)}
              style={{
                padding: '10px 16px',
                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: isActive ? 500 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <FileCode size={13} />
              {file.filename.split('/').pop()}
              {grade && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: grade.color,
                  background: `${grade.color}20`,
                  padding: '1px 5px', borderRadius: 4,
                }}>
                  {file.score}
                </span>
              )}
              {file.totalIssues > 0 && (
                <span style={{
                  fontSize: 10,
                  background: 'rgba(239,68,68,0.15)',
                  color: 'var(--critical)',
                  padding: '1px 5px', borderRadius: 4,
                }}>
                  {file.totalIssues}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── File Info Bar ───────────────────────── */}
      <div style={{
        padding: '6px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-tertiary)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          {selectedFile?.filename}
        </span>
        <span style={{ fontSize: 11, color: 'var(--accent)' }}>
          {selectedFile?.language}
        </span>
        {fileIssues.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--critical)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <AlertCircle size={11} /> {fileIssues.length} issues
          </span>
        )}
      </div>

      {/* ── Monaco Editor ───────────────────────── */}
      <div style={{ flex: 1, minHeight: 400 }}>
        <Editor
          height="100%"
          language={selectedFile?.language || 'javascript'}
          value={selectedFile?.content || '// No content available'}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            folding: true,
            wordWrap: 'on',
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  )
}