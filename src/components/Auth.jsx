import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
const Context = createContext(null);
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }) {
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const refresh=async()=>{setLoading(true);setError("");try{setUser(await apiFetch("/api/auth/me"))}catch(e){if(e.status===401)setUser(null);else setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{refresh();const expired=()=>setUser(null);window.addEventListener("session-expired",expired);return()=>window.removeEventListener("session-expired",expired)},[]);
  return <Context.Provider value={{user,setUser,loading,error,refresh}}>{children}</Context.Provider>;
}
export function Protected({role,children}) {
  const {user,loading,error,refresh}=useAuth();
  if(loading)return <p className="p-8">Loading your account…</p>;
  if(error)return <div className="p-8"><p role="alert">{error}</p><button onClick={refresh}>Try again</button></div>;
  if(!user)return <Navigate to="/login" replace/>;
  if(user.role!==role)return <Navigate to={`/${user.role}`} replace/>;
  return children;
}
export function Login(){
  const {user,setUser,loading,error:connectionError,refresh}=useAuth();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const navigate=useNavigate();
  if(loading)return <p className="p-8">Loading…</p>;
  if(user)return <Navigate to={`/${user.role}`} replace/>;
  const submit=async e=>{e.preventDefault();setBusy(true);setError("");try{const account=await apiFetch("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});setUser(account);navigate(`/${account.role}`,{replace:true})}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl border bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-blue-700">Welcome to ExamPortal</h1><p className="text-sm text-slate-600">Sign in with your teacher or student account.</p>{(error||connectionError)&&<p role="alert" className="text-sm text-red-700">{error||connectionError}</p>}{connectionError&&<button type="button" onClick={refresh}>Retry connection</button>}<label className="block text-sm font-semibold">Email<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded border px-3 py-3"/></label><label className="block text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded border px-3 py-3"/></label><button disabled={busy} className="w-full rounded bg-blue-700 py-3 font-bold text-white disabled:opacity-50">{busy?"Signing in…":"Sign in"}</button><p className="text-xs text-slate-500">Need an account? Contact your teacher or project administrator.</p></form></main>;
}

