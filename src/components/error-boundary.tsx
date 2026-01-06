'use client'
import React from 'react'
import { logger } from '../lib/logger'

export default class ErrorBoundary extends React.Component<{children:React.ReactNode},{hasError:boolean}> {
  constructor(props:any){ super(props); this.state = { hasError:false } }
  static getDerivedStateFromError(){ return { hasError: true } }
  componentDidCatch(error:any, info:any){ logger.error('ErrorBoundary caught', error, info) }
  render(){ if(this.state.hasError) return <div role="alert">Sorry — something went wrong.</div>
    return this.props.children
  }
}
