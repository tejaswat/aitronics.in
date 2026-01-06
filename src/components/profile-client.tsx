'use client'
import React, { useEffect, useState, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../lib/supabase-provider'

export default function ProfileClient(){
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(!user) return
    setLoading(true)
    supabase.from('aitronics_storefront.orders').select('*,order_items(*)').eq('user_id', user.id).order('created_at', {ascending:false}).then((r: { data?: any[]; error?: any })=>{
      setOrders(r.data || [])
      setLoading(false)
    })
  },[user])

  if(!user) return <p>Please <a href="/auth/login">login</a> to see your profile.</p>

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <p>Logged in as: {user.email}</p>
          <p className="muted">User id: {user.id}</p>
        </div>
        <button className="button ghost" onClick={logout}>Logout</button>
      </div>
      <h3>Your orders</h3>
      {loading ? <p>Loading…</p> : (
        orders.length === 0 ? <p>No orders yet</p> : (
          <ul>
            {orders.map(o=> <li key={o.id}><a href={`/order/${o.id}`}>{o.id}</a> — {o.status} — ${(o.total/100).toFixed(2)}</li> )}
          </ul>
        )
      )}
    </div>
  )
}
