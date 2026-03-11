export function generateUID(role: string) {
  const prefixMap: Record<string, string> = {
    student: "STU",
    school: "SCH",
    volunteer: "VOL",
    ngo: "NGO",
    donor: "DON",
    admin: "ADM",
  }

  const prefix = prefixMap[role] || "USR"

  const random = Math.floor(100000 + Math.random() * 900000)

  return `EDU-${prefix}-${random}`
}
