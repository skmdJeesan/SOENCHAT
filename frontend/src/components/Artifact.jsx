import { Code2, Copy, CopyCheck, Eye, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, easeInOut, motion } from "motion/react"
import { useState } from 'react'
import Editor from '@monaco-editor/react';

const Artifact = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedTab, setSelectedTab] = useState('code')
  const [selectedFile, setSelectedFile] = useState(0)
  const [copiedCode, setCopiedCode] = useState('')
  const { artifacts } = useSelector(state => state.message)
  const [artifactOpen, setArtifactOpen] = useState(false)
  if (artifacts.length == 0) return


  const file = artifacts[0]?.files[selectedFile]
  const htmlFile = artifacts[0]?.files?.find(f => f.name == 'index.html')
  const cssFile = artifacts[0]?.files?.find(f => f.name == 'style.css')
  const jsFile = artifacts[0]?.files?.find(f => f.name == 'script.js')

  const canPreview = htmlFile ? true : false

  const previewDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${cssFile.content || ''}</style>
    </head>
    <body>
      ${htmlFile.content || ''}
      <script>${jsFile.content || ''}</script>
    </body>
    </html>
  `

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const detectLanguage = (fileName) => {
    if (!fileName) return ''
    const lastDotIdx = fileName.lastIndexOf('.')
    if (lastDotIdx <= 0) return ''
    return fileName.substring(lastDotIdx + 1).toLowerCase()
  }

  const languageMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'rb': 'ruby'
  };

  function getFullLanguageName(fileName) {
    const ext = detectLanguage(fileName);
    return languageMap[ext] || ext;
  }

  const PanelContent = () => {
    return <>
      {!collapsed ? <div className="flex flex-col h-full w-full gap-2">
        {/* 1. */}
        <div className="w-full h-14 px-4 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setCollapsed(true)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize">
              <PanelRightClose size={18} />
            </button>
            <button onClick={() => setArtifactOpen(false)}
              className="flex lg:hidden items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize">
              <X size={18} />
            </button>
            <div className="text-[14px] font-medium text-slate-200 truncate capitalize">{artifacts[0]?.title.slice(0, 30)}..</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => handleCopyCode(file?.content)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
              {copiedCode == '' ? <Copy size={16} /> : <CopyCheck size={16} />}
            </button>
            {canPreview && <div className="flex items-center gap-1 p-1 rounded-lg bg-white/10">
              <button onClick={() => setSelectedTab('code')}
                className={`px-2 py-0.5 rounded-lg flex gap-1 items-center text-[14px] cursor-pointer
              ${selectedTab == 'code' ? 'bg-white/90 text-black' : 'hover:bg-white/10'}`}>
                <Code2 size={14} /> code
              </button>
              <button onClick={() => setSelectedTab('preview')}
                className={`px-2 py-0.5 rounded-lg flex gap-1 items-center text-[14px] cursor-pointer 
              ${selectedTab == 'preview' ? 'bg-white/90 text-black' : 'hover:bg-white/10'}`}>
                <Eye size={14} /> preview
              </button>
            </div>}
          </div>
        </div>
        {/* 2. */}
        {selectedTab == 'code' && <div className="flex ml-2 shrink-0 overflow-x-auto no-scrollbar p-1 rounded-lg bg-white/10 items-center gap-2 w-fit">
          {artifacts[0]?.files?.map((f, i) => (
            <button key={i} onClick={() => setSelectedFile(i)}
              className={`px-2 py-0.5 rounded-lg flex gap-1 items-center text-[14px] cursor-pointer 
              ${selectedFile == i ? 'bg-white/90 text-black' : 'hover:bg-white/10'}`}>
              {f.name}
            </button>
          ))}
        </div>}
        {/* 3. */}
        <div className="flex-1 overfow-hidden">
          {(selectedTab == 'preview' && canPreview)
            ? <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='w-full h-full'
            >
              <iframe
                title='preview' srcDoc={previewDoc}
                className='w-full h-full bg-white no-scrollbar'
                sandbox='allow-scripts'
              />
            </motion.div>
            : <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='w-full h-full'
            >
              <Editor
                theme='vs-dark'
                language={getFullLanguageName(file?.name)}
                value={file?.content}
                options={{
                  readOnly: true, minimap: { enabled: false }, fontSize: 14, wordWrap: 'on',
                  automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 16 },
                  lineNumbers: 'on', renderLineHighlight: 'none'
                }}
              />
            </motion.div>
          }
        </div>

      </div> : <div className='hidden lg:flex flex-col items-center justify-start gap-[35vh] h-full w-full py-3'>
        <button onClick={() => setCollapsed(false)}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
          hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize">
          <PanelRightOpen size={18} />
        </button>
        <div style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg' }}
          className="text-[12px] font-medium text-slate-600 uppercase tracking-widest whitespace-wrap">
          {artifacts[0]?.title.slice(0, 30)}..
        </div>
      </div>}
    </>
  }

  return (
    <>

      <button onClick={() => setArtifactOpen(true)}
        className='lg:hidden fixed top-4 right-2 z-50 flex gap-1 items-center justify-center px-2 py-1 rounded-lg text-black
        bg-white hover:bg-white/90 transition-colors duration-150 border-none cursor-pointer animate-pulse'>
        <Code2 size={15} /> 
        <div className="text-xs font-medium">view code</div>
      </button>
      <AnimatePresence>
        {artifactOpen && <>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.3}}
              onClick={() => setArtifactOpen(false)}
              className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
            />
            <motion.div
              initial={{x: "100%"}}
              animate={{x: 0}}
              exit={{x: "100%"}}
              transition={{duration: 0.35, ease: easeInOut}}
              className='lg:hidden fixed inset-y-0 z-50 right-0 bg-black/50 backdrop-blur-sm w-screen border-l border-white/8 overflow-hidden'
            
            >
              <PanelContent />
            </motion.div>
          </>
        }
      </AnimatePresence>

      <motion.div
        initial={{ width: 560 }}
        animate={{ width: collapsed ? 48 : 560 }}
        transition={{ duration: 0.25, ease: easeInOut }}
        className='hidden lg:flex h-full w-140 shrink-0 overflow-hidden bg-zinc-900 border-t border-l border-white/8 '>
        <PanelContent />
      </motion.div>
    </>
  )
}

export default Artifact