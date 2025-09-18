import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './global.css'
import RichEditor from './RichEditor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RichEditor />
  </StrictMode>,
)
