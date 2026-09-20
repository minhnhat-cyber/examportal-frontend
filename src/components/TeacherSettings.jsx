import { useEffect, useState } from "react";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import { apiFetch } from "../lib/api";
import { ErrorMessage, inputClass, PageHeader } from "./TeacherUI";
export default function TeacherSettings(){
 const [profile,setProfile]=useState({name:"",email:"",role:"teacher",status:"active"}),[error,setError]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{apiFetch("/api/settings/teacher").then(setProfile).catch((e)=>setError(e.message))},[]);
 const submit=async(e)=>{e.preventDefault();setMessage("");try{const data=await apiFetch("/api/settings/teacher",{method:"PUT",body:JSON.stringify({name:profile.name})});setProfile(data);setMessage("Profile saved successfully.")}catch(err){setError(err.message)}};
 return <><PageHeader title="Teacher Settings" description="Update your basic teacher profile."/><ErrorMessage message={error}/>{message&&<div className="mb-5 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">{message}</div>}<form onSubmit={submit} className="max-w-2xl space-y-5 rounded border bg-white p-6"><label className="block text-sm font-semibold">Display name<input required value={profile.name} onChange={(e)=>setProfile({...profile,name:e.target.value})} className={inputClass}/></label><label className="block text-sm font-semibold">Email<input disabled value={profile.email} className={`${inputClass} bg-slate-100 text-slate-500`}/></label><div className="grid grid-cols-2 gap-4"><label className="text-sm font-semibold">Role<input disabled value={profile.role} className={`${inputClass} bg-slate-100 capitalize`}/></label><label className="text-sm font-semibold">Status<input disabled value={profile.status} className={`${inputClass} bg-slate-100 capitalize`}/></label></div><button className="flex items-center gap-2 rounded bg-blue-700 px-4 py-2.5 font-bold text-white"><SaveOutlined fontSize="small"/>Save Changes</button></form></>;
}
