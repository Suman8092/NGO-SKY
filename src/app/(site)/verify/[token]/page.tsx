import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NgoRecordModel } from "@/models/NgoRecord";
import { requireNgoDatabase } from "@/lib/server/ngo/access";
import { documentValidity } from "@/lib/server/ngo/documents";
export const metadata: Metadata = { title: "Document verification", robots: { index:false,follow:false } };
export const dynamic = "force-dynamic";
export default async function VerificationPage({ params }: { params:Promise<{token:string}> }) {
  const {token}=await params; if(!/^[a-f0-9]{64}$/.test(token)) notFound();
  let result: { valid:boolean; reference:string; name:string; title:string; date:string; status:string } | null = null;
  let unavailable = false;
  try { await requireNgoDatabase(); const doc=await NgoRecordModel.findOne({verifyToken:token, module:{$in:["documents","certificates","letters","custom-receipts"]}}); if(doc) result={valid:await documentValidity(doc),reference:doc.reference,name:String(doc.data.name),title:String(doc.data.title??doc.data.type??"Document"),date:String(doc.data.date??""),status:doc.status}; } catch { unavailable=true; }
  return <main className="page-shell min-h-[70vh] pb-16 pt-40"><p className="eyebrow">Document verification</p><h1 className="mt-5 text-3xl font-semibold">{unavailable?"Verification temporarily unavailable":result?result.valid?"Verified foundation record":"This document is not currently valid":"No matching document"}</h1>{result?<dl className="mt-8 max-w-2xl divide-y divide-ink/15">{[["Reference",result.reference],["Recipient",result.name],["Document",result.title],["Issue date",result.date],["Status",result.valid?"Valid":"Not valid"]].map(([k,v])=><div key={k} className="grid gap-2 py-4 sm:grid-cols-2"><dt className="text-ink/60">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>:<p className="mt-5 text-ink/60">{unavailable?"Please retry later. No validity claim can be made while the register is unavailable.":"Check the QR code or contact the foundation with the printed reference."}</p>}<p className="mt-8 max-w-2xl text-sm leading-6 text-ink/60">This check confirms the current status of a record in the foundation register. Contact details, addresses, private correspondence and payment credentials are not published here.</p></main>;
}
