export const addActivityLog = async (details, session = null) => {
 const activityLog = await ActivityLog.create(
   [
     {
       actionType: "SYSTEM",
       performedBy: "SYSTEM",
       details,
     },
   ],
   session ? { session } : {}
 );
 return activityLog[0];
}