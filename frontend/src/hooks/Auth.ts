import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";

const useHasPermission = () => {
  const { user } = useSelector(selectAuth);

  // Function to check if the user has a specific role
 const hasRole = (roles: string[]) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};


  // Example usage: check if user is admin
  const isAdmin = hasRole(["admin"]);

  return { hasRole, isAdmin };
};

export default useHasPermission;
