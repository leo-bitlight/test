import { createContext } from "react";

const AccountContext = createContext<{address: string, setAddress: any} | null>(null);

export default AccountContext