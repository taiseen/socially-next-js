import { currentUser } from "@clerk/nextjs/server";
import UnAuthSidebar from "./UnAuthSidebar";
import AuthSidebar from "./AuthSidebar";

const Sidebar = async () => {
  const authUser = await currentUser();

  if (!authUser) return <UnAuthSidebar />;

  return <AuthSidebar userId={authUser.id} />;
};

export default Sidebar;
