import { useState } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'

function App() {
  const [htmlContent, setHtmlContent] = useState<string>('')

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#2c3e50] text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">Foundry VTT D&D 5e HTML Editor</h1>
      </header>
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <Editor onUpdate={setHtmlContent} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-muted">
          <Preview htmlContent={htmlContent} />
        </div>
      </div>
    </div>
  )
}

export default App

