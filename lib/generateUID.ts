export function generateUID(role:string){

  const prefixes:any = {
    volunteer:"VOL",
    ngo:"NGO",
    donor:"DON",
    student:"STU",
    admin:"ADM",
    school:"SCH"
  };

  const prefix = prefixes[role] || "EDU";

  const random = crypto.randomUUID().slice(0,5).toUpperCase();

  return `${prefix}-${random}`;
}