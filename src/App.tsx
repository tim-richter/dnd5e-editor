import { useState } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import './styles/editor.css'

function App() {
  const [htmlContent, setHtmlContent] = useState<string>('')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Foundry VTT D&D 5e HTML Editor</h1>
      </header>
      <div className="app-content">
        <div className="editor-pane">
          <Editor onUpdate={setHtmlContent} />
        </div>
        <div className="preview-pane">
          <Preview htmlContent={htmlContent} />
        </div>
      </div>
    </div>
  )
}

export default App

