import React, { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGFM from 'remark-gfm'
import { ExternalLink, X, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const MessageBubble = ({ role, content, images }) => {
  const isUser = role === 'user'
  const imageList = Array.isArray(images) ? images : []
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`w-fit max-w-full md:max-w-[85%] px-4 py-2 rounded-2xl text-[16px] wrap-break-word leading-relaxed ${isUser ? 'bg-white/10 text-white rounded-tr-sm' : 'text-slate-200 rounded-tl-sm'}`}>
        {imageList.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {imageList.map((image, i) => (
              <img
                key={i}
                loading='lazy'
                src={image}
                onError={(e) => e.currentTarget.remove()}
                onClick={() => setLightBox(image)}
                className='w-40 h-28 rounded-xl object-cover object-center border border-white/8 cursor-zoom-in hover:opacity-90 transition'
              />
            ))}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGFM]}
          components={{
            h1: ({ children }) => <h1 className='text-2xl font-bold my-4'>{children}</h1>,
            h2: ({ children }) => <h2 className='text-xl font-semibold my-2'>{children}</h2>,
            h3: ({ children }) => <h3 className='text-lg font-semibold my-2'>{children}</h3>,
            p: ({ children }) => <p className='whitespace-pre-wrap wrap-break-word text-base mb-2'>{children}</p>,
            ul: ({ children }) => <ul className='list-disc pl-4 space-y-1 my-2'>{children}</ul>,
            ol: ({ children }) => <ol className='list-decimal pl-4 space-y-1 my-2'>{children}</ol>,
            table: ({ children }) => (
              <div className='overflow-x-auto my-4 rounded-md'>
                <table className='min-w-full border border-white/10 rounded-xl'>{children}</table>
              </div>
            ),
            th: ({ children }) => <th className='text-center px-2 py-2 border border-white/10 bg-white/5'>{children}</th>,
            td: ({ children }) => <td className='text-left px-2 py-2 border border-white/10'>{children}</td>,
            a: ({ href, children }) => (
              <a href={href} target='_blank' rel='noreferrer' className='text-indigo-400 underline inline-flex items-center gap-1'>
                {children}
                <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const match = /language-(\w+)/.exec(className || '')
              const codeText = String(children).replace(/\n$/, '')
              const isCopied = copiedCode === codeText

              if (match) {
                return (
                  <div className='relative mb-4 overflow-hidden'>
                    <h1 className="absolute left-6 top-2 z-10 uppercase text-lg font-semibold">{match[1]}</h1>
                    <button
                      type='button'
                      onClick={() => handleCopyCode(codeText)}
                      className='cursor-pointer absolute right-3 top-2 z-10 inline-flex items-center gap-1 rounded-full  px-3 py-1 text-xs text-slate-100 shadow-lg transition hover:bg-zinc-900'
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                    <SyntaxHighlighter
                      language={match[1]}
                      style={oneDark} showLineNumbers wrapLongLines
                      customStyle={{ margin: 0, paddingTop: '3rem', paddingLeft: '1rem', borderRadius: '1rem', background: '#0d1117' }}
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  </div>
                )
              }

              return (
                <code className='rounded bg-zinc-800 px-1 py-0.5 text-sm'>{children}</code>
              )
            },
            img: ({ src, alt }) => {
              if(!src) return null
              return <img  
                loading='lazy'
                src={src} alt={alt}
                onError={(e) => e.currentTarget.remove()}
                onClick={() => setLightBox(src)}
                className='w-80 h-56 rounded-xl object-cover object-center border border-white/8 cursor-zoom-in hover:opacity-90 transition'
              />
            },
          }}
        >
          {content}
        </Markdown>

        {lightBox && (
          <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6'>
            <button
              onClick={() => setLightBox(null)}
              className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2'
            >
              <X />
            </button>
            <img
              src={lightBox}
              className='max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble