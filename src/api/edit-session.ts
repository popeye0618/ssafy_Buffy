const oneTimePasswords = new Map<string,string>()
export const handoffEditPassword = (postId:string,password:string) => oneTimePasswords.set(postId,password)
export const takeEditPassword = (postId:string) => { const value=oneTimePasswords.get(postId)||'';oneTimePasswords.delete(postId);return value }
