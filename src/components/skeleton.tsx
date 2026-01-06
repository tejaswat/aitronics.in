'use client'
import React from 'react'
export default function Skeleton({width='100%',height=12}:{width?:string,height?:number|string}){
  return <div className="skeleton" style={{width, height}} aria-hidden="true" />
}
